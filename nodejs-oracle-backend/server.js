const express = require("express");
const oracledb = require("oracledb");
const dotenv = require("dotenv");
const cors = require("cors");
const nodemailer = require("nodemailer");
const validator = require("email-validator");
const QRCode = require("qrcode");
const moment = require("moment-timezone");
dotenv.config();
const app = express();
const port = process.env.PORT || 8080;
app.use(cors());
app.use(express.json());
// Initialize Oracle client
try {
  oracledb.initOracleClient({ libDir: process.env.ORACLE_CLIENT_PATH });
  console.log("Oracle Instant Client initialized successfully");
} catch (err) {
  console.error("Error initializing Oracle Instant Client:", err);
  process.exit(1);
}
// Initialize database connection pool
async function initializeDb() {
  try {
    await oracledb.createPool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECTSTRING,
      poolMax: 10,
      poolMin: 2,
      poolIncrement: 2,
      poolTimeout: 60,
    });
    console.log("Oracle connection pool initialized successfully");
  } catch (err) {
    console.error("Failed to create connection pool:", err);
    process.exit(1);
  }
}
// Helper function to execute database queries
async function executeQuery(query, params = [], options = {}) {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const result = await connection.execute(query, params, options);
    return result;
  } catch (err) {
    console.error("Database query error:", err);
    throw err;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}

// Helper function to generate a random number between min and max
const generateRandomId = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Helper function to check if a RESERVERID already exists
const checkReserveIdExists = async (id) => {
  const result = await executeQuery(
    `SELECT COUNT(*) as count FROM RESERVE WHERE RESERVERID = :1`,
    [id],
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  return result.rows[0].COUNT > 0;
};

// Helper function to generate a unique random RESERVERID
const generateUniqueReserveId = async () => {
  const MIN_ID = 100000; // 6-digit number start
  const MAX_ID = 999999; // 6-digit number end
  let id;
  let exists;

  do {
    id = generateRandomId(MIN_ID, MAX_ID);
    exists = await checkReserveIdExists(id);
  } while (exists);

  return id;
};
// Members Routes
app.get("/members", async (req, res) => {
  try {
    const result = await executeQuery(
      `SELECT e.SSN, e.FNAME, e.LNAME, e.EMAIL, d.Dname, p.Pname, s.STATUSEMPNAME, e.DNO, e.PNO, e.STUEMP
       FROM EMPLOYEE e
       JOIN DEPARTMENT d ON e.DNO = d.Dnumber
       JOIN POSITION p ON e.PNO = p.Pnumber
       JOIN STATUSEMP s ON e.STUEMP = s.STATUSEMPID`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json(result.rows);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error fetching members", details: err.message });
  }
});
// Department Routes
app.get("/departments", async (req, res) => {
  try {
    const result = await executeQuery(
      `SELECT DNUMBER, DNAME FROM DEPARTMENT`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json(result.rows);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error fetching departments", details: err.message });
  }
});
// Position Routes
app.get("/positions", async (req, res) => {
  try {
    const result = await executeQuery(
      `SELECT PNUMBER, PNAME FROM POSITION`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json(result.rows);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error fetching positions", details: err.message });
  }
});
// Status Employee Routes
app.get("/statusemps", async (req, res) => {
  try {
    const result = await executeQuery(
      `SELECT STATUSEMPID, STATUSEMPNAME FROM STATUSEMP`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json(result.rows);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error fetching statusemps", details: err.message });
  }
});
// Add Member Route
app.post("/addmembers", async (req, res) => {
  const { FNAME, LNAME, EMAIL, DNO, PNO, STUEMP, PW } = req.body;

  try {
    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(EMAIL)) {
      return res.status(400).json({
        error: "invalid_email",
        message: "กรุณาใส่อีเมลที่ถูกต้อง เช่น example@email.com",
      });
    }

    // Check for duplicate email
    const emailCheck = await executeQuery(
      `SELECT COUNT(*) as count FROM EMPLOYEE WHERE EMAIL = :1`,
      [EMAIL],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (emailCheck.rows[0].COUNT > 0) {
      return res.status(400).json({
        error: "duplicate_email",
        message: "อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่น",
      });
    }

    // Get next available SSN that doesn't exist
    const ssnResult = await executeQuery(
      `SELECT MIN(t1.SSN + 1) as next_ssn
       FROM EMPLOYEE t1
       WHERE NOT EXISTS (
         SELECT 1 
         FROM EMPLOYEE t2 
         WHERE t2.SSN = t1.SSN + 1
       )`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    let nextSSN = ssnResult.rows[0].NEXT_SSN;
    if (!nextSSN) {
      // If no gaps found, get max + 1
      const maxResult = await executeQuery(
        `SELECT NVL(MAX(SSN), 0) + 1 as max_ssn FROM EMPLOYEE`,
        [],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      nextSSN = maxResult.rows[0].MAX_SSN;
    }

    // Insert new employee with the guaranteed unique SSN
    await executeQuery(
      `INSERT INTO EMPLOYEE (SSN, FNAME, LNAME, EMAIL, DNO, PNO, STUEMP, PW)
       VALUES (:1, :2, :3, :4, :5, :6, :7, :8)`,
      [nextSSN, FNAME, LNAME, EMAIL, DNO, PNO, STUEMP, PW],
      { autoCommit: true }
    );

    res.status(201).json({
      message: "เพิ่มสมาชิกเรียบร้อยแล้ว",
      SSN: nextSSN,
    });
  } catch (err) {
    console.error("Error adding member:", err);
    res.status(500).json({
      error: "error_adding_member",
      message: "เกิดข้อผิดพลาดในการเพิ่มสมาชิก",
      details: err.message,
    });
  }
});
// Update Member Route
app.put("/updatemembers/:id", async (req, res) => {
  const { id } = req.params;
  const { FNAME, LNAME, EMAIL, DNO, PNO, STUEMP, PW } = req.body;
  try {
    let updateQuery = `UPDATE EMPLOYEE SET FNAME = :1, LNAME = :2, EMAIL = :3, DNO = :4, PNO = :5, STUEMP = :6`;
    let params = [FNAME, LNAME, EMAIL, DNO, PNO, STUEMP];
    if (PW && PW.trim() !== "") {
      updateQuery += `, PW = :7`;
      params.push(PW); // Store password directly
    }
    updateQuery += ` WHERE SSN = :${params.length + 1}`;
    params.push(id);
    const result = await executeQuery(updateQuery, params, {
      autoCommit: true,
    });
    if (result.rowsAffected && result.rowsAffected > 0) {
      const updatedMember = await executeQuery(
        `SELECT e.SSN, e.FNAME, e.LNAME, e.EMAIL, d.Dname, p.Pname, s.STATUSEMPNAME, e.DNO, e.PNO, e.STUEMP
         FROM EMPLOYEE e
         JOIN DEPARTMENT d ON e.DNO = d.Dnumber
         JOIN POSITION p ON e.PNO = p.Pnumber
         JOIN STATUSEMP s ON e.STUEMP = s.STATUSEMPID
         WHERE e.SSN = :1`,
        [id],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      res.json({
        message: "Member updated successfully",
        updatedMember: updatedMember.rows[0],
      });
    } else {
      res.status(404).json({ error: "Member not found or no changes made" });
    }
  } catch (err) {
    console.error("Error updating member:", err);
    res
      .status(500)
      .json({ error: "Error updating member", details: err.message });
  }
});

// Room Routes
app.get("/room", async (req, res) => {
  try {
    const result = await executeQuery(
      `SELECT c.CFRNUMBER, c.CFRNAME, b.BDNAME, f.FLNAME, r.RTNAME, s.STATUSROOMNAME, c.CAPACITY, c.BDNUM, c.FLNUM, c.RTNUM, c.STUROOM
       FROM CONFERENCEROOM c
       JOIN ROOMTYPE r ON c.RTNUM = r.Rtnumber
       JOIN FLOOR f ON c.FLNUM = f.Flnumber
       JOIN BUILDING b ON c.BDNUM = b.Bdnumber
       JOIN STATUSROOM s ON c.STUROOM = s.STATUSROOMID`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json(result.rows);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error fetching rooms", details: err.message });
  }
});

app.get("/rooms", async (req, res) => {
  const { buildingId, floorId, participants } = req.query;
  try {
    let query = `
      SELECT c.CFRNUMBER, c.CFRNAME, b.BDNAME, f.FLNAME, r.RTNAME, 
             s.STATUSROOMNAME, c.CAPACITY, c.BDNUM, c.FLNUM, c.RTNUM, c.STUROOM
      FROM CONFERENCEROOM c
      JOIN ROOMTYPE r ON c.RTNUM = r.Rtnumber
      JOIN FLOOR f ON c.FLNUM = f.Flnumber
      JOIN BUILDING b ON c.BDNUM = b.Bdnumber
      JOIN STATUSROOM s ON c.STUROOM = s.STATUSROOMID
      WHERE 1=1
      AND c.STUROOM = 1 
    `;

    const params = [];

    // Always filter by capacity if participants is provided
    if (participants) {
      query += ` AND c.CAPACITY >= :participants`;
      params.push(participants);
    }

    if (buildingId) {
      query += ` AND c.BDNUM = :buildingId`;
      params.push(buildingId);
    }

    if (floorId) {
      query += ` AND c.FLNUM = :floorId`;
      params.push(floorId);
    }

    const result = await executeQuery(query, params, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching rooms:", err);
    res.status(500).json({
      error: "Error fetching rooms",
      details: err.message,
    });
  }
});

// Building Routes
app.get("/buildings", async (req, res) => {
  try {
    const result = await executeQuery(
      `SELECT BDNUMBER, BDNAME FROM BUILDING`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json(result.rows);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error fetching buildings", details: err.message });
  }
});
// Floor Routes
app.get("/floors", async (req, res) => {
  const { buildingId } = req.query;
  try {
    let query = `
      SELECT DISTINCT f.FLNUMBER, f.FLNAME 
      FROM FLOOR f
      JOIN SETROOM s ON f.FLNUMBER = s.FLNUM
      WHERE s.BDNUM = :1
      ORDER BY f.FLNUMBER`;

    const result = await executeQuery(query, [buildingId], {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({
      error: "Error fetching floors",
      details: err.message,
    });
  }
});
// Room Type Routes
app.get("/roomtypes", async (req, res) => {
  try {
    const result = await executeQuery(
      `SELECT RTNUMBER, RTNAME FROM ROOMTYPE`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json(result.rows);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error fetching roomtypes", details: err.message });
  }
});
// Status Room Routes
app.get("/statusrooms", async (req, res) => {
  try {
    const result = await executeQuery(
      `SELECT STATUSROOMID, STATUSROOMNAME FROM STATUSROOM`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json(result.rows);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error fetching statusrooms", details: err.message });
  }
});
// Add Room Route
app.post("/addroom", async (req, res) => {
  const { CFRNAME, BDNUM, FLNUM, RTNUM, STUROOM, CAPACITY } = req.body;
  try {
    // Get next CFRNUMBER
    const roomResult = await executeQuery(
      `SELECT NVL(MAX(CFRNUMBER), 0) + 1 as next_room FROM CONFERENCEROOM`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const nextRoomNumber = roomResult.rows[0].NEXT_ROOM;

    await executeQuery(
      `INSERT INTO CONFERENCEROOM (CFRNUMBER, CFRNAME, BDNUM, FLNUM, RTNUM, STUROOM, CAPACITY)
       VALUES (:1, :2, :3, :4, :5, :6, :7)`,
      [nextRoomNumber, CFRNAME, BDNUM, FLNUM, RTNUM, STUROOM, CAPACITY],
      { autoCommit: true }
    );
    res.status(201).json({
      message: "เพิ่มห้องประชุมสำเร็จ",
      CFRNUMBER: nextRoomNumber,
    });
  } catch (err) {
    res.status(500).json({
      error: "error_adding_room",
      message: "เกิดข้อผิดพลาดในการเพิ่มห้องประชุม",
      details: err.message,
    });
  }
});
// Update Room Route
app.put("/updateroom/:id", async (req, res) => {
  const { id } = req.params;
  const { CFRNAME, BDNUM, FLNUM, RTNUM, STUROOM, CAPACITY } = req.body;
  try {
    await executeQuery(
      `UPDATE CONFERENCEROOM SET CFRNAME = :1, BDNUM = :2, FLNUM = :3, RTNUM = :4, STUROOM = :5, CAPACITY = :6 
       WHERE CFRNUMBER = :7`,
      [CFRNAME, BDNUM, FLNUM, RTNUM, STUROOM, CAPACITY, id],
      { autoCommit: true }
    );
    res.json({ message: "Room updated successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error updating room", details: err.message });
  }
});
// Delete Room Route
app.delete("/deleteroom/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await executeQuery(
      "DELETE FROM CONFERENCEROOM WHERE CFRNUMBER = :1",
      [id],
      {
        autoCommit: true,
      }
    );
    res.json({ message: "Room deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error deleting room", details: err.message });
  }
});

// Booking Routes
app.get("/user-bookings/:ssn", async (req, res) => {
  const { ssn } = req.params;
  try {
    const result = await executeQuery(
      `SELECT r.RESERVERID, r.BDATE, r.STARTTIME, r.ENDTIME, r.STUBOOKING, 
              r.CFRNUM, r.QR, r.TIME, c.CFRNAME
       FROM RESERVE r
       JOIN CONFERENCEROOM c ON r.CFRNUM = c.CFRNUMBER
       WHERE r.ESSN = :ssn
       ORDER BY r.BDATE DESC, r.STARTTIME DESC`,
      [ssn],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching user bookings:", err);
    res.status(500).json({
      error: "Error fetching user bookings",
      details: err.message,
    });
  }
});

app.post("/reset-reserve-sequence", async (req, res) => {
  try {
    // Drop existing sequence
    await executeQuery("DROP SEQUENCE RESERVERID_SEQ", [], {
      autoCommit: true,
    });

    // Create new sequence starting from 1
    await executeQuery(
      "CREATE SEQUENCE RESERVERID_SEQ START WITH 1 INCREMENT BY 1",
      [],
      { autoCommit: true }
    );

    res.json({ message: "Sequence reset successfully" });
  } catch (err) {
    console.error("Error resetting sequence:", err);
    res.status(500).json({
      error: "Error resetting sequence",
      details: err.message,
    });
  }
});

// Book Room Route
app.post("/book-room", async (req, res) => {
  const { date, startTime, endTime, room, essn } = req.body;
  try {
    const isBlacklisted = await checkUserBlacklist(essn);
    if (isBlacklisted) {
      return res.status(403).json({
        success: false,
        error: "ไม่สามารถจองห้องได้เนื่องจากคุณอยู่ในบัญชีดำ",
      });
    }

    // Check for overlapping bookings
    const hasOverlap = await checkOverlappingBookings(
      date,
      startTime,
      endTime,
      room
    );
    if (hasOverlap) {
      return res.status(409).json({
        success: false,
        error: "ห้องถูกจองในช่วงเวลานี้แล้ว",
      });
    }
    // Check if the room is VIP
    const roomResult = await executeQuery(
      `SELECT c.RTNUM, c.CFRNAME 
       FROM CONFERENCEROOM c 
       WHERE c.CFRNUMBER = :1`,
      [room],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (!roomResult.rows[0]) {
      return res.status(404).json({
        success: false,
        error: "ไม่พบข้อมูลห้อง",
      });
    }

    const isVIP = roomResult.rows[0].RTNUM === 2;
    const initialStatus = isVIP ? 4 : 1;

    const nextBookingId = await generateUniqueReserveId();
    const qrCode = `QR${Date.now()}`;

    await executeQuery(
      `INSERT INTO RESERVE (RESERVERID, BDATE, STARTTIME, ENDTIME, CFRNUM, STUBOOKING, ESSN, QR)
       VALUES (:1, TO_DATE(:2, 'YYYY-MM-DD'), 
               TO_TIMESTAMP(:3, 'YYYY-MM-DD HH24:MI:SS'), 
               TO_TIMESTAMP(:4, 'YYYY-MM-DD HH24:MI:SS'), 
               :5, :6, :7, :8)`,
      [
        nextBookingId,
        date,
        `${date} ${startTime}`,
        `${date} ${endTime}`,
        room,
        initialStatus,
        essn,
        qrCode,
      ],
      { autoCommit: true }
    );

    const bookingResult = await executeQuery(
      `SELECT r.RESERVERID, r.BDATE, r.STARTTIME, r.ENDTIME, 
              r.CFRNUM, r.STUBOOKING, r.ESSN, r.QR, c.CFRNAME, c.RTNUM
       FROM RESERVE r
       JOIN CONFERENCEROOM c ON r.CFRNUM = c.CFRNUMBER
       WHERE r.RESERVERID = :1`,
      [nextBookingId],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (!bookingResult.rows[0]) {
      throw new Error("ไม่สามารถสร้างการจองได้");
    }

    res.status(201).json({
      success: true,
      ...bookingResult.rows[0],
      isVIP,
      message: isVIP
        ? "การจองห้อง VIP อยู่ระหว่างรอการอนุมัติ"
        : "จองห้องสำเร็จ",
    });
  } catch (err) {
    console.error("Error creating booking:", err);
    res.status(500).json({
      success: false,
      error: "เกิดข้อผิดพลาดในการจอง",
      details: err.message,
    });
  }
});

// Menu Routes
app.get("/menus", async (req, res) => {
  try {
    const result = await executeQuery(`SELECT mnumber, mname FROM menu`, [], {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });
    res.json(result.rows);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error fetching menus", details: err.message });
  }
});
// Access Menu Routes
app.get("/accessmenus", async (req, res) => {
  try {
    const result = await executeQuery(
      `SELECT a.no, p.Pname, m.mname, a.Pnum, a.Mnum
       FROM accessmenu a
       JOIN POSITION p ON a.Pnum = p.Pnumber
       JOIN menu m ON a.Mnum = m.Mnumber`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json(result.rows);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error fetching access menus", details: err.message });
  }
});
app.post("/accessmenus", async (req, res) => {
  const { PNUM, MNUM } = req.body;
  try {
    const maxNoResult = await executeQuery(
      "SELECT MAX(NO) as MAX_NO FROM accessmenu",
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const maxNo = maxNoResult.rows[0].MAX_NO || 0;
    const newNo = maxNo + 1;
    await executeQuery(
      `INSERT INTO accessmenu (NO, Pnum, Mnum) VALUES (:1, :2, :3)`,
      [newNo, PNUM, MNUM],
      { autoCommit: true }
    );
    res
      .status(201)
      .json({ message: "Access menu added successfully", NO: newNo });
  } catch (error) {
    console.error("Error adding access menu:", error);
    res
      .status(500)
      .json({ error: "Error adding access menu", details: error.message });
  }
});
app.put("/accessmenus/:id", async (req, res) => {
  const { id } = req.params;
  const { Pnum, Mnum } = req.body;
  try {
    await executeQuery(
      `UPDATE accessmenu SET Pnum = :1, Mnum = :2 WHERE no = :3`,
      [Pnum, Mnum, id],
      { autoCommit: true }
    );
    res.json({ message: "Access menu updated successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error updating access menu", details: err.message });
  }
});
app.delete("/accessmenus/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await executeQuery(`DELETE FROM accessmenu WHERE no = :1`, [id], {
      autoCommit: true,
    });
    res.json({ message: "Access menu deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error deleting access menu", details: err.message });
  }
});
app.delete("/accessmenus/:pnum", async (req, res) => {
  const { pnum } = req.params;
  try {
    await executeQuery(`DELETE FROM accessmenu WHERE pnum = :1`, [pnum], {
      autoCommit: true,
    });
    res.json({ message: "Access menu deleted successfully" });
  } catch (err) {
    res.status(500).json({
      error: "Error deleting access menu",
      details: err.message,
    });
  }
});
app.delete("/accessmenus/position/:pnum", async (req, res) => {
  const { pnum } = req.params;
  try {
    await executeQuery(`DELETE FROM accessmenu WHERE pnum = :1`, [pnum], {
      autoCommit: true,
    });
    res.json({
      success: true,
      message: "Access menu deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting access menu:", err);
    res.status(500).json({
      success: false,
      error: "Error deleting access menu",
      details: err.message,
    });
  }
});
// Email Route
app.post("/send-email", async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!validator.validate(email)) {
    return res.status(400).json({ error: "Invalid email address" });
  }
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  try {
    let info = await transporter.sendMail({
      from: `"${name}" <${process.env.EMAIL_USER}>`,
      to: "mindenrymmd@gmail.com",
      subject: subject,
      text: `From: ${name} (${email})\n\nMessage: ${message}`,
      html: `<p><strong>From:</strong> ${name} (${email})</p><p><strong>Message:</strong> ${message}</p>`,
    });
    console.log("Message sent: %s", info.messageId);
    res
      .status(200)
      .json({ message: "Email sent successfully", messageId: info.messageId });
  } catch (error) {
    console.error("Error sending email:", error);
    res
      .status(500)
      .json({ error: "Error sending email", details: error.message });
  }
});
// Login Route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await executeQuery(
      `SELECT e.SSN, e.EMAIL, e.PW, e.FNAME, e.LNAME, e.DNO, e.PNO, e.STUEMP,
              p.PNAME as POSITION, d.DNAME as DEPARTMENT
       FROM EMPLOYEE e
       JOIN POSITION p ON e.PNO = p.PNUMBER
       JOIN DEPARTMENT d ON e.DNO = d.DNUMBER
       WHERE e.EMAIL = :1`,
      [email],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
    }
    const user = result.rows[0];

    if (user.STUEMP === 2) {
      return res
        .status(403)
        .json({ error: "ไม่สามารถเข้าสู่ระบบได้เนื่องจากสถานะลาออก" });
    }

    if (password === user.PW) {
      delete user.PW;
      return res.json({
        success: true,
        user: {
          ssn: user.SSN,
          email: user.EMAIL,
          firstName: user.FNAME,
          lastName: user.LNAME,
          position: user.POSITION,
          department: user.DEPARTMENT,
          departmentNo: user.DNO,
          positionNo: user.PNO,
          status: user.STUEMP,
        },
      });
    } else {
      return res.status(401).json({ error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
    }
  } catch (err) {
    console.error("Login error:", err);
    res
      .status(500)
      .json({ error: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ", details: err.message });
  }
});
app.get("/history", async (req, res) => {
  try {
    const result = await executeQuery(
      `SELECT r.RESERVERID, c.CFRNAME, r.BDATE, r.STARTTIME, r.ENDTIME, r.STUBOOKING, r.QR
       FROM RESERVE r
       JOIN CONFERENCEROOM c ON r.CFRNUM = c.CFRNUMBER
       ORDER BY r.RESERVERID ASC`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json(result.rows);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error fetching history", details: err.message });
  }
});

app.post("/cancel/:reserverId/:cfrNum", async (req, res) => {
  const { reserverId, cfrNum } = req.params;
  const { reason, empId } = req.body;

  let connection;
  try {
    connection = await oracledb.getConnection();

    // First check if the booking exists and hasn't been cancelled
    const bookingCheck = await connection.execute(
      `SELECT STUBOOKING 
       FROM RESERVE 
       WHERE RESERVERID = :1 
       AND CFRNUM = :2`,
      [reserverId, cfrNum],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (bookingCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "ไม่พบการจองที่ต้องการยกเลิก",
      });
    }

    if (bookingCheck.rows[0].STUBOOKING === 5) {
      return res.status(400).json({
        success: false,
        error: "การจองนี้ถูกยกเลิกไปแล้ว",
      });
    }

    // Update booking status
    await connection.execute(
      `UPDATE RESERVE 
       SET STUBOOKING = 5
       WHERE RESERVERID = :1 
       AND CFRNUM = :2`,
      [reserverId, cfrNum],
      { autoCommit: false }
    );

    // Generate next CANCLEID
    const cancelIdResult = await connection.execute(
      `SELECT NVL(MAX(CANCLEID), 0) + 1 as NEXT_ID FROM CANCLEROOM`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const nextCancelId = cancelIdResult.rows[0].NEXT_ID;

    // Insert cancellation reason
    await connection.execute(
      `INSERT INTO CANCLEROOM (CANCLEID, REASON, RESID, EMPID)
       VALUES (:1, :2, :3, :4)`,
      [nextCancelId, reason, reserverId, empId],
      { autoCommit: false }
    );

    // If everything is successful, commit the transaction
    await connection.commit();

    res.json({
      success: true,
      message: "ยกเลิกการจองเรียบร้อยแล้ว",
    });
  } catch (err) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackErr) {
        console.error("Error rolling back:", rollbackErr);
      }
    }
    console.error("Error cancelling booking:", err);
    res.status(500).json({
      success: false,
      error: "เกิดข้อผิดพลาดในการยกเลิกการจอง",
      details: err.message,
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
});

app.post("/confirm-usage/:reserverId/:cfrNum", async (req, res) => {
  const { reserverId, cfrNum } = req.params;

  try {
    const currentTime = moment()
      .tz("Asia/Bangkok")
      .format("YYYY-MM-DD HH:mm:ss");

    const result = await executeQuery(
      `UPDATE RESERVE
       SET STUBOOKING = 3,
           TIME = TO_TIMESTAMP(:1, 'YYYY-MM-DD HH24:MI:SS')  -- บันทึกเวลาในรูปแบบที่ต้องการ
       WHERE RESERVERID = :2
       AND CFRNUM = :3
       AND STUBOOKING = 1`,
      [currentTime, reserverId, cfrNum],
      {
        autoCommit: true,
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        error: "ไม่พบการจองที่สามารถยืนยันได้",
      });
    }

    res.json({
      success: true,
      message: "ยืนยันการใช้ห้องเรียบร้อยแล้ว",
    });
  } catch (err) {
    console.error("Error confirming room usage:", err);
    res.status(500).json({
      success: false,
      error: "เกิดข้อผิดพลาดในการยืนยันการใช้ห้อง",
      details: err.message,
    });
  }
});

app.get("/room-status/:reserverId/:roomId", async (req, res) => {
  const { reserverId, roomId } = req.params;

  try {
    const result = await executeQuery(
      `SELECT r.STUBOOKING, r.BDATE, r.STARTTIME, r.ENDTIME, c.CFRNAME,
              CASE 
                WHEN r.STUBOOKING = 3 THEN 'used'
                WHEN r.STUBOOKING = 5 THEN 'cancelled'
                ELSE 'available'
              END as status
       FROM RESERVE r
       JOIN CONFERENCEROOM c ON r.CFRNUM = c.CFRNUMBER
       WHERE r.RESERVERID = :1 AND r.CFRNUM = :2`,
      [reserverId, roomId],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "ไม่พบข้อมูลการจอง",
      });
    }

    res.json({
      success: true,
      ...result.rows[0],
    });
  } catch (err) {
    console.error("Error checking room status:", err);
    res.status(500).json({
      success: false,
      error: "เกิดข้อผิดพลาดในการตรวจสอบสถานะห้อง",
      details: err.message,
    });
  }
});

app.get("/admin-bookings", async (req, res) => {
  const { roomId } = req.query;
  try {
    let query = `
      SELECT r.RESERVERID, r.ESSN, r.CFRNUM, r.BDATE, r.STARTTIME, r.ENDTIME, 
             r.TIME, r.STUBOOKING, c.CFRNAME
      FROM RESERVE r
      JOIN CONFERENCEROOM c ON r.CFRNUM = c.CFRNUMBER
      WHERE 1=1
    `;

    const params = [];
    if (roomId) {
      query += ` AND r.CFRNUM = :1`;
      params.push(roomId);
    }

    query += ` ORDER BY r.BDATE DESC`;

    const result = await executeQuery(query, params, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching admin bookings:", err);
    res.status(500).json({
      error: "Error fetching admin bookings",
      details: err.message,
    });
  }
});

app.post("/confirm-usage/:reserverId/:roomId", async (req, res) => {
  const { reserverId, roomId } = req.params;

  try {
    // Check existing booking status
    const bookingCheck = await executeQuery(
      `SELECT STUBOOKING FROM RESERVE WHERE RESERVERID = :1 AND CFRNUM = :2`,
      [reserverId, roomId],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (!bookingCheck.rows[0]) {
      return res.status(404).json({
        success: false,
        error: "ไม่พบข้อมูลการจอง",
      });
    }

    if (
      bookingCheck.rows[0].STUBOOKING !== 1 &&
      bookingCheck.rows[0].STUBOOKING !== 4
    ) {
      return res.status(400).json({
        success: false,
        error: "ไม่สามารถยืนยันการใช้ห้องได้ เนื่องจากสถานะไม่ถูกต้อง",
      });
    }

    // Update booking status and TIME using SYSTIMESTAMP with autoCommit
    const result = await executeQuery(
      `UPDATE RESERVE 
       SET STUBOOKING = 3, 
           TIME = SYSTIMESTAMP
       WHERE RESERVERID = :1 
       AND CFRNUM = :2`,
      [reserverId, roomId],
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        error: "ไม่สามารถอัพเดทข้อมูลการจองได้",
      });
    }

    // Fetch the updated booking with the new timestamp
    const updatedBooking = await executeQuery(
      `SELECT RESERVERID, CFRNUM, 
              TO_CHAR(TIME, 'YYYY-MM-DD HH24:MI:SS') as TIME,
              STUBOOKING 
       FROM RESERVE 
       WHERE RESERVERID = :1 AND CFRNUM = :2`,
      [reserverId, roomId],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.json({
      success: true,
      message: "ยืนยันการใช้ห้องเรียบร้อยแล้ว",
      booking: updatedBooking.rows[0],
    });
  } catch (err) {
    console.error("Error confirming room usage:", err);
    res.status(500).json({
      success: false,
      error: "เกิดข้อผิดพลาดในการยืนยันการใช้ห้อง",
      details: err.message,
    });
  }
});

// Endpoint to get cancellation reason
app.get("/cancel-reason/:reserveId", async (req, res) => {
  const { reserveId } = req.params;
  try {
    const result = await executeQuery(
      `SELECT c.REASON, c.CANCLEID
       FROM CANCLEROOM c
       WHERE c.RESID = :1`,
      [reserveId],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0) {
      return res.json({
        success: false,
        error: "ไม่พบข้อมูลการยกเลิก",
      });
    }

    res.json({
      success: true,
      reason: result.rows[0].REASON,
      cancelId: result.rows[0].CANCLEID,
    });
  } catch (err) {
    console.error("Error fetching cancel reason:", err);
    res.status(500).json({
      success: false,
      error: "เกิดข้อผิดพลาดในการดึงข้อมูลการยกเลิก",
    });
  }
});

app.post("/add-cancel-reason", async (req, res) => {
  const { reserveId, reason, empId } = req.body;
  try {
    const result = await executeQuery(
      `SELECT MAX(CANCLEID) as MAX_ID FROM CANCLEROOM`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const nextId = (result.rows[0].MAX_ID || 0) + 1;

    await executeQuery(
      `INSERT INTO CANCLEROOM (CANCLEID, REASON, RESID, EMPID)
       VALUES (:1, :2, :3, :4)`,
      [nextId, reason, reserveId, empId],
      { autoCommit: true }
    );

    res.json({
      success: true,
      message: "บันทึกเหตุผลการยกเลิกเรียบร้อยแล้ว",
    });
  } catch (err) {
    console.error("Error adding cancel reason:", err);
    res.status(500).json({
      success: false,
      error: "เกิดข้อผิดพลาดในการบันทึกเหตุผลการยกเลิก",
    });
  }
});

app.post("/approve-booking/:reserveId", async (req, res) => {
  const { reserveId } = req.params;
  try {
    const bookingCheck = await executeQuery(
      `SELECT r.STUBOOKING, c.RTNUM
       FROM RESERVE r
       JOIN CONFERENCEROOM c ON r.CFRNUM = c.CFRNUMBER
       WHERE r.RESERVERID = :1`,
      [reserveId],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    if (!bookingCheck.rows[0]) {
      return res.status(404).json({
        success: false,
        error: "ไม่พบข้อมูลการจอง",
      });
    }
    if (bookingCheck.rows[0].RTNUM !== 2) {
      return res.status(400).json({
        success: false,
        error: "ไม่สามารถอนุมัติห้องที่ไม่ใช่ห้อง VIP",
      });
    }
    if (bookingCheck.rows[0].STUBOOKING !== 4) {
      return res.status(400).json({
        success: false,
        error: "การจองนี้ไม่ได้อยู่ในสถานะรออนุมัติ",
      });
    }
    const result = await executeQuery(
      `UPDATE RESERVE 
       SET STUBOOKING = 1
       WHERE RESERVERID = :1 
       AND STUBOOKING = 4`,
      [reserveId],
      { autoCommit: true }
    );
    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        error: "ไม่พบการจองที่รออนุมัติ",
      });
    }
    res.json({
      success: true,
      message: "อนุมัติการจองเรียบร้อยแล้ว",
    });
  } catch (err) {
    console.error("Error approving booking:", err);
    res.status(500).json({
      success: false,
      error: "เกิดข้อผิดพลาดในการอนุมัติการจอง",
    });
  }
});

app.post("/approve/:reserverId/:cfrNum", async (req, res) => {
  const { reserverId, cfrNum } = req.params;
  try {
    const result = await executeQuery(
      `UPDATE RESERVE 
       SET STUBOOKING = 1
       WHERE RESERVERID = :1 
       AND CFRNUM = :2`,
      [reserverId, cfrNum],
      {
        autoCommit: true,
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      }
    );
    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        error: "ไม่พบการจองที่ต้องการอนุมัติ",
      });
    }

    res.status(200).json({
      success: true,
      message: "การอนุมัติสำเร็จ",
    });
  } catch (error) {
    console.error("Error approving booking:", error);
    res.status(500).json({
      success: false,
      error: "เกิดข้อผิดพลาดในการอนุมัติการจอง",
    });
  }
});

app.get("/employee/:empId", async (req, res) => {
  const { empId } = req.params;
  try {
    const result = await executeQuery(
      `SELECT FNAME as firstName, LNAME as lastName
       FROM EMPLOYEE
       WHERE SSN = :1`,
      [empId],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0) {
      return res.json({
        success: false,
        error: "ไม่พบข้อมูลพนักงาน",
      });
    }

    res.json({
      success: true,
      ...result.rows[0],
    });
  } catch (err) {
    console.error("Error fetching employee details:", err);
    res.status(500).json({
      success: false,
      error: "เกิดข้อผิดพลาดในการดึงข้อมูลพนักงาน",
    });
  }
});

// Add this helper function to check for overlapping bookings
async function checkOverlappingBookings(date, startTime, endTime, room) {
  // First check if there's a 1-hour gap between bookings
  const result = await executeQuery(
    `SELECT COUNT(*) as count
     FROM RESERVE
     WHERE CFRNUM = :1
     AND BDATE = TO_DATE(:2, 'YYYY-MM-DD')
     AND STUBOOKING IN (1, 3, 4)
     AND (
       (TO_TIMESTAMP(:3, 'YYYY-MM-DD HH24:MI:SS') < ENDTIME AND TO_TIMESTAMP(:4, 'YYYY-MM-DD HH24:MI:SS') > STARTTIME)
     )`,
    [room, date, `${date} ${startTime}`, `${date} ${endTime}`],
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );

  return result.rows[0].COUNT > 0;
}

// Add this helper function to check and update room status
async function checkAndUpdateRoomStatus() {
  try {
    const currentTime = moment().tz("Asia/Bangkok");

    const result = await executeQuery(
      `SELECT r.RESERVERID, r.ESSN, r.CFRNUM, r.STARTTIME
       FROM RESERVE r
       WHERE r.STUBOOKING = 1
       AND r.TIME IS NULL
       AND :1 >= r.STARTTIME + INTERVAL '2' MINUTE
       AND :1 < r.STARTTIME + INTERVAL '2' MINUTE + INTERVAL '15' SECOND`,
      [currentTime.toDate()],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    for (const booking of result.rows) {
      await executeQuery(
        `UPDATE RESERVE 
         SET STUBOOKING = 2
         WHERE RESERVERID = :1`,
        [booking.RESERVERID],
        { autoCommit: true }
      );

      // Update COUNT and check if it's a multiple of 3
      const countResult = await executeQuery(
        `UPDATE EMPLOYEE 
         SET COUNT = NVL(COUNT, 0) + 1
         WHERE SSN = :1
         RETURNING COUNT INTO :2`,
        [booking.ESSN, { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }],
        { autoCommit: true }
      );

      const newCount = countResult.outBinds[0];

      // If COUNT is a multiple of 3, increment LOCKCOUNT and add to LOCKEMP
      if (newCount % 3 === 0) {
        // Increment LOCKCOUNT
        await executeQuery(
          `UPDATE EMPLOYEE 
           SET LOCKCOUNT = NVL(LOCKCOUNT, 0) + 1
           WHERE SSN = :1`,
          [booking.ESSN],
          { autoCommit: true }
        );

        // Check if user is already in LOCKEMP
        const blacklistCheck = await executeQuery(
          `SELECT COUNT(*) as count FROM LOCKEMP WHERE ESSN = :1`,
          [booking.ESSN],
          { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        // If not in LOCKEMP, add them
        if (blacklistCheck.rows[0].COUNT === 0) {
          const lockIdResult = await executeQuery(
            `SELECT NVL(MAX(LOCKEMPID), 0) + 1 as NEXT_ID FROM LOCKEMP`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
          );

          await executeQuery(
            `INSERT INTO LOCKEMP (LOCKEMPID, LOCKDATE, ESSN)
             VALUES (:1, :2, :3)`,
            [lockIdResult.rows[0].NEXT_ID, currentTime.toDate(), booking.ESSN],
            { autoCommit: true }
          );
        }
      }
    }
  } catch (err) {
    console.error("Error in checkAndUpdateRoomStatus:", err);
    throw err;
  }
}

// Add endpoint to manually trigger status check
app.post("/check-room-status", async (req, res) => {
  try {
    await checkAndUpdateRoomStatus();
    res.json({ success: true, message: "Room status check completed" });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Error checking room status",
      details: err.message,
    });
  }
});

// Add endpoint to unlock blacklisted employee
app.post("/unlock-employee/:ssn", async (req, res) => {
  const { ssn } = req.params;
  try {
    // Only remove from LOCKEMP table, keep the COUNT and LOCKCOUNT in EMPLOYEE table
    await executeQuery(`DELETE FROM LOCKEMP WHERE ESSN = :1`, [ssn], {
      autoCommit: true,
    });

    res.json({
      success: true,
      message: "Employee unlocked successfully",
    });
  } catch (err) {
    console.error("Error unlocking employee:", err);
    res.status(500).json({
      success: false,
      error: "Error unlocking employee",
      details: err.message,
    });
  }
});

// Add this helper function to check if user is blacklisted
async function checkUserBlacklist(essn) {
  const result = await executeQuery(
    `SELECT COUNT(*) as count
     FROM LOCKEMP
     WHERE ESSN = :1`,
    [essn],
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );

  return result.rows[0].COUNT > 0;
}

// Add this helper function to update no-show count
async function updateNoShowCount(essn) {
  const result = await executeQuery(
    `UPDATE EMPLOYEE 
     SET NOSHOW = NVL(NOSHOW, 0) + 1
     WHERE SSN = :1
     RETURNING NOSHOW INTO :2`,
    [essn, { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }],
    { autoCommit: true }
  );

  const noShowCount = result.outBinds[2];

  if (noShowCount >= 3) {
    await executeQuery(
      `UPDATE EMPLOYEE 
       SET STUEMP = 2
       WHERE SSN = :1`,
      [essn],
      { autoCommit: true }
    );
  }
}

app.get("/check-late-checkins", async (req, res) => {
  try {
    const result = await executeQuery(
      `UPDATE RESERVE
       SET STUBOOKING = 2
       WHERE STUBOOKING = 1
       AND TIME IS NULL
       AND SYSTIMESTAMP AT TIME ZONE 'Asia/Bangkok' 
           BETWEEN STARTTIME + INTERVAL '2' MINUTE 
           AND STARTTIME + INTERVAL '2' MINUTE + INTERVAL '15' SECOND
       RETURNING ESSN INTO :1`,
      [{ dir: oracledb.BIND_OUT, type: oracledb.VARCHAR2 }],
      { autoCommit: true }
    );

    if (result.outBinds[1]) {
      await updateNoShowCount(result.outBinds[1]);
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Error checking late check-ins:", err);
    res.status(500).json({
      success: false,
      error: "เกิดข้อผิดพลาดในการตรวจสอบการเข้าใช้งานล่าช้า",
    });
  }
});

app.get("/blacklist", async (req, res) => {
  try {
    const result = await executeQuery(
      `SELECT l.LOCKEMPID, l.LOCKDATE, l.ESSN, e.COUNT 
       FROM LOCKEMP l
       JOIN EMPLOYEE e ON l.ESSN = e.SSN
       ORDER BY l.LOCKDATE DESC`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json(result.rows);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error fetching blacklist", details: err.message });
  }
});

app.get("/employee-lock-stats", async (req, res) => {
  try {
    const result = await executeQuery(
      `SELECT e.SSN, e.FNAME, e.LNAME, e.COUNT, e.LOCKCOUNT, d.DNAME
  
  FROM EMPLOYEE e
  
  JOIN DEPARTMENT d ON e.DNO = d.DNUMBER
  
  WHERE e.COUNT > 0 OR e.LOCKCOUNT > 0
  
  ORDER BY e.COUNT DESC`,

      [],

      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching employee lock stats:", err);

    if (!res.headersSent) {
      res.status(500).json({
        error: "Error fetching employee lock stats",

        details: err.message,
      });
    }
  }
});

// Contact Routes
app.get("/contacts", async (req, res) => {
  try {
    const result = await executeQuery(
      `SELECT c.*, e.FNAME, e.LNAME, e.STUEMP
       FROM CONTACT c
       JOIN EMPLOYEE e ON c.ESSN = e.SSN
       ORDER BY c.CONTEACTID DESC`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching contacts:", err);
    res.status(500).json({
      error: "Error fetching contacts",
      details: err.message,
    });
  }
});

app.post("/contact", async (req, res) => {
  const { ESSN, MESSAGE } = req.body;
  try {
    // ตรวจสอบว่าพนักงานอยู่ในบัญชีดำหรือไม่
    const lockCheck = await executeQuery(
      `SELECT LOCKEMPID FROM LOCKEMP WHERE ESSN = :1`,
      [ESSN],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    // หากไม่พบพนักงานในตาราง LOCKEMP
    if (lockCheck.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: "คุณไม่ได้อยู่ในบัญชีดำ ไม่จำเป็นต้องขอปลดล็อค",
      });
    }

    // ดึงค่า CONTEACTID ถัดไป
    const nextIdResult = await executeQuery(
      `SELECT NVL(MAX(CONTEACTID), 0) + 1 as next_id FROM CONTACT`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const nextId = nextIdResult.rows[0].NEXT_ID;

    // เพิ่มคำขอการปลดล็อกใหม่ลงในตาราง CONTACT
    await executeQuery(
      `INSERT INTO CONTACT (CONTEACTID, ESSN, MESSAGE)
       VALUES (:1, :2, :3)`,
      [nextId, ESSN, MESSAGE],
      { autoCommit: true }
    );

    res.status(201).json({
      success: true,
      message: "ส่งคำขอปลดล็อคเรียบร้อยแล้ว",
      contactId: nextId,
    });
  } catch (err) {
    console.error("Error creating contact:", err);
    res.status(500).json({
      success: false,
      error: "เกิดข้อผิดพลาดในการส่งคำขอ",
      details: err.message,
    });
  }
});

// Initialize server
initializeDb()
  .then(() => {
    // Start the server
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });

    // Start checking room status after pool is initialized
    checkAndUpdateRoomStatus();
    setInterval(checkAndUpdateRoomStatus, 15000);
  })
  .catch((err) => {
    console.error("Failed to initialize database:", err);
    process.exit(1);
  });

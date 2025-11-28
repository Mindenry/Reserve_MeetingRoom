import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid'
import pool from './db.js'
import { Buffer } from 'buffer'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json({ limit: '5mb' }))

async function init() {
  await pool.query(`CREATE TABLE IF NOT EXISTS positions (PNUM INTEGER PRIMARY KEY, PNAME TEXT NOT NULL)`)
  await pool.query(`CREATE TABLE IF NOT EXISTS menus (MNUM INTEGER PRIMARY KEY, MNAME TEXT NOT NULL)`)
  await pool.query(`CREATE TABLE IF NOT EXISTS accessmenus (PNUM INTEGER NOT NULL, MNUM INTEGER NOT NULL, PRIMARY KEY (PNUM, MNUM))`)
  await pool.query(`CREATE TABLE IF NOT EXISTS members (SSN TEXT PRIMARY KEY, FNAME TEXT, LNAME TEXT, EMAIL TEXT UNIQUE NOT NULL, PASSWORD_HASH TEXT NOT NULL, STUEMP INTEGER NOT NULL DEFAULT 1, PNUM INTEGER NOT NULL, DNUM INTEGER)`)
  await pool.query(`ALTER TABLE members ADD COLUMN IF NOT EXISTS AVATAR_URL TEXT`)
  await pool.query(`ALTER TABLE members ADD COLUMN IF NOT EXISTS USERNAME TEXT UNIQUE`)
  await pool.query(`CREATE TABLE IF NOT EXISTS departments (DNUM INTEGER PRIMARY KEY, DNAME TEXT NOT NULL)`)
  await pool.query(`CREATE TABLE IF NOT EXISTS buildings (BDNUMBER INTEGER PRIMARY KEY, BDNAME TEXT NOT NULL)`)
  await pool.query(`CREATE TABLE IF NOT EXISTS floors (FLNUMBER INTEGER PRIMARY KEY, FLNAME TEXT NOT NULL, BDNUMBER INTEGER NOT NULL)`)
  await pool.query(`CREATE TABLE IF NOT EXISTS room_types (RTNUMBER INTEGER PRIMARY KEY, RTNAME TEXT NOT NULL)`)
  await pool.query(`CREATE TABLE IF NOT EXISTS conference_rooms (CFRNUMBER INTEGER PRIMARY KEY, CFRNAME TEXT NOT NULL, BDNUMBER INTEGER NOT NULL, FLNUMBER INTEGER NOT NULL, RTNUM INTEGER NOT NULL, CAPACITY INTEGER NOT NULL DEFAULT 10, STUROOM INTEGER NOT NULL DEFAULT 1)`)
  await pool.query(`CREATE TABLE IF NOT EXISTS bookings (RESERVERID TEXT PRIMARY KEY, ESSN TEXT NOT NULL, CFRNUM INTEGER NOT NULL, CFRNAME TEXT NOT NULL, BDATE DATE NOT NULL, STARTTIME TIMESTAMP NOT NULL, ENDTIME TIMESTAMP NOT NULL, STUBOOKING INTEGER NOT NULL DEFAULT 1)`)
  await pool.query(`CREATE TABLE IF NOT EXISTS cancel_reasons (RESERVERID TEXT PRIMARY KEY, REASON TEXT)`)
  await pool.query(`CREATE TABLE IF NOT EXISTS contacts (ID SERIAL PRIMARY KEY, ESSN TEXT NOT NULL, MESSAGE TEXT NOT NULL, CREATED_AT TIMESTAMP NOT NULL DEFAULT NOW())`)

  const pos = await pool.query(`SELECT COUNT(*)::int AS c FROM positions`)
  if (pos.rows[0].c === 0) {
    await pool.query(`INSERT INTO positions (PNUM, PNAME) VALUES (1,'ผู้ดูแลระบบ'),(2,'หัวหน้า'),(3,'พนักงาน')`)
  }
  const m = await pool.query(`SELECT COUNT(*)::int AS c FROM menus`)
  if (m.rows[0].c === 0) {
    await pool.query(`INSERT INTO menus (MNUM, MNAME) VALUES (1,'หน้าหลัก'),(2,'สมาชิก'),(3,'ห้องประชุม'),(4,'การเข้าถึง'),(5,'บัญชีดำ'),(6,'รายงาน'),(7,'สิทธิ์'),(8,'จองห้อง')`)
  }
  const am = await pool.query(`SELECT COUNT(*)::int AS c FROM accessmenus`)
  if (am.rows[0].c === 0) {
    await pool.query(`INSERT INTO accessmenus (PNUM,MNUM) VALUES (1,1),(1,2),(1,3),(1,4),(1,5),(1,6),(1,7),(1,8),(2,1),(2,3),(2,4),(2,6),(2,8),(3,1),(3,8)`)
  }
  const rt = await pool.query(`SELECT COUNT(*)::int AS c FROM room_types`)
  if (rt.rows[0].c === 0) {
    await pool.query(`INSERT INTO room_types (RTNUMBER, RTNAME) VALUES (1,'มาตรฐาน'),(2,'ประชุมใหญ่'),(3,'VIP')`)
  }
  const bd = await pool.query(`SELECT COUNT(*)::int AS c FROM buildings`)
  if (bd.rows[0].c === 0) {
    await pool.query(`INSERT INTO buildings (BDNUMBER, BDNAME) VALUES (1,'อาคาร A'),(2,'อาคาร B')`)
  }
  const fl = await pool.query(`SELECT COUNT(*)::int AS c FROM floors`)
  if (fl.rows[0].c === 0) {
    await pool.query(`INSERT INTO floors (FLNUMBER, FLNAME, BDNUMBER) VALUES (11,'ชั้น 1',1),(12,'ชั้น 2',1),(21,'ชั้น 1',2)`)
  }
  const cr = await pool.query(`SELECT COUNT(*)::int AS c FROM conference_rooms`)
  if (cr.rows[0].c === 0) {
    await pool.query(`INSERT INTO conference_rooms (CFRNUMBER,CFRNAME,BDNUMBER,FLNUMBER,RTNUM,CAPACITY) VALUES (101,'ห้อง A-101',1,11,1,10),(102,'ห้อง A-102',1,12,2,20),(201,'ห้อง B-201',2,21,3,8)`)
  }
  const dep = await pool.query(`SELECT COUNT(*)::int AS c FROM departments`)
  if (dep.rows[0].c === 0) {
    await pool.query(`INSERT INTO departments (DNUM,DNAME) VALUES (1,'ทรัพยากรบุคคล'),(2,'การเงิน')`)
  }
  const mem = await pool.query(`SELECT COUNT(*)::int AS c FROM members`)
  if (mem.rows[0].c === 0) {
    const hash = await bcrypt.hash('password123', 10)
    await pool.query(`INSERT INTO members (SSN,FNAME,LNAME,EMAIL,PASSWORD_HASH,STUEMP,PNUM,DNUM) VALUES 
      ('123456789','Admin','User','admin@example.com',$1,1,1,1),
      ('987654321','Normal','User','user@example.com',$1,1,3,2)`, [hash])
    await pool.query(`UPDATE members SET USERNAME=split_part(EMAIL,'@',1) WHERE USERNAME IS NULL`)
  }
}

async function ensureMenus() {
  await pool.query(`INSERT INTO menus (MNUM, MNAME) VALUES (9,'ประวัติการจอง') ON CONFLICT (MNUM) DO NOTHING`)
  await pool.query(`INSERT INTO menus (MNUM, MNAME) VALUES (10,'ติดต่อ') ON CONFLICT (MNUM) DO NOTHING`)
  await pool.query(`INSERT INTO menus (MNUM, MNAME) VALUES (11,'เกี่ยวกับ') ON CONFLICT (MNUM) DO NOTHING`)
  await pool.query(`INSERT INTO menus (MNUM, MNAME) VALUES (12,'รับเรื่องติดต่อ') ON CONFLICT (MNUM) DO NOTHING`)
  await pool.query(`INSERT INTO menus (MNUM, MNAME) VALUES (13,'โปรไฟล์') ON CONFLICT (MNUM) DO NOTHING`)
  await pool.query(`INSERT INTO accessmenus (PNUM,MNUM) VALUES (1,9) ON CONFLICT DO NOTHING`)
  await pool.query(`INSERT INTO accessmenus (PNUM,MNUM) VALUES (1,10) ON CONFLICT DO NOTHING`)
  await pool.query(`INSERT INTO accessmenus (PNUM,MNUM) VALUES (1,11) ON CONFLICT DO NOTHING`)
  await pool.query(`INSERT INTO accessmenus (PNUM,MNUM) VALUES (1,12) ON CONFLICT DO NOTHING`)
  await pool.query(`INSERT INTO accessmenus (PNUM,MNUM) VALUES (2,9) ON CONFLICT DO NOTHING`)
  await pool.query(`INSERT INTO accessmenus (PNUM,MNUM) VALUES (2,10) ON CONFLICT DO NOTHING`)
  await pool.query(`INSERT INTO accessmenus (PNUM,MNUM) VALUES (2,11) ON CONFLICT DO NOTHING`)
  await pool.query(`INSERT INTO accessmenus (PNUM,MNUM) VALUES (3,9) ON CONFLICT DO NOTHING`)
  await pool.query(`INSERT INTO accessmenus (PNUM,MNUM) VALUES (3,10) ON CONFLICT DO NOTHING`)
  await pool.query(`INSERT INTO accessmenus (PNUM,MNUM) VALUES (3,11) ON CONFLICT DO NOTHING`)
  await pool.query(`INSERT INTO accessmenus (PNUM,MNUM) VALUES (1,13) ON CONFLICT DO NOTHING`)
  await pool.query(`INSERT INTO accessmenus (PNUM,MNUM) VALUES (2,13) ON CONFLICT DO NOTHING`)
  await pool.query(`INSERT INTO accessmenus (PNUM,MNUM) VALUES (3,13) ON CONFLICT DO NOTHING`)
}

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
  const r = await pool.query('SELECT SSN, EMAIL, PASSWORD_HASH, STUEMP, PNUM, FNAME, LNAME, USERNAME FROM members WHERE EMAIL=$1', [email])
    if (r.rows.length === 0) return res.status(401).json({ success: false, error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' })
    const u = r.rows[0]
    const ok = await bcrypt.compare(password, u.password_hash)
    if (!ok) return res.status(401).json({ success: false, error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' })
  return res.json({ success: true, user: { ssn: u.ssn, email: u.email, status: u.stuemp, positionNo: u.pnum, fname: u.fname, lname: u.lname, username: u.username } })
  } catch (e) {
    return res.status(500).json({ success: false, error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' })
  }
})

app.post('/register', async (req, res) => {
  try {
    const { fname, lname, email, password, username } = req.body
    if (!email || !password) return res.status(400).json({ success: false, error: 'ต้องระบุอีเมลและรหัสผ่าน' })
    const exists = await pool.query('SELECT 1 FROM members WHERE EMAIL=$1', [email])
    if (exists.rows.length) return res.status(409).json({ success: false, error: 'อีเมลนี้ถูกใช้งานแล้ว' })
    if (username) {
      const uex = await pool.query('SELECT 1 FROM members WHERE USERNAME=$1', [username])
      if (uex.rows.length) return res.status(409).json({ success: false, error: 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว' })
    }
    const hash = await bcrypt.hash(password, 10)
    const nextRow = await pool.query(`SELECT LPAD(CAST(COALESCE(MAX(CAST(SSN AS INTEGER)), 0) + 1 AS TEXT), 9, '0') AS next FROM members`)
    const ssn = nextRow.rows[0].next || String(Math.floor(Math.random()*1e9))
    const uname = username || (email ? String(email).split('@')[0] : '')
    await pool.query('INSERT INTO members (SSN,FNAME,LNAME,EMAIL,PASSWORD_HASH,STUEMP,PNUM,DNUM,USERNAME) VALUES ($1,$2,$3,$4,$5,1,3,NULL,$6)', [ssn, fname || '', lname || '', email, hash, uname])
    return res.json({ success: true, user: { ssn, email, status: 1, positionNo: 3, fname: fname || '', lname: lname || '', username: uname } })
  } catch (e) {
    return res.status(500).json({ success: false, error: 'สมัครสมาชิกไม่สำเร็จ' })
  }
})

app.get('/profile/:ssn', async (req, res) => {
  const ssn = req.params.ssn
  const q = await pool.query('SELECT SSN, FNAME, LNAME, EMAIL, PNUM, STUEMP, AVATAR_URL FROM members WHERE SSN=$1', [ssn])
  if (!q.rows.length) return res.status(404).json({ success: false, error: 'ไม่พบผู้ใช้' })
  const u = q.rows[0]
  res.json({ success: true, user: { ssn: u.ssn, fname: u.fname, lname: u.lname, email: u.email, positionNo: u.pnum, status: u.stuemp, avatarUrl: u.avatar_url || null } })
})

app.put('/profile/:ssn', async (req, res) => {
  const ssn = req.params.ssn
  const { fname, lname, email, password, avatarUrl, username } = req.body
  try {
    if (username) {
      const uex = await pool.query('SELECT 1 FROM members WHERE USERNAME=$1 AND SSN<>$2', [username, ssn])
      if (uex.rows.length) return res.status(409).json({ success: false, error: 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว' })
    }
    if (password) {
      const hash = await bcrypt.hash(password, 10)
      await pool.query('UPDATE members SET FNAME=$1, LNAME=$2, EMAIL=$3, PASSWORD_HASH=$4, AVATAR_URL=$5, USERNAME=$6 WHERE SSN=$7', [fname || '', lname || '', email, hash, avatarUrl || null, username || null, ssn])
    } else {
      await pool.query('UPDATE members SET FNAME=$1, LNAME=$2, EMAIL=$3, AVATAR_URL=$4, USERNAME=$5 WHERE SSN=$6', [fname || '', lname || '', email, avatarUrl || null, username || null, ssn])
    }
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ success: false, error: 'อัปเดตโปรไฟล์ไม่สำเร็จ' })
  }
})

import fs from 'fs'
import path from 'path'
const uploadDir = path.resolve('backend/src/uploads')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })
app.use('/static', express.static(uploadDir))
app.post('/upload-avatar/:ssn', async (req, res) => {
  try {
    const ssn = req.params.ssn
    const { dataUrl } = req.body
    if (!dataUrl || !dataUrl.startsWith('data:image')) return res.status(400).json({ success: false, error: 'ข้อมูลรูปไม่ถูกต้อง' })
    const base64 = dataUrl.split(',')[1]
    const buf = Buffer.from(base64, 'base64')
    const filePath = path.join(uploadDir, `${ssn}.png`)
    fs.writeFileSync(filePath, buf)
    const publicUrl = `/static/${ssn}.png`
    const fullUrl = `${req.protocol}://${req.get('host')}${publicUrl}`
    await pool.query('UPDATE members SET AVATAR_URL=$1 WHERE SSN=$2', [fullUrl, ssn])
    res.json({ success: true, url: fullUrl })
  } catch (e) {
    res.status(500).json({ success: false, error: 'อัปโหลดรูปไม่สำเร็จ' })
  }
})

app.get('/accessmenus', async (req, res) => {
  const q = await pool.query(`SELECT a.PNUM, p.PNAME, a.MNUM, m.MNAME FROM accessmenus a JOIN positions p ON a.PNUM=p.PNUM JOIN menus m ON a.MNUM=m.MNUM ORDER BY a.PNUM, a.MNUM`)
  const rows = q.rows.map(r => ({ PNUM: r.pnum, PNAME: r.pname, MNUM: r.mnum, MNAME: r.mname }))
  res.json(rows)
})

app.get('/positions', async (req, res) => {
  const q = await pool.query('SELECT PNUM, PNAME FROM positions ORDER BY PNUM')
  const out = q.rows.map(r => ({ PNUM: r.pnum, PNUMBER: r.pnum, PNAME: r.pname }))
  res.json(out)
})

app.get('/menus', async (req, res) => {
  const q = await pool.query('SELECT MNUM, MNAME FROM menus ORDER BY MNUM')
  const rows = q.rows.map(r => ({ MNUM: r.mnum, MNUMBER: r.mnum, MNAME: r.mname }))
  res.json(rows)
})

app.delete('/accessmenus/position/:pnum', async (req, res) => {
  await pool.query('DELETE FROM accessmenus WHERE PNUM=$1', [parseInt(req.params.pnum, 10)])
  res.json({ success: true })
})

app.post('/accessmenus', async (req, res) => {
  const { PNUM, MNUM } = req.body
  await pool.query('INSERT INTO accessmenus (PNUM,MNUM) VALUES ($1,$2) ON CONFLICT DO NOTHING', [PNUM, MNUM])
  res.json({ success: true })
})

app.get('/roomtypes', async (req, res) => {
  const q = await pool.query('SELECT RTNUMBER, RTNAME FROM room_types ORDER BY RTNUMBER')
  res.json(q.rows)
})

app.get('/buildings', async (req, res) => {
  const q = await pool.query('SELECT BDNUMBER, BDNAME FROM buildings ORDER BY BDNUMBER')
  res.json(q.rows)
})

app.get('/floors', async (req, res) => {
  const buildingId = parseInt(req.query.buildingId || '0', 10)
  const q = await pool.query('SELECT FLNUMBER, FLNAME, BDNUMBER FROM floors WHERE BDNUMBER=$1 ORDER BY FLNUMBER', [buildingId])
  res.json(q.rows)
})

app.get('/rooms', async (req, res) => {
  const buildingId = parseInt(req.query.buildingId || '0', 10)
  const floorId = parseInt(req.query.floorId || '0', 10)
  const participants = parseInt(req.query.participants || '0', 10)
  const q = await pool.query('SELECT CFRNUMBER, CFRNAME, BDNUMBER, FLNUMBER, RTNUM, CAPACITY FROM conference_rooms WHERE BDNUMBER=$1 AND FLNUMBER=$2 AND CAPACITY>=$3 ORDER BY CFRNUMBER', [buildingId, floorId, participants])
  res.json(q.rows)
})

app.post('/book-room', async (req, res) => {
  try {
    const { date, startTime, endTime, room, essn, participants } = req.body
    const roomNum = parseInt(room, 10)
    const day = date
    const st = `${date} ${startTime}:00`
    const et = `${date} ${endTime}:00`
    const conflict = await pool.query(
      `SELECT 1 FROM bookings WHERE CFRNUM=$1 AND BDATE=$2 AND (
        (STARTTIME <= $3 AND ENDTIME > $3) OR (STARTTIME < $4 AND ENDTIME >= $4) OR ($3 <= STARTTIME AND $4 >= ENDTIME)
      )`,
      [roomNum, day, st, et]
    )
    if (conflict.rows.length > 0) return res.status(400).json({ success: false, error: 'ห้องถูกจองในช่วงเวลานี้แล้ว' })
    const gap = await pool.query(
      `SELECT 1 FROM bookings WHERE CFRNUM=$1 AND BDATE=$2 AND (
        (ABS(EXTRACT(EPOCH FROM (STARTTIME - $3)))/3600 < 1) OR (ABS(EXTRACT(EPOCH FROM (ENDTIME - $4)))/3600 < 1)
      )`,
      [roomNum, day, st, et]
    )
    if (gap.rows.length > 0) return res.status(400).json({ success: false, error: 'ห้องถูกจองในช่วงเวลานี้แล้ว' })
    const roomRow = await pool.query('SELECT CFRNAME FROM conference_rooms WHERE CFRNUMBER=$1', [roomNum])
    const id = uuidv4()
    await pool.query('INSERT INTO bookings (RESERVERID, ESSN, CFRNUM, CFRNAME, BDATE, STARTTIME, ENDTIME, STUBOOKING) VALUES ($1,$2,$3,$4,$5,$6,$7,1)', [id, essn, roomNum, roomRow.rows[0].cfrname, day, st, et])
    const isVIP = (await pool.query('SELECT RTNUM FROM conference_rooms WHERE CFRNUMBER=$1', [roomNum])).rows[0].rtnum === 3
    return res.json({ success: true, reserverId: id, isVIP })
  } catch (e) {
    return res.status(500).json({ success: false, error: 'เกิดข้อผิดพลาดในการจอง' })
  }
})

app.get('/user-bookings/:ssn', async (req, res) => {
  const ssn = req.params.ssn
  const q = await pool.query('SELECT RESERVERID, CFRNAME, CFRNUM, BDATE, STARTTIME, ENDTIME, STUBOOKING FROM bookings WHERE ESSN=$1 ORDER BY STARTTIME DESC', [ssn])
  res.json(q.rows)
})

app.post('/cancel/:reserverId/:roomNum', async (req, res) => {
  const id = req.params.reserverId
  const reason = req.body?.reason || null
  await pool.query('UPDATE bookings SET STUBOOKING=5 WHERE RESERVERID=$1', [id])
  if (reason) {
    await pool.query('INSERT INTO cancel_reasons (RESERVERID, REASON) VALUES ($1,$2) ON CONFLICT (RESERVERID) DO UPDATE SET REASON=excluded.REASON', [id, reason])
  }
  res.json({ success: true })
})

app.get('/cancel-reason/:reserverId', async (req, res) => {
  const id = req.params.reserverId
  const q = await pool.query('SELECT REASON FROM cancel_reasons WHERE RESERVERID=$1', [id])
  if (q.rows.length === 0) return res.json({ success: true, reason: null })
  res.json({ success: true, reason: q.rows[0].reason })
})

app.get('/room-status/:reserverId/:roomId', async (req, res) => {
  const id = req.params.reserverId
  const q = await pool.query('SELECT RESERVERID, CFRNUM, STUBOOKING FROM bookings WHERE RESERVERID=$1', [id])
  if (q.rows.length === 0) return res.json({ success: false })
  res.json({ success: true, STUBOOKING: q.rows[0].stubooking })
})

app.post('/confirm-usage/:reserverId/:roomId', async (req, res) => {
  const id = req.params.reserverId
  await pool.query('UPDATE bookings SET STUBOOKING=3 WHERE RESERVERID=$1', [id])
  res.json({ success: true })
})

app.get('/room', async (req, res) => {
  const b = await pool.query('SELECT CFRNUM FROM bookings WHERE STUBOOKING=1 AND STARTTIME<=NOW() AND ENDTIME>=NOW()')
  const busy = new Set(b.rows.map(r => r.cfrnum))
  const q = await pool.query(`SELECT r.CFRNUMBER, r.CFRNAME, r.BDNUMBER, r.FLNUMBER, r.RTNUM, r.CAPACITY,
    b.BDNAME, f.FLNAME, t.RTNAME FROM conference_rooms r
    JOIN buildings b ON r.BDNUMBER=b.BDNUMBER
    JOIN floors f ON r.FLNUMBER=f.FLNUMBER
    JOIN room_types t ON r.RTNUM=t.RTNUMBER
    ORDER BY r.CFRNUMBER`)
  const mapped = q.rows.map(r => ({
    CFRNUMBER: r.cfrnumber, CFRNAME: r.cfrname, BDNAME: r.bdname, FLNAME: r.flname, RTNAME: r.rtname, CAPACITY: r.capacity,
    STUROOM: busy.has(r.cfrnumber) ? 2 : 1
  }))
  res.json(mapped)
})

app.get('/members', async (req, res) => {
  const q = await pool.query(`SELECT m.SSN, m.FNAME, m.LNAME, m.EMAIL, m.STUEMP, m.PNUM, m.DNUM,
    p.PNAME, d.DNAME FROM members m
    LEFT JOIN positions p ON m.PNUM=p.PNUM
    LEFT JOIN departments d ON m.DNUM=d.DNUM`)
  const rows = q.rows.map(r => ({
    SSN: r.ssn, FNAME: r.fname, LNAME: r.lname, EMAIL: r.email, STUEMP: r.stuemp,
    PNUM: r.pnum, DNUM: r.dnum, PNAME: r.pname || null, DNAME: r.dname || null
  }))
  res.json(rows)
})

app.get('/admin-bookings', async (req, res) => {
  const date = req.query.date || null
  const roomId = req.query.roomId ? parseInt(req.query.roomId, 10) : null
  let sql = 'SELECT RESERVERID, ESSN, CFRNAME, CFRNUM, BDATE, STARTTIME, ENDTIME, STUBOOKING FROM bookings'
  const cond = []
  const params = []
  if (date) { cond.push('BDATE=$' + (params.length+1)); params.push(date) }
  if (roomId) { cond.push('CFRNUM=$' + (params.length+1)); params.push(roomId) }
  if (cond.length) sql += ' WHERE ' + cond.join(' AND ')
  sql += ' ORDER BY STARTTIME DESC'
  const q = await pool.query(sql, params)
  res.json(q.rows)
})

app.get('/history', async (req, res) => {
  const q = await pool.query('SELECT BDATE FROM bookings ORDER BY BDATE')
  res.json(q.rows)
})

app.get('/employee/:ssn', async (req, res) => {
  const q = await pool.query('SELECT SSN FROM members WHERE SSN=$1', [req.params.ssn])
  res.json({ success: q.rows.length > 0 })
})

app.post('/contact', async (req, res) => {
  const { ESSN, MESSAGE } = req.body
  await pool.query('INSERT INTO contacts (ESSN, MESSAGE) VALUES ($1,$2)', [ESSN, MESSAGE])
  res.json({ success: true })
})

app.post('/approve/:reserverId/:roomNum', async (req, res) => {
  const id = req.params.reserverId
  await pool.query('UPDATE bookings SET STUBOOKING=1 WHERE RESERVERID=$1', [id])
  res.json({ success: true })
})

app.get('/departments', async (req, res) => {
  const q = await pool.query('SELECT DNUM, DNAME FROM departments ORDER BY DNUM')
  res.json(q.rows)
})

app.get('/statusemps', async (req, res) => {
  res.json([
    { STATUSEMPID: 1, STATUSEMPNAME: 'ทำงาน' },
    { STATUSEMPID: 2, STATUSEMPNAME: 'ลาออก' },
    { STATUSEMPID: 3, STATUSEMPNAME: 'เกษียณอายุ' }
  ])
})

app.get('/statusrooms', async (req, res) => {
  res.json([
    { STATUSROOMID: 1, STATUSROOMNAME: 'พร้อมใช้งาน' },
    { STATUSROOMID: 2, STATUSROOMNAME: 'ชำรุด' },
    { STATUSROOMID: 3, STATUSROOMNAME: 'ปิดให้บริการ' }
  ])
})

app.get('/rooms', async (req, res) => {
  const q = await pool.query('SELECT CFRNUMBER, CFRNAME FROM conference_rooms ORDER BY CFRNUMBER')
  res.json(q.rows)
})

app.post('/addroom', async (req, res) => {
  const { CFRNAME, BDNUM, FLNUM, RTNUM, STUROOM, CAPACITY } = req.body
  const idRow = await pool.query('SELECT COALESCE(MAX(CFRNUMBER),100) + 1 AS next FROM conference_rooms')
  const id = idRow.rows[0].next
  await pool.query('INSERT INTO conference_rooms (CFRNUMBER,CFRNAME,BDNUMBER,FLNUMBER,RTNUM,STUROOM,CAPACITY) VALUES ($1,$2,$3,$4,$5,$6,$7)', [id, CFRNAME, parseInt(BDNUM,10), parseInt(FLNUM,10), parseInt(RTNUM,10), parseInt(STUROOM||'1',10), parseInt(CAPACITY||'0',10)])
  res.json({ success: true, CFRNUMBER: id })
})

app.put('/updateroom/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10)
  const { CFRNAME, BDNUM, FLNUM, RTNUM, STUROOM, CAPACITY } = req.body
  await pool.query('UPDATE conference_rooms SET CFRNAME=$1, BDNUMBER=$2, FLNUMBER=$3, RTNUM=$4, STUROOM=$5, CAPACITY=$6 WHERE CFRNUMBER=$7', [CFRNAME, parseInt(BDNUM,10), parseInt(FLNUM,10), parseInt(RTNUM,10), parseInt(STUROOM||'1',10), parseInt(CAPACITY||'0',10), id])
  res.json({ success: true })
})

app.delete('/deleteroom/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10)
  await pool.query('DELETE FROM conference_rooms WHERE CFRNUMBER=$1', [id])
  res.json({ success: true })
})

app.get('/contacts', async (req, res) => {
  const q = await pool.query(`SELECT c.ID AS CONTEACTID, c.ESSN, c.MESSAGE, c.CREATED_AT, m.FNAME, m.LNAME FROM contacts c LEFT JOIN members m ON c.ESSN=m.SSN ORDER BY c.CREATED_AT DESC`)
  res.json(q.rows)
})

app.get('/blacklist', async (req, res) => {
  await pool.query('CREATE TABLE IF NOT EXISTS blacklist (LOCKEMPID SERIAL PRIMARY KEY, ESSN TEXT NOT NULL, LOCKDATE TIMESTAMP NOT NULL DEFAULT NOW())')
  const q = await pool.query('SELECT LOCKEMPID, ESSN, LOCKDATE FROM blacklist ORDER BY LOCKDATE DESC')
  res.json(q.rows)
})

app.post('/unlock-employee/:essn', async (req, res) => {
  await pool.query('DELETE FROM blacklist WHERE ESSN=$1', [req.params.essn])
  res.json({ success: true })
})

app.post('/check-room-status', async (req, res) => {
  await pool.query('UPDATE bookings SET STUBOOKING=2 WHERE STUBOOKING=1 AND ENDTIME < NOW()')
  res.json({ success: true })
})

app.get('/employee-lock-stats', async (req, res) => {
  await pool.query('CREATE TABLE IF NOT EXISTS blacklist (LOCKEMPID SERIAL PRIMARY KEY, ESSN TEXT NOT NULL, LOCKDATE TIMESTAMP NOT NULL DEFAULT NOW())')
  const q = await pool.query(`
    SELECT m.FNAME, m.LNAME, d.DNAME,
      COALESCE(ns.cnt,0) AS COUNT,
      COALESCE(bl.cnt,0) AS LOCKCOUNT
    FROM members m
    LEFT JOIN departments d ON m.DNUM=d.DNUM
    LEFT JOIN (
      SELECT ESSN, COUNT(*) AS cnt FROM bookings WHERE STUBOOKING=2 GROUP BY ESSN
    ) ns ON ns.ESSN=m.SSN
    LEFT JOIN (
      SELECT ESSN, COUNT(*) AS cnt FROM blacklist GROUP BY ESSN
    ) bl ON bl.ESSN=m.SSN
    ORDER BY (COALESCE(ns.cnt,0) + COALESCE(bl.cnt,0)) DESC
  `)
  res.json(q.rows)
})

app.post('/addmembers', async (req, res) => {
  const { FNAME, LNAME, EMAIL, PW, DNO, PNO, STUEMP } = req.body
  const hash = await bcrypt.hash(PW || 'password123', 10)
  const idRow = await pool.query(`SELECT LPAD(CAST(COALESCE(MAX(CAST(SSN AS INTEGER)), 0) + 1 AS TEXT), 9, '0') AS next FROM members`)
  const ssn = idRow.rows[0].next || String(Math.floor(Math.random()*1e9))
  await pool.query('INSERT INTO members (SSN,FNAME,LNAME,EMAIL,PASSWORD_HASH,STUEMP,PNUM,DNUM) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)', [ssn, FNAME, LNAME, EMAIL, hash, parseInt(STUEMP,10), parseInt(PNO,10), parseInt(DNO,10)])
  res.json({ success: true, SSN: ssn })
})

app.put('/updatemembers/:ssn', async (req, res) => {
  const ssn = req.params.ssn
  const { FNAME, LNAME, EMAIL, PW, DNO, PNO, STUEMP } = req.body
  if (PW) {
    const hash = await bcrypt.hash(PW, 10)
    await pool.query('UPDATE members SET FNAME=$1, LNAME=$2, EMAIL=$3, PASSWORD_HASH=$4, STUEMP=$5, PNUM=$6, DNUM=$7 WHERE SSN=$8', [FNAME, LNAME, EMAIL, hash, parseInt(STUEMP,10), parseInt(PNO,10), parseInt(DNO,10), ssn])
  } else {
    await pool.query('UPDATE members SET FNAME=$1, LNAME=$2, EMAIL=$3, STUEMP=$4, PNUM=$5, DNUM=$6 WHERE SSN=$7', [FNAME, LNAME, EMAIL, parseInt(STUEMP,10), parseInt(PNO,10), parseInt(DNO,10), ssn])
  }
  res.json({ success: true })
})

app.post('/addsuperuser', async (req, res) => {
  try {
    const { email, password, fname, lname } = req.body
    if (!email) return res.status(400).json({ success: false, error: 'ต้องระบุอีเมล' })
    const hash = await bcrypt.hash(password || 'password123', 10)
    const nextRow = await pool.query(`SELECT LPAD(CAST(COALESCE(MAX(CAST(SSN AS INTEGER)), 0) + 1 AS TEXT), 9, '0') AS next FROM members`)
    const ssn = nextRow.rows[0].next || String(Math.floor(Math.random()*1e9))
    await pool.query(`INSERT INTO members (SSN,FNAME,LNAME,EMAIL,PASSWORD_HASH,STUEMP,PNUM,DNUM)
      VALUES ($1,$2,$3,$4,$5,1,1,1)
      ON CONFLICT (EMAIL) DO UPDATE SET FNAME=excluded.FNAME, LNAME=excluded.LNAME, PASSWORD_HASH=excluded.PASSWORD_HASH, STUEMP=1, PNUM=1, DNUM=1`,
      [ssn, fname || 'Super', lname || 'User', email, hash])
    res.json({ success: true, email, ssn })
  } catch (e) {
    res.status(500).json({ success: false, error: 'สร้างผู้ใช้สิทธิ์เต็มไม่สำเร็จ' })
  }
})

const start = async () => {
  if (process.env.SKIP_INIT !== '1') {
    await init()
  }
  await ensureMenus()
  const port = parseInt(process.env.PORT || '8080', 10)
  app.get('/health', (req, res) => res.json({ ok: true }))
  app.listen(port, () => {
    console.log(`server: listening on http://localhost:${port}`)
  })
}

start()

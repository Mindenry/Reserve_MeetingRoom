import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";

// สร้าง AuthContext เพื่อใช้สำหรับการจัดการสถานะการเข้าสู่ระบบ
const AuthContext = createContext(null);

// สร้าง AuthProvider เพื่อให้สามารถใช้ AuthContext ได้ในส่วนต่างๆ ของแอพ
export const AuthProvider = ({ children }) => {
  // สถานะสำหรับเก็บข้อมูลผู้ใช้, สถานะการเข้าสู่ระบบ, การโหลด, และสิทธิ์การเข้าถึงเมนู
  const [user, setUser] = useState(null); // ข้อมูลผู้ใช้
  const [isAuthenticated, setIsAuthenticated] = useState(false); // สถานะการเข้าสู่ระบบ
  const [isLoading, setIsLoading] = useState(true); // สถานะการโหลด
  const [menuPermissions, setMenuPermissions] = useState([]); // สิทธิ์การเข้าถึงเมนู
  const navigate = useNavigate(); // ฟังก์ชันสำหรับนำทาง

  useEffect(() => {
    checkAuth(); // ตรวจสอบการเข้าสู่ระบบ
  }, []);

  // ใช้ useEffect เพื่อลดเวลารอโหลดสิทธิ์ของผู้ใช้
  useEffect(() => {
    const loadUserPermissions = async () => {
      if (user?.positionNo) { // ตรวจสอบว่ามีข้อมูลผู้ใช้และตำแหน่งหรือไม่
        try {
          // ดึงข้อมูลสิทธิ์การเข้าถึงเมนูจากเซิร์ฟเวอร์
          const response = await axios.get(`http://localhost:8080/accessmenus`);
          // กรองข้อมูลสิทธิ์ตามตำแหน่งของผู้ใช้
          const userPermissions = response.data.filter(
            (p) => p.PNUM === user.positionNo
          );
          // เซ็ตสิทธิ์การเข้าถึงเมนูให้กับผู้ใช้
          setMenuPermissions(userPermissions.map((p) => p.MNUM));
        } catch (error) {
          // หากเกิดข้อผิดพลาดในการโหลดสิทธิ์ แสดงข้อความแจ้งเตือน
          console.error("Error loading permissions:", error);
          toast.error("ไม่สามารถโหลดสิทธิ์การใช้งานได้", {
            duration: 3000,
          });
        }
      }
    };

    if (user) { // หากมีผู้ใช้ให้โหลดสิทธิ์
      loadUserPermissions();
    }
  }, [user]);

  // ฟังก์ชันตรวจสอบการเข้าสู่ระบบ
  const checkAuth = () => {
    try {
      // ดึงข้อมูลผู้ใช้และสถานะการเข้าสู่ระบบจาก localStorage หรือ sessionStorage
      const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
      const storedAuth = localStorage.getItem("isAuthenticated") || sessionStorage.getItem("isAuthenticated");

      // หากมีข้อมูลผู้ใช้และเข้าสู่ระบบอยู่
      if (storedUser && storedAuth === "true") {
        setUser(JSON.parse(storedUser)); // เซ็ตข้อมูลผู้ใช้
        setIsAuthenticated(true); // เปลี่ยนสถานะการเข้าสู่ระบบเป็นจริง
      } else {
        clearAuthData(); // หากไม่มีข้อมูลให้ล้างข้อมูลการเข้าสู่ระบบ
      }
    } catch (error) {
      console.error("Error checking auth:", error);
      clearAuthData(); // หากเกิดข้อผิดพลาดให้ล้างข้อมูลการเข้าสู่ระบบ
    } finally {
      setIsLoading(false); // สถานะการโหลดเป็น false หลังจากตรวจสอบเสร็จ
    }
  };

   // ฟังก์ชันล้างข้อมูลการเข้าสู่ระบบ
   const clearAuthData = () => {
    // ลบข้อมูลจาก localStorage และ sessionStorage
    localStorage.removeItem("user");
    localStorage.removeItem("isAuthenticated");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("isAuthenticated");
    setUser(null); // รีเซ็ตข้อมูลผู้ใช้
    setIsAuthenticated(false); // เปลี่ยนสถานะการเข้าสู่ระบบเป็น false
    setMenuPermissions([]); // รีเซ็ตสิทธิ์การเข้าถึงเมนู
  };

  // ฟังก์ชันตรวจสอบว่าผู้ใช้มีสิทธิ์เข้าถึงเมนูหรือไม่
  const hasPermission = (menuNumber) => {
    if (!user || !menuPermissions.length) return false; // หากไม่มีผู้ใช้หรือไม่มีสิทธิ์การเข้าถึง
    return menuPermissions.includes(menuNumber); // คืนค่า true หรือ false ขึ้นอยู่กับว่ามีสิทธิ์หรือไม่
  };

  // ฟังก์ชันเข้าสู่ระบบ
  const login = async (userData, rememberMe = false) => {
    try {
      const storage = rememberMe ? localStorage : sessionStorage; // กำหนดว่าจะใช้ storage แบบไหนตามค่า rememberMe
      storage.setItem("user", JSON.stringify(userData)); // เซ็ตข้อมูลผู้ใช้
      storage.setItem("isAuthenticated", "true"); // เปลี่ยนสถานะการเข้าสู่ระบบเป็น true
      setUser(userData); // เซ็ตข้อมูลผู้ใช้ใน state
      setIsAuthenticated(true); // เปลี่ยนสถานะการเข้าสู่ระบบเป็นจริง

      // ดึงข้อมูลสิทธิ์การเข้าถึงเมนูจากเซิร์ฟเวอร์
      const response = await axios.get(`http://localhost:8080/accessmenus`);
      const userPermissions = response.data.filter(
        (p) => p.PNUM === userData.positionNo
      );
      setMenuPermissions(userPermissions.map((p) => p.MNUM)); // เซ็ตสิทธิ์การเข้าถึงเมนู

      // แสดงข้อความต้อนรับ
      toast.success(`ยินดีต้อนรับ ${userData.firstName} ${userData.lastName}`, {
        duration: 3000,
      });
      navigate("/dashboard"); // นำทางไปยังหน้าแดชบอร์ด
    } catch (error) {
      console.error("Login error:", error); // แสดงข้อผิดพลาดในคอนโซล
      toast.error("เกิดข้อผิดพลาดในการเข้าสู่ระบบ", {
        duration: 3000,
      });
      clearAuthData(); // ล้างข้อมูลการเข้าสู่ระบบ
    }
  };

  // ฟังก์ชันออกจากระบบ
  const logout = () => {
    clearAuthData(); // ล้างข้อมูลการเข้าสู่ระบบ
    toast.success("ออกจากระบบสำเร็จ", {
      duration: 3000,
    });
    navigate("/"); // นำทางไปยังหน้าแรก
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // คืนค่า AuthContext.Provider ที่มีค่าเป็นข้อมูลการเข้าสู่ระบบ
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
        checkAuth,
        hasPermission,
        menuPermissions,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
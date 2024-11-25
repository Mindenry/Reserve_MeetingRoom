import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import HomeSection from "../components/sections/HomeSection";
import MembersSection from "../components/sections/MembersSection";
import RoomsSection from "../components/sections/RoomsSection";
import AccessSection from "../components/sections/AccessSection";
import BlacklistSection from "../components/sections/BlacklistSection";
import CancelSection from "../components/sections/CancelSection";
import ReportSection from "../components/sections/ReportSection";
import PermissionsSection from "../components/sections/PermissionsSection";
import AboutSection from "../components/sections/AboutSection";
import BookingSection from "../components/sections/BookingSection";
import ContactSection from "../components/sections/ContactSection";
import ContactInfo from "../components/sections/ContactInfo";
import BookingHistorySection from "../components/sections/BookingHistorySection";

// สร้างฟังก์ชัน Dashboard สำหรับคอมโพเนนต์ Dashboard
const Dashboard = () => {
  // ใช้ useAuth เพื่อดึงข้อมูลผู้ใช้และสิทธิ์การเข้าถึง
  const { user, hasPermission } = useAuth();
  // กำหนดสถานะของ Sidebar ว่าถูกย่อหรือไม่
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  // สร้างฟังก์ชัน navigate สำหรับการนำทาง
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) { // ถ้าผู้ใช้ไม่มีข้อมูล (ไม่ได้เข้าสู่ระบบ) ให้ไปยังหน้าแรก
      navigate("/");
    }
  }, [user, navigate]); // ทำงานเมื่อ user หรือ navigate เปลี่ยนแปลง

  // ฟังก์ชันสำหรับสลับสถานะของ Sidebar
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // ถ้าผู้ใช้ไม่มีข้อมูล (ไม่ได้เข้าสู่ระบบ) ไม่ต้องเรนเดอร์อะไร
  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
          <Routes>
            {hasPermission(1) && <Route path="/" element={<HomeSection />} />}
            {hasPermission(2) && (
              <Route path="/members" element={<MembersSection />} />
            )}
            {hasPermission(3) && (
              <Route path="/rooms" element={<RoomsSection />} />
            )}
            {hasPermission(4) && (
              <Route path="/access" element={<AccessSection />} />
            )}
            {hasPermission(5) && (
              <Route path="/blacklist" element={<BlacklistSection />} />
            )}
            {hasPermission(6) && (
              <Route path="/report" element={<ReportSection />} />
            )}
            {hasPermission(7) && (
              <Route path="/permissions" element={<PermissionsSection />} />
            )}
            {hasPermission(8) && (
              <Route path="/booking" element={<BookingSection />} />
            )}
            {hasPermission(9) && (
              <Route path="/user-cancel" element={<BookingHistorySection />} />
            )}
            {hasPermission(10) && (
              <Route path="/contact" element={<ContactSection />} />
            )}
            {hasPermission(11) && (
              <Route path="/about" element={<AboutSection />} />
            )}
            {hasPermission(12) && (
              <Route path="/contact-info" element={<ContactInfo />} />
            )}
            <Route path="*" element={<AccessDenied />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

// คอมโพเนนต์สำหรับการแสดงข้อความว่าไม่มีสิทธิ์เข้าถึง
const AccessDenied = () => (
  <div className="flex items-center justify-center h-full">
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-4 text-red-600">Access Denied</h2>
      <p className="text-gray-600">
        You do not have permission to view this page.
      </p>
    </div>
  </div>
);

export default Dashboard;

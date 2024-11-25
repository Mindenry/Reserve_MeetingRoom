import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Home,
  Calendar,
  XCircle,
  MessageCircle,
  Info,
  User,
  LogOut,
} from "lucide-react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import HomeSection from "./sections/HomeSection";
import MembersSection from "./sections/MembersSection";
import RoomsSection from "./sections/RoomsSection";
import AccessSection from "./sections/AccessSection";
import BlacklistSection from "./sections/BlacklistSection";
import CancelSection from "./sections/CancelSection";
import ReportSection from "./sections/ReportSection";
import PermissionsSection from "./sections/PermissionsSection";
import AboutSection from "./sections/AboutSection";
import BookingSection from "./sections/BookingSection";
import ContactSection from "./sections/ContactSection";

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState("home");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // TODO: Implement actual user authentication check
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      navigate("/");
    }
    // TODO: Fetch user data from Oracle SQL database
    // Example: fetchUserData(user.id).then(data => setUserData(data));
  }, [navigate]);

  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  const handleLogout = () => {
    // TODO: Implement logout logic (clear session, tokens, etc.)
    localStorage.removeItem("user");
    navigate("/");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const renderSection = () => {
    switch (activeSection) {
      case "home":
        return <HomeSection />;
      case "members":
        return <MembersSection />;
      case "rooms":
        return <RoomsSection />;
      case "access":
        return <AccessSection />;
      case "blacklist":
        return <BlacklistSection />;
      case "cancel":
        return <CancelSection />;
      case "report":
        return <ReportSection />;
      case "permissions":
        return <PermissionsSection />;
      case "about":
        return <AboutSection />;
      case "booking":
        return <BookingSection />;
      case "contact":
        return <ContactSection />;
      default:
        return <HomeSection />;
    }
  };

  const userMenuItems = [
    { icon: Home, label: "หน้าหลัก", section: "home" },
    { icon: Calendar, label: "จองห้อง", section: "booking" },
    { icon: XCircle, label: "ยกเลิกการจอง", section: "cancel" },
    { icon: MessageCircle, label: "ติดต่อ", section: "contact" },
    { icon: Info, label: "เกี่ยวกับ", section: "about" },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar for admin */}
      {isSidebarOpen && (
        <Sidebar
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          onLogout={handleLogout}
          userRole={userData.role}
        />
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          toggleSidebar={toggleSidebar}
          toggleUserMenu={toggleUserMenu}
          userData={userData}
        />

        {/* User menu for mobile */}
        {isUserMenuOpen && (
          <div className="lg:hidden bg-white shadow-md absolute top-16 right-0 w-64 z-50">
            {userMenuItems.map((item) => (
              <button
                key={item.section}
                onClick={() => {
                  handleSectionChange(item.section);
                  setIsUserMenuOpen(false);
                }}
                className="flex items-center w-full px-4 py-2 text-gray-800 hover:bg-gray-100"
              >
                <item.icon className="mr-2" size={18} />
                {item.label}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-gray-100"
            >
              <LogOut className="mr-2" size={18} />
              ออกจากระบบ
            </button>
          </div>
        )}

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
          {renderSection()}
        </main>
      </div>

      {/* User menu for desktop */}
      {userData.role === "user" && (
        <div className="hidden lg:flex flex-col bg-white shadow-md w-64 p-4">
          <div className="flex items-center mb-6">
            <img
              src={userData.avatar}
              alt="User Avatar"
              className="w-12 h-12 rounded-full mr-3"
            />
            <div>
              <h3 className="font-semibold">{userData.name}</h3>
              <p className="text-sm text-gray-600">{userData.role}</p>
            </div>
          </div>
          {userMenuItems.map((item) => (
            <button
              key={item.section}
              onClick={() => handleSectionChange(item.section)}
              className={`flex items-center mb-2 px-4 py-2 rounded-lg ${
                activeSection === item.section
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <item.icon className="mr-3" size={18} />
              {item.label}
            </button>
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center mt-auto px-4 py-2 text-red-600 hover:bg-gray-100 rounded-lg"
          >
            <LogOut className="mr-3" size={18} />
            ออกจากระบบ
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

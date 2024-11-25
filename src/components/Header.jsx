import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  User,
  LogOut,
  Calendar,
  XCircle,
  MessageCircle,
  Info,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { useAuth } from "../contexts/AuthContext";
const Header = () => {
  const { user, logout, hasPermission } = useAuth();
  const [time, setTime] = useState(new Date());
  const [isHovered, setIsHovered] = useState(false);
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  // เมนูที่ต้องการ permission ในการแสดง
  const userMenuItems = [
    { mnum: 8, icon: Calendar, label: "จองห้อง", path: "/dashboard/booking" },
    {
      mnum: 9,
      icon: XCircle,
      label: "ประวัติการจอง",
      path: "/dashboard/user-cancel",
    },
    {
      mnum: 10,
      icon: MessageCircle,
      label: "ติดต่อ",
      path: "/dashboard/contact",
    },
    { mnum: 11, icon: Info, label: "เกี่ยวกับ", path: "/dashboard/about" },
  ];
  // ตรวจสอบสิทธิ์ในการเข้าถึงเมนู
  const filteredUserMenuItems = userMenuItems.filter((item) =>
    hasPermission(item.mnum)
  );
  const handleLogout = () => {
    logout();
  };
  return (
    <header className="bg-white shadow-lg py-4 px-6 flex justify-between items-center">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center space-x-8"
      >
        <motion.div
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          className="relative flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
        >
          <div className="relative">
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-lg opacity-30"
                />
              )}
            </AnimatePresence>
            <Clock className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex flex-col">
            <motion.span 
              className="text-sm text-gray-500"
              animate={{ y: 0, opacity: 1 }}
              initial={{ y: 10, opacity: 0 }}
            >
              {time.toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </motion.span>
            <motion.div 
              className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
              animate={{ y: 0, opacity: 1 }}
              initial={{ y: 10, opacity: 0 }}
            >
              {time.toLocaleTimeString('th-TH', { 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit',
                hour12: false 
              })}
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="mx-1"
              >
                |
              </motion.span>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
      <nav className="hidden md:flex items-center space-x-4">
        {filteredUserMenuItems.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Link
              to={item.path}
              className="text-gray-600 hover:text-blue-600 flex items-center transition-all duration-300 px-3 py-2 rounded-md hover:bg-gray-100"
            >
              <item.icon className="w-5 h-5 mr-2" />
              <span className="font-medium">{item.label}</span>
            </Link>
          </motion.div>
        ))}
      </nav>
      <div className="flex items-center space-x-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative group px-4 py-2 hover:bg-blue-50/50"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center space-x-3"
              >
                <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                  <User className="h-5 w-5 text-white" />
                </div>
                <span className="font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                  {user?.firstName} {user?.lastName}
                </span>
              </motion.div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-1">
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-600 hover:bg-red-50 cursor-pointer rounded-lg transition-all duration-200"
            >
              <motion.div
                whileHover={{ x: 4 }}
                className="flex items-center space-x-2 py-1.5"
              >
                <LogOut className="h-4 w-4" />
                <span>ออกจากระบบ</span>
              </motion.div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
export default Header;
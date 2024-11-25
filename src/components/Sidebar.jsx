import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  DoorOpen,
  Key,
  Ban,
  BarChart2,
  Lock,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

const Sidebar = ({ isCollapsed, toggleSidebar }) => {
  const location = useLocation();
  const { hasPermission } = useAuth();
  const [hoveredItem, setHoveredItem] = useState(null);

  const menuItems = [
    {
      mnum: 1,
      name: "หน้าหลัก",
      icon: Home,
      label: "หน้าหลัก",
      path: "/dashboard",
    },
    {
      mnum: 2,
      name: "จัดการสมาชิก",
      icon: Users,
      label: "สมาชิก",
      path: "/dashboard/members",
    },
    {
      mnum: 3,
      name: "จัดการห้องประชุม",
      icon: DoorOpen,
      label: "ห้องประชุม",
      path: "/dashboard/rooms",
    },
    {
      mnum: 4,
      name: "จัดการเข้าใช้งานห้อง",
      icon: Key,
      label: "จัดการจองห้อง",
      path: "/dashboard/access",
    },
    {
      mnum: 5,
      name: "ปลดเเบน",
      icon: Ban,
      label: "ล็อคสมาชิก",
      path: "/dashboard/blacklist",
    },
    {
      mnum: 6,
      name: "รายงาน",
      icon: BarChart2,
      label: "รายงาน",
      path: "/dashboard/report",
    },
    {
      mnum: 12,
      name: "รับเรื่องติดต่อ",
      icon: MessageCircle,
      label: "รับเรื่องติดต่อ",
      path: "/dashboard/contact-info",
    },
    {
      mnum: 7,
      name: "สิทธิ์การใช้งาน",
      icon: Lock,
      label: "สิทธิ์การใช้งาน",
      path: "/dashboard/permissions",
    },
  ];

  // กรองเมนูตามสิทธิ์การเข้าถึง
  const filteredMenuItems = menuItems.filter((item) =>
    hasPermission(item.mnum)
  );

  const sidebarVariants = {
    expanded: { width: 256 },
    collapsed: { width: 80 },
  };

  const logoVariants = {
    expanded: { opacity: 1, scale: 1 },
    collapsed: { opacity: 0, scale: 0.5 },
  };

  const itemVariants = {
    expanded: { opacity: 1, x: 0 },
    collapsed: { opacity: 0, x: -20 },
  };

  return (
    <TooltipProvider>
      <motion.div
        className="bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-900 text-white shadow-2xl h-screen transition-all duration-300 ease-in-out overflow-hidden relative rounded-r-3xl"
        initial={false}
        animate={isCollapsed ? "collapsed" : "expanded"}
        variants={sidebarVariants}
      >
        <div className="flex justify-between items-center p-4 border-b border-white border-opacity-20">
          <motion.div
            variants={logoVariants}
            initial="collapsed"
            animate={isCollapsed ? "collapsed" : "expanded"}
            transition={{ duration: 0.3 }}
            className="flex items-center"
          >
            <img
              src="/images/logomut.png"
              alt="MUT Reserve Logo"
              className="h-8 w-auto"
            />
          </motion.div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleSidebar}
            className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors duration-300"
          >
            {isCollapsed ? (
              <ChevronRight size={24} />
            ) : (
              <ChevronLeft size={24} />
            )}
          </motion.button>
        </div>
        <nav className="mt-8 px-2">
          <AnimatePresence>
            {filteredMenuItems.map((item) => (
              <motion.div
                key={item.name}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                variants={itemVariants}
                transition={{ duration: 0.3 }}
                onHoverStart={() => setHoveredItem(item.name)}
                onHoverEnd={() => setHoveredItem(null)}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to={item.path}>
                      <div
                        className={`flex items-center py-3 px-4 rounded-lg mb-2 ${
                          location.pathname === item.path
                            ? "bg-white bg-opacity-20 shadow-lg"
                            : "hover:bg-white hover:bg-opacity-10"
                        } transition-all duration-300 group relative overflow-hidden cursor-pointer`}
                      >
                        <item.icon
                          className={`h-6 w-6 ${
                            isCollapsed ? "mx-auto" : "mr-3"
                          } transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}
                        />
                        {!isCollapsed && (
                          <span className="font-medium truncate">
                            {item.label}
                          </span>
                        )}
                        {location.pathname === item.path && (
                          <motion.div
                            className="absolute left-0 w-1 h-8 bg-gradient-to-b from-pink-500 via-purple-500 to-indigo-500 rounded-r-full"
                            layoutId="activeIndicator"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          />
                        )}
                      </div>
                    </Link>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right" sideOffset={10}>
                      <p>{item.label}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </motion.div>
            ))}
          </AnimatePresence>
        </nav>
      </motion.div>
    </TooltipProvider>
  );
};

export default Sidebar;

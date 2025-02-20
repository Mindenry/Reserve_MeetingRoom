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

  const filteredMenuItems = menuItems.filter((item) => hasPermission(item.mnum));

  const sidebarVariants = {
    expanded: {
      width: 256,
      transition: {
        type: "spring",
        stiffness: 70, // Reduced stiffness for smoother motion
        damping: 20,   // Increased damping to reduce oscillation
        mass: 1,       // Added mass for more natural movement
        duration: 0.4  // Controlled duration
      }
    },
    collapsed: {
      width: 80,
      transition: {
        type: "spring",
        stiffness: 70,
        damping: 20,
        mass: 1,
        duration: 0.4
      }
    }
  };

  const logoVariants = {
    expanded: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 60,
        damping: 14,
        duration: 0.4
      }
    },
    collapsed: {
      opacity: 0,
      x: -20,
      scale: 0.8,
      transition: {
        type: "spring",
        stiffness: 60,
        damping: 14,
        duration: 0.4
      }
    }
  };

  const menuItemVariants = {
    expanded: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 15
      }
    },
    collapsed: {
      x: -10,
      opacity: 0,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 15
      }
    }
  };

  return (
    <TooltipProvider>
      <motion.div
        className={`
          bg-gradient-to-br from-indigo-950 via-purple-900 to-blue-950
          text-white shadow-[0_0_60px_rgba(0,0,0,0.3)]
          h-screen transition-all
          overflow-hidden relative rounded-r-[2.5rem]
          border-r border-white/10
          backdrop-blur-xl
        `}
        initial={false}
        animate={isCollapsed ? "collapsed" : "expanded"}
        variants={sidebarVariants}
        layout
      >
        {/* Enhanced glassmorphism effect */}
        <div className="absolute inset-0 bg-white/5 backdrop-blur-sm rounded-r-[2.5rem]" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-white/5 rounded-r-[2.5rem]" />

        <div className="relative z-10">
          {/* Enhanced header design */}
          <div className="flex justify-between items-center p-6 border-b border-white/10 bg-gradient-to-r from-white/10 to-transparent backdrop-blur-md">
            <motion.div
              variants={logoVariants}
              initial="collapsed"
              animate={isCollapsed ? "collapsed" : "expanded"}
              className="flex items-center gap-3"
            >
              <motion.img
                src="/images/logomut.png"
                alt="MUT Reserve Logo"
                className={`
                  h-10 w-auto
                  ${!isCollapsed ? 'mr-3' : ''}
                  transition-all duration-300
                  filter drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]
                `}
                whileHover={{ scale: 1.05, filter: "brightness(1.2)" }}
              />
            </motion.div>
            
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.15)" }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleSidebar}
              className={`
                p-2.5 rounded-xl
                bg-gradient-to-br from-white/15 to-white/5
                hover:from-white/20 hover:to-white/10
                shadow-lg shadow-black/20
                border border-white/20
                transition-all duration-300
                backdrop-blur-md
                group
              `}
            >
              <motion.div
                animate={{ rotate: isCollapsed ? 0 : 180 }}
                transition={{ duration: 0.4, ease: "anticipate" }}
              >
                <ChevronLeft size={20} className="text-white/90 group-hover:text-white transition-colors" />
              </motion.div>
            </motion.button>
          </div>

          {/* Enhanced navigation menu */}
          <nav className="mt-6 px-3">
            <AnimatePresence>
              {filteredMenuItems.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link to={item.path}>
                        <motion.div
                          className={`
                            flex items-center py-3.5 px-4 rounded-xl mb-2
                            ${location.pathname === item.path
                              ? 'bg-gradient-to-r from-white/20 to-white/5 shadow-lg shadow-black/10'
                              : 'hover:bg-white/10'
                            }
                            group relative overflow-hidden
                            transition-all duration-300 ease-out
                            border border-transparent
                            hover:border-white/20
                            backdrop-blur-sm
                          `}
                          whileHover={{
                            scale: 1.02,
                            transition: { duration: 0.2 }
                          }}
                          variants={menuItemVariants}
                        >
                          {React.createElement(item.icon, {
                            className: `
                              h-5 w-5
                              ${isCollapsed ? "mx-auto" : "mr-3"}
                              transition-all duration-300
                              ${location.pathname === item.path
                                ? "text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.6)]"
                                : "text-white/70 group-hover:text-white"
                              }
                              group-hover:scale-110
                              group-hover:rotate-3
                            `
                          })}
                          
                          <motion.span
                            variants={menuItemVariants}
                            className={`
                              font-medium tracking-wide whitespace-nowrap
                              ${location.pathname === item.path
                                ? "text-white"
                                : "text-white/70 group-hover:text-white"
                              }
                              transition-all duration-300
                            `}
                          >
                            {!isCollapsed && item.label}
                          </motion.span>

                          {location.pathname === item.path && (
                            <>
                              <motion.div
                                className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-400 via-purple-400 to-pink-400"
                                layoutId="activeIndicator"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                              />
                              
                              <motion.div
                                className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/10 to-transparent"
                                initial={{ opacity: 0 }}
                                animate={{
                                  opacity: [0.1, 0.15, 0.1],
                                  scale: [1, 1.01, 1],
                                }}
                                transition={{
                                  duration: 3,
                                  repeat: Infinity,
                                  repeatType: "reverse"
                                }}
                              />
                            </>
                          )}

                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                            initial={{ x: "-100%" }}
                            whileHover={{ x: "100%" }}
                            transition={{
                              duration: 0.8,
                              ease: "easeInOut"
                            }}
                          />
                        </motion.div>
                      </Link>
                    </TooltipTrigger>
                    {isCollapsed && (
                      <TooltipContent
                        side="right"
                        sideOffset={20}
                        className="bg-gradient-to-br from-indigo-950/95 to-purple-900/95 text-white border-white/20 shadow-xl shadow-black/30 backdrop-blur-xl rounded-xl px-4 py-2"
                      >
                        <p>{item.label}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </motion.div>
              ))}
            </AnimatePresence>
          </nav>
        </div>
      </motion.div>
    </TooltipProvider>
  );
};

export default Sidebar;
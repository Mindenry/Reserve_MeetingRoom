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
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
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
      path: "/dashboard/bookinghistory",
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
  const ClockWidget = ({ time }) => {
    const mx = useMotionValue(0);
    const my = useMotionValue(0);
    const tiltY = useTransform(mx, (v) => ((v / (typeof window !== 'undefined' ? window.innerWidth : 1)) * 2 - 1) * 4);
    const tiltX = useTransform(my, (v) => ((v / (typeof window !== 'undefined' ? window.innerHeight : 1)) * 2 - 1) * -4);
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const seconds = time.getSeconds();
    const hourDeg = (hours % 12) * 30 + minutes * 0.5;
    const minuteDeg = minutes * 6 + seconds * 0.1;
    const secondDeg = seconds * 6;
    const radius = 34;
    const circumference = 2 * Math.PI * radius;
    const secProgress = (seconds / 60) * circumference;
    return (
      <motion.div
        onMouseMove={(e) => {
          mx.set(e.clientX);
          my.set(e.clientY);
        }}
        style={{ rotateX: tiltX, rotateY: tiltY }}
        className="relative flex items-center gap-4 bg-white/80 backdrop-blur rounded-2xl px-5 py-3 shadow-md ring-1 ring-black/5"
      >
        <div className="relative">
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.25 }}
              exit={{ opacity: 0 }}
              className="absolute -inset-3 rounded-3xl bg-gradient-to-r from-primary/20 to-purple-500/20 blur"
            />
          </AnimatePresence>
          <div className="relative z-10 flex items-center gap-3">
            <div className="h-16 w-16">
              <svg width="64" height="64" viewBox="0 0 80 80" className="overflow-visible">
                <circle cx="40" cy="40" r={radius} fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="6" />
                <circle
                  cx="40"
                  cy="40"
                  r={radius}
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${secProgress}, ${circumference}`}
                  transform="rotate(-90 40 40)"
                />
                <g transform="translate(40,40)">
                  <line x1="0" y1="0" x2="0" y2="-18" stroke="hsl(var(--foreground))" strokeWidth="3" strokeLinecap="round" style={{ transform: `rotate(${hourDeg}deg)` }} />
                  <line x1="0" y1="0" x2="0" y2="-26" stroke="hsl(var(--foreground))" strokeWidth="2" strokeLinecap="round" style={{ transform: `rotate(${minuteDeg}deg)` }} />
                  <line x1="0" y1="0" x2="0" y2="-30" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" style={{ transform: `rotate(${secondDeg}deg)` }} />
                  <circle cx="0" cy="0" r="2.5" fill="hsl(var(--primary))" />
                </g>
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                {time.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}
              </div>
              <div className="text-sm text-muted-foreground">
                {time.toLocaleDateString("th-TH", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };
  return (
    <header className="bg-background/80 backdrop-blur border-b border-border py-4 px-6 flex justify-between items-center">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center space-x-8"
      >
        <ClockWidget time={time} />
      </motion.div>
      <nav className="hidden md:flex items-center space-x-2">
        {filteredUserMenuItems.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Link
              to={item.path}
              className="text-muted-foreground hover:text-foreground flex items-center transition-all duration-300 px-3 py-2 rounded-lg hover:bg-accent"
            >
              <item.icon className="w-5 h-5 mr-2" />
              <span className="font-medium">{item.label}</span>
            </Link>
          </motion.div>
        ))}
      </nav>
      <div className="flex items-center space-x-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative group px-4 py-2 hover:bg-accent"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center space-x-3"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden shadow-md group-hover:shadow-lg transition-all duration-300">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                  )}
                </div>
                <span className="font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                  {user?.username || `${user?.firstName || ''} ${user?.lastName || ''}`}
                </span>
              </motion.div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-1">
            <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
              <Link to="/dashboard/profile" className="flex items-center space-x-2 py-1.5">
                <User className="h-4 w-4" />
                <span>โปรไฟล์ของฉัน</span>
              </Link>
            </DropdownMenuItem>
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

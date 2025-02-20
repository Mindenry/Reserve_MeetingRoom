import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Calendar,
  Users,
  Clock,
  Building2,
  Sparkles,
  BarChart3,
} from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { Card } from "@/components/ui/card";
const API_URL = "http://localhost:8080";
const fetchRoomStats = async () => {
  const [roomResponse, memberResponse, bookingResponse] = await Promise.all([
    axios.get(`${API_URL}/room`),
    axios.get(`${API_URL}/members`),
    axios.get(`${API_URL}/admin-bookings`),
  ]);
  const rooms = roomResponse.data;
  const members = memberResponse.data;
  const bookings = bookingResponse.data;
  const activeBookings = rooms.filter((room) => room.STUROOM !== 1).length;
  const totalRooms = rooms.length;
  const availableRooms = totalRooms - activeBookings;
  const totalBookings = bookings.length;
  const completedBookings = bookings.filter(
    (booking) => booking.STUBOOKING === 3
  ).length;
  const utilizationRate =
    totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0;
  return {
    totalRooms,
    totalMembers: members.length,
    availableRooms,
    utilizationRate: Math.round(utilizationRate * 10) / 10,
  };
};
const fetchBookingHistory = async () => {
  const response = await axios.get(`${API_URL}/history`);
  const processedData = response.data.reduce((acc, booking) => {
    const date = new Date(booking.BDATE).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(processedData)
    .map(([date, count]) => ({
      BDATE: date,
      count,
    }))
    .sort((a, b) => new Date(a.BDATE) - new Date(b.BDATE));
};
const StatCard = ({ title, value, icon: Icon, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: index * 0.1 }}
    whileHover={{ scale: 1.03, y: -5 }}
  >
    <Card className="relative overflow-hidden rounded-2xl border border-white/20 shadow-xl bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-xl p-1">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />
      <div className="relative p-6">
        <div className="flex items-center justify-between mb-4">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center space-x-3"
          >
            <motion.div
              whileHover={{ rotate: 5, scale: 1.1 }}
              className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg"
            >
              <Icon className="h-6 w-6 text-white" />
            </motion.div>
            <h3 className="text-lg font-medium text-gray-700">{title}</h3>
          </motion.div>
        </div>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="relative"
        >
          <div className="text-4xl font-bold bg-gradient-to-br from-blue-600 to-purple-700 bg-clip-text text-transparent">
            {value}
          </div>
        </motion.div>
      </div>
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-purple-500/10 rounded-full blur-3xl" />
    </Card>
  </motion.div>
);
const HomeSection = () => {
  const {
    data: currentStats = {
      totalRooms: 0,
      totalMembers: 0,
      availableRooms: 0,
      utilizationRate: 0,
    },
    isLoading: isLoadingStats,
  } = useQuery({
    queryKey: ["roomStats"],
    queryFn: fetchRoomStats,
    refetchInterval: 30000,
  });
  const { data: bookingHistory = [], isLoading: isLoadingHistory } = useQuery({
    queryKey: ["bookingHistory"],
    queryFn: fetchBookingHistory,
  });
  if (isLoadingStats || isLoadingHistory) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50"
      >
        <div className="text-center space-y-6">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 360],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-16 h-16 mx-auto"
          >
            <div className="w-full h-full rounded-full border-4 border-purple-500/30 border-t-purple-600 animate-spin" />
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-lg text-purple-900/70 font-medium"
          >
            กำลังโหลดข้อมูล...
          </motion.p>
        </div>
      </motion.div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 to-purple-50/50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative bg-gradient-to-br from-blue-600 to-purple-700 text-white py-48 px-4 overflow-hidden"
      >
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.4, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1605810230434-7631ac76ec81')] bg-cover bg-center opacity-30"
          style={{ filter: 'saturate(0.8) brightness(0.8)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700/80 to-purple-800/80 backdrop-blur-sm" />
        
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="absolute top-0 right-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 7,
            delay: 1,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"
        />
        <div className="container mx-auto max-w-6xl relative z-10">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex items-center gap-4"
            >
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
                className="p-3 rounded-full bg-white/10 backdrop-blur-lg"
              >
                <Sparkles className="h-6 w-6 text-blue-200" />
              </motion.div>
              <h2 className="text-xl font-medium text-blue-100">ระบบจัดการห้องประชุม</h2>
            </motion.div>
            
            <motion.h1
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-7xl font-bold tracking-tight"
            >
              <span className="bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">
                MUT Reserve
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-3xl text-blue-100/90 max-w-3xl font-light leading-relaxed"
            >
              ระบบจองห้องประชุมออนไลน์ มหาวิทยาลัยเทคโนโลยีมหานคร
            </motion.p>
          </motion.div>
        </div>
      </motion.div>
      <div className="container mx-auto max-w-6xl px-4 -mt-24 relative z-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
          <StatCard
            title="ห้องประชุมทั้งหมด"
            value={currentStats.totalRooms}
            icon={Building2}
            index={0}
          />
          <StatCard
            title="จำนวนสมาชิก"
            value={currentStats.totalMembers}
            icon={Users}
            index={1}
          />
          <StatCard
            title="ห้องที่พร้อมใช้"
            value={currentStats.availableRooms}
            icon={Calendar}
            index={2}
          />
          <StatCard
            title="อัตราการใช้งานจริง"
            value={`${currentStats.utilizationRate}%`}
            icon={Clock}
            index={3}
          />
        </div>
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="relative overflow-hidden rounded-3xl backdrop-blur-xl bg-white/80 p-8 shadow-xl border border-white/20"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />
          <div className="relative">
            <div className="flex items-center gap-4 mb-8">
              <motion.div
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600"
              >
                <BarChart3 className="h-6 w-6 text-white" />
              </motion.div>
              <h2 className="text-3xl font-bold bg-gradient-to-br from-blue-600 to-purple-700 bg-clip-text text-transparent">
                สถิติการจอง
              </h2>
            </div>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={bookingHistory}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="BDATE"
                    stroke="#64748b"
                    tick={{ fill: "#64748b" }}
                  />
                  <YAxis stroke="#64748b" tick={{ fill: "#64748b" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      backdropFilter: "blur(8px)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      borderRadius: "16px",
                      boxShadow: "0 8px 32px -4px rgb(0 0 0 / 0.1)",
                      padding: "12px 16px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#6366f1"
                    strokeWidth={3}
                    fill="url(#colorCount)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
        </motion.div>
      </div>
    </div>
  );
};
export default HomeSection;
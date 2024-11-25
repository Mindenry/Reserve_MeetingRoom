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

  // คำนวณอัตราการใช้งานที่แท้จริงจากการจองที่เสร็จสมบูรณ์
  const totalBookings = bookings.length;
  const completedBookings = bookings.filter(
    (booking) => booking.STUBOOKING === 3
  ).length;
  // คำนวณอัตราการใช้งาน
  const utilizationRate =
    totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0; // คำนวณเป็นเปอร์เซ็นต์

  return {
    totalRooms,
    totalMembers: members.length,
    availableRooms,
    utilizationRate: Math.round(utilizationRate * 10) / 10, // ปัดเศษอัตราการใช้งาน
  };
};

// ฟังก์ชันสำหรับดึงประวัติการจอง
const fetchBookingHistory = async () => {
  const response = await axios.get(`${API_URL}/history`);

  // ประมวลผลข้อมูลให้เป็นรูปแบบที่ต้องการ
  const processedData = response.data.reduce((acc, booking) => {
    const date = new Date(booking.BDATE).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  // แปลงข้อมูลกลับเป็นอาร์เรย์และเรียงลำดับตามวันที่
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
    transition={{ duration: 0.5, delay: index * 0.1 }}
    whileHover={{ scale: 1.02, y: -5 }}
  >
    <Card className="transition-all duration-500 hover:shadow-2xl bg-gradient-to-br from-white via-white to-purple-50/30 group relative overflow-hidden border-0 backdrop-blur-xl">
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/5"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
      <motion.div
        className="absolute -right-10 -top-10 w-24 h-24 blur-3xl bg-blue-500/10"
        whileHover={{ scale: 1.5, backgroundColor: "rgba(147, 51, 234, 0.2)" }}
        transition={{ duration: 0.5 }}
      />
      <div className="flex flex-row items-center justify-between space-y-0 pb-2 p-8">
        <motion.div
          className="text-base font-medium text-muted-foreground"
          whileHover={{ color: "#2563eb" }}
        >
          {title}
        </motion.div>
        <motion.div
          className="h-14 w-14 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-3 shadow-lg"
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
        >
          <Icon className="h-8 w-8 text-white" />
        </motion.div>
      </div>
      <motion.div
        className="px-8 pb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {value}
        </div>
      </motion.div>
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
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50/30"
      >
        <motion.div
          className="text-center"
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-6 text-lg text-purple-900/70 font-medium">
            กำลังโหลดข้อมูล...
          </p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50/30">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white py-40 px-4 overflow-hidden"
      >
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1605810230434-7631ac76ec81')] bg-cover bg-center mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/50 to-purple-600/80" />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="absolute -top-24 -right-24 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 4,
            delay: 1,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="container mx-auto max-w-6xl relative z-10"
        >
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex items-center gap-3 mb-8"
          >
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            >
              <Sparkles className="h-8 w-8 text-blue-200" />
            </motion.div>
            <h2 className="text-xl font-light text-blue-200">
              ระบบจัดการห้องประชุม
            </h2>
          </motion.div>
          <motion.h1
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-6xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100 tracking-tight"
          >
            MUT Reserve
          </motion.h1>
          <motion.p
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-2xl md:text-3xl mb-12 text-blue-100 max-w-3xl font-light leading-relaxed"
          >
            ระบบจองห้องประชุมออนไลน์ มหาวิทยาลัยเทคโนโลยีมหานคร
          </motion.p>
        </motion.div>
      </motion.div>
      <div className="container mx-auto max-w-6xl px-4 -mt-20">
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
          className="bg-white/80 backdrop-blur-xl rounded-3xl p-10 shadow-xl mb-12 border border-white/20 relative overflow-hidden group"
        >
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/5 to-blue-500/0"
          />
          <div className="flex items-center gap-3 mb-8">
            <motion.div
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </motion.div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              สถิติการจอง
            </h2>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={bookingHistory}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
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
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    backdropFilter: "blur(8px)",
                    border: "none",
                    borderRadius: "12px",
                    boxShadow: "0 8px 32px -4px rgb(0 0 0 / 0.1)",
                    padding: "12px 16px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fill="url(#colorCount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HomeSection;

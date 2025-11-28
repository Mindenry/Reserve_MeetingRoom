import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { API_URL } from "@/config";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Calendar,
  Users,
  Clock,
  Building2,
  Sparkles,
  BarChart3,
  QrCode,
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
import { Button } from "@/components/ui/button";
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
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: index * 0.1 }}
    whileHover={{ scale: 1.02 }}
  >
    <Card className="rounded-xl bg-white shadow-sm ring-1 ring-black/5">
      <div className="p-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        </div>
        <div className="text-3xl font-bold text-foreground">{value}</div>
      </div>
    </Card>
  </motion.div>
);
const Step = ({ title, desc }) => (
  <div className="rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-5">
    <div className="text-sm font-semibold">{title}</div>
    <div className="text-sm text-muted-foreground mt-1">{desc}</div>
  </div>
);
const HomeSection = () => {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const tiltY = useTransform(mx, (v) => ((v / (typeof window !== 'undefined' ? window.innerWidth : 1)) * 2 - 1) * 6);
  const tiltX = useTransform(my, (v) => ((v / (typeof window !== 'undefined' ? window.innerHeight : 1)) * 2 - 1) * -6);
  const glow1X = useTransform(mx, (v) => ((v / (typeof window !== 'undefined' ? window.innerWidth : 1)) * 2 - 1) * 40);
  const glow1Y = useTransform(my, (v) => ((v / (typeof window !== 'undefined' ? window.innerHeight : 1)) * 2 - 1) * 40);
  const glow2X = useTransform(mx, (v) => ((v / (typeof window !== 'undefined' ? window.innerWidth : 1)) * 2 - 1) * -30);
  const glow2Y = useTransform(my, (v) => ((v / (typeof window !== 'undefined' ? window.innerHeight : 1)) * 2 - 1) * 30);
  const glow3X = useTransform(mx, (v) => ((v / (typeof window !== 'undefined' ? window.innerWidth : 1)) * 2 - 1) * 20);
  const glow3Y = useTransform(my, (v) => ((v / (typeof window !== 'undefined' ? window.innerHeight : 1)) * 2 - 1) * -20);
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
    <div className="min-h-screen bg-background relative overflow-hidden" onMouseMove={(e) => { mx.set(e.clientX); my.set(e.clientY); }}>
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <motion.div style={{ x: glow1X, y: glow1Y }} className="absolute -top-24 -left-24 w-[40rem] h-[40rem] rounded-full blur-3xl bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.25),transparent_60%)]" />
        <motion.div style={{ x: glow2X, y: glow2Y }} className="absolute top-1/3 -right-24 w-[36rem] h-[36rem] rounded-full blur-3xl bg-[radial-gradient(ellipse_at_center,rgba(147,51,234,0.25),transparent_60%)]" />
        <motion.div style={{ x: glow3X, y: glow3Y }} className="absolute bottom-0 left-1/4 w-[32rem] h-[32rem] rounded-full blur-3xl bg-[radial-gradient(ellipse_at_center,rgba(14,165,233,0.25),transparent_60%)]" />
      </div>
      <div className="container mx-auto max-w-7xl px-6 py-14 relative" style={{ perspective: 1200 }}>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} style={{ rotateX: tiltX, rotateY: tiltY }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
              <Sparkles className="h-4 w-4" /> ระบบจัดการห้องประชุม
            </div>
            <h1 className="mt-4 text-6xl md:text-7xl font-extrabold tracking-tight bg-gradient-to-br from-slate-900 to-slate-700 bg-clip-text text-transparent">
              MUT Reserve
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl">
              ประสบการณ์การจองห้องประชุมที่ลื่นไหล ทันสมัย และออกแบบใหม่ทั้งหมดเพื่อความ Wow และความเป็นมืออาชีพ
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/booking">
                <Button className="rounded-full h-11 px-6 bg-gradient-to-r from-primary to-purple-600 hover:from-primary hover:to-purple-700 text-white shadow-md">
                  เริ่มจองทันที
                </Button>
              </Link>
              <Link to="/rooms">
                <Button variant="outline" className="rounded-full h-11 px-6">ดูห้องทั้งหมด</Button>
              </Link>
              <Link to="/bookinghistory">
                <Button variant="ghost" className="rounded-full h-11 px-6">ประวัติการจอง</Button>
              </Link>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} style={{ rotateX: tiltX, rotateY: tiltY }}>
            <Card className="rounded-2xl shadow-lg ring-1 ring-black/5 overflow-hidden">
              <div className="p-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <span className="text-sm text-muted-foreground">ห้องประชุมทั้งหมด</span>
                    </div>
                    <div className="mt-3 text-3xl font-bold">{currentStats.totalRooms}</div>
                  </div>
                  <div className="rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Users className="h-5 w-5" />
                      </div>
                      <span className="text-sm text-muted-foreground">จำนวนสมาชิก</span>
                    </div>
                    <div className="mt-3 text-3xl font-bold">{currentStats.totalMembers}</div>
                  </div>
                  <div className="rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <span className="text-sm text-muted-foreground">ห้องที่พร้อมใช้</span>
                    </div>
                    <div className="mt-3 text-3xl font-bold">{currentStats.availableRooms}</div>
                  </div>
                  <div className="rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Clock className="h-5 w-5" />
                      </div>
                      <span className="text-sm text-muted-foreground">อัตราการใช้งานจริง</span>
                    </div>
                    <div className="mt-3 text-3xl font-bold">{`${currentStats.utilizationRate}%`}</div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <motion.div whileHover={{ y: -4, scale: 1.02 }}>
            <Card className="rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-5">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold">จองง่ายในไม่กี่คลิก</div>
                  <div className="text-sm text-muted-foreground mt-1">เลือกวันที่และเวลาที่ต้องการได้ทันที พร้อมตัวช่วยอัจฉริยะ</div>
                </div>
              </div>
            </Card>
          </motion.div>
          <motion.div whileHover={{ y: -4, scale: 1.02 }}>
            <Card className="rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-5">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <QrCode className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold">QR สำหรับเข้าใช้งาน</div>
                  <div className="text-sm text-muted-foreground mt-1">สร้างและตรวจสอบ QR ได้แบบเรียลไทม์ สะดวก ปลอดภัย</div>
                </div>
              </div>
            </Card>
          </motion.div>
          <motion.div whileHover={{ y: -4, scale: 1.02 }}>
            <Card className="rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-5">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold">วิเคราะห์การใช้งาน</div>
                  <div className="text-sm text-muted-foreground mt-1">ดูสถิติและแนวโน้มการจอง เพื่อวางแผนได้อย่างแม่นยำ</div>
                </div>
              </div>
            </Card>
          </motion.div>
          <motion.div whileHover={{ y: -4, scale: 1.02 }}>
            <Card className="rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-5">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold">สิทธิ์การเข้าถึง</div>
                  <div className="text-sm text-muted-foreground mt-1">จัดการสิทธิ์ด้วยระบบที่ยืดหยุ่น เหมาะกับองค์กร</div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-black/5 mt-10"
      >
          <div className="relative">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">
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
                      backgroundColor: "white",
                      border: "1px solid rgba(0,0,0,0.05)",
                      borderRadius: "12px",
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
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
        </motion.div>

        <div className="mt-14 rounded-2xl bg-white p-6 shadow-lg ring-1 ring-black/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">ขั้นตอนการจองแบบใหม่</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            <Step title="เลือกวันที่" desc="กำหนดวันและเวลาที่ต้องการ" />
            <Step title="เลือกห้อง" desc="ค้นหาและคัดกรองตามเงื่อนไข" />
            <Step title="ยืนยัน" desc="ตรวจรายละเอียดและยืนยันการจอง" />
            <Step title="รับ QR" desc="รับ QR สำหรับเข้าใช้งานทันที" />
          </div>
        </div>
      </div>
    </div>
  );
};
export default HomeSection;

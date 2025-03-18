import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, PieChart as PieChartIcon, TrendingUp, Users, Calendar, BellRing, Layers } from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, PieChart, Pie, Cell, BarChart, Bar, Area, AreaChart
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
    },
  },
};

const chartVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5 },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: { duration: 0.3 },
  },
};

const ReportSection = () => {
  // State for storing data in the component
  const [roomUsageData, setRoomUsageData] = useState([]);
  const [bookingStatusData, setBookingStatusData] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedRoom, setSelectedRoom] = useState("all");
  const [activeTab, setActiveTab] = useState("daily");
  const [lockStatsData, setLockStatsData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Initial data loading
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchData(),
        fetchDepartments(),
        fetchRooms(),
        fetchLockStats(),
      ]);
    };
    loadData();
  }, []);

  // Fetch lock stats data
  const fetchLockStats = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/employee-lock-stats"
      );
      setLockStatsData(response.data);
    } catch (error) {
      console.error("Error fetching lock stats:", error);
    }
  };

  // Fetch monthly data when month, year, or room changes
  useEffect(() => {
    fetchMonthlyData();
  }, [selectedMonth, selectedYear, selectedRoom]);

  // Fetch data when date or room changes
  useEffect(() => {
    fetchFilteredData();
  }, [selectedDate, selectedRoom]);

  // Fetch monthly data
  const fetchMonthlyData = async () => {
    try {
      const response = await axios.get("http://localhost:8080/admin-bookings");
      const filteredData = response.data.filter((booking) => {
        const bookingDate = new Date(booking.BDATE);
        return (
          bookingDate.getMonth() === selectedMonth &&
          bookingDate.getFullYear() === selectedYear &&
          (selectedRoom === "all" || booking.CFRNUM.toString() === selectedRoom)
        );
      });
      const processedData = processRoomUsageData(filteredData);
      setRoomUsageData(processedData);
    } catch (error) {
      console.error("Error fetching monthly data:", error);
    }
  };

  // Fetch all data (bookings, status, departments)
  const fetchData = async () => {
    try {
      const roomUsageResponse = await axios.get(
        "http://localhost:8080/admin-bookings"
      );
      const roomUsage = processRoomUsageData(roomUsageResponse.data);
      setRoomUsageData(roomUsage);
      
      const statusData = processBookingStatusData(roomUsageResponse.data);
      setBookingStatusData(statusData);
      
      const departmentResponse = await axios.get(
        "http://localhost:8080/members"
      );
      const deptData = processDepartmentData(departmentResponse.data);
      setDepartmentData(deptData);
    } catch (error) {
      console.error("Error fetching report data:", error);
    }
  };

  // Fetch departments list
  const fetchDepartments = async () => {
    try {
      const response = await axios.get("http://localhost:8080/departments");
      setDepartments(response.data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  // Fetch meeting rooms list
  const fetchRooms = async () => {
    try {
      const response = await axios.get("http://localhost:8080/rooms");
      const transformedRooms = response.data.map((room) => ({
        id: room.CFRNUMBER,
        name: room.CFRNAME,
      }));
      setRooms(transformedRooms);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  // Fetch filtered data based on selected date and room
  const fetchFilteredData = async () => {
    try {
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      const params = new URLSearchParams();
  
      if (formattedDate) {
        params.append("date", formattedDate);
      }
      if (selectedRoom !== "all") { 
        params.append("roomId", selectedRoom);
      }
  
      const response = await axios.get(`http://localhost:8080/admin-bookings?${params}`);
      const filteredBookings = response.data.filter((booking) => {
        const bookingDate = format(new Date(booking.BDATE), "yyyy-MM-dd");
        return bookingDate === formattedDate;
      });
  
      const processedData = processRoomUsageData(filteredBookings);
      setRoomUsageData(processedData);
    } catch (error) {
      console.error("Error fetching filtered data:", error);
    }
  };

  // Fetch all days data (no filters)
  const fetchAllDaysData = async () => {
    try {
      const response = await axios.get("http://localhost:8080/admin-bookings");
      const processedData = processRoomUsageData(response.data);
      setRoomUsageData(processedData);
    } catch (error) {
      console.error("Error fetching all days data:", error);
    }
  };

  // Process room usage data
  const processRoomUsageData = (data) => {
    const roomUsage = {};
    data.forEach((booking) => {
      const date = format(new Date(booking.BDATE), "yyyy-MM-dd");
      if (!roomUsage[date]) {
        roomUsage[date] = {
          date: format(new Date(date), "dd/MM/yyyy"),
          sortDate: date,
          count: 0,
        };
      }
      roomUsage[date].count++;
    });
    return Object.values(roomUsage).sort((a, b) =>
      a.sortDate.localeCompare(b.sortDate)
    );
  };

  // Process booking status data
  const processBookingStatusData = (data) => {
    const statusCounts = {
      total: 0,
      used: 0,
      cancelled: 0,
      noShow: 0,
    };
    
    data.forEach((booking) => {
      statusCounts.total++;
      if (booking.STUBOOKING === 3) statusCounts.used++;
      else if (booking.STUBOOKING === 5) statusCounts.cancelled++;
      else if (booking.STUBOOKING === 2) statusCounts.noShow++;
    });
    
    return [
      { name: "การจองทั้งหมด", value: statusCounts.total },
      { name: "เข้าใช้งานแล้ว", value: statusCounts.used },
      { name: "ยกเลิกการจอง", value: statusCounts.cancelled },
      { name: "ไม่มาใช้งาน", value: statusCounts.noShow },
    ];
  };

  // Process department data
  const processDepartmentData = (data) => {
    const deptBookings = {};
    
    data.forEach((member) => {
      if (!deptBookings[member.DNAME]) {
        deptBookings[member.DNAME] = {
          department: member.DNAME,
          bookings: 0,
          employees: new Set(),
        };
      }
      deptBookings[member.DNAME].employees.add(member.SSN);
    });
    
    return Object.values(deptBookings).map((dept) => ({
      department: dept.department,
      employees: dept.employees.size,
    }));
  };

  // Render tab content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "daily":
        return (
          <motion.div
            key="daily"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl mb-2">ปริมาณการใช้งานห้องประชุม</CardTitle>
                  <p className="text-sm text-muted-foreground">แสดงข้อมูลการจองห้องประชุมรายวัน</p>
                </div>
                <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="เลือกห้องประชุม" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทุกห้อง</SelectItem>
                    {rooms?.map((room) => (
                      <SelectItem key={room.id.toString()} value={room.id.toString()}>
                        {room.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                <div className="h-[500px] mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={roomUsageData}>
                      <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          padding: "12px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke="#0EA5E9"
                        fillOpacity={1}
                        fill="url(#colorCount)"
                        name="จำนวนการจอง"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      case "status":
        return (
          <motion.div
            key="status"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-xl mb-2">สถานะการจองห้องประชุม</CardTitle>
                <p className="text-sm text-muted-foreground">แสดงสัดส่วนสถานะการจองทั้งหมด</p>
              </CardHeader>
              <CardContent>
                <div className="h-[500px] mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={bookingStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={100}
                        outerRadius={160}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {bookingStatusData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={[
                              "hsl(var(--primary))",
                              "hsl(var(--destructive))",
                              "hsl(215, 90%, 50%)",
                              "hsl(var(--secondary))"
                            ][index % 4]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      case "department":
        return (
          <motion.div
            key="department"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>พนักงานแต่ละแผนก</span>
                  <Select
                    value={selectedDepartment}
                    onValueChange={setSelectedDepartment}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="เลือกแผนก" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ทั้งหมด</SelectItem>
                      {departments?.map((dept) => (
                        <SelectItem
                          key={dept.DNUMBER}
                          value={dept.DNUMBER?.toString() || "0"}
                        >
                          {dept.DNAME}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={departmentData.filter(
                        (dept) =>
                          selectedDepartment === "all" ||
                          dept.department ===
                            departments?.find(
                              (d) => d.DNUMBER?.toString() === selectedDepartment
                            )?.DNAME
                      )}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="opacity-30"
                      />
                      <XAxis
                        dataKey="department"
                        tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                        tickLine={{ stroke: "hsl(var(--foreground))" }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis
                        tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                        tickLine={{ stroke: "hsl(var(--foreground))" }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          padding: "8px",
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey="employees"
                        name="จำนวนพนักงาน"
                        fill="hsl(var(--primary))"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={50}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      case "lockstats":
        return (
          <motion.div
            key="lockstats"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>สถิติการถูกล็อคของพนักงาน</span>
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="เลือกแผนก" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ทั้งหมด</SelectItem>
                      {departments?.map((dept) => (
                        <SelectItem key={dept.DNUMBER} value={dept.DNAME}>
                          {dept.DNAME}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[600px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={lockStatsData.filter(
                        (stat) =>
                          selectedDepartment === "all" || stat.DNAME === selectedDepartment
                      )}
                      margin={{ top: 20, right: 30, left: 20, bottom: 150 }}
                      barGap={20}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis
                        dataKey={(d) => `${d.FNAME} ${d.LNAME}`}
                        tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                        tickLine={{ stroke: "hsl(var(--foreground))" }}
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        interval={0}
                      />
                      <YAxis
                        tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                        tickLine={{ stroke: "hsl(var(--foreground))" }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          padding: "8px",
                        }}
                        formatter={(value, name) => [
                          `${value} ครั้ง`,
                          name === "COUNT" ? "จำนวนครั้งที่ไม่เข้าใช้งานห้อง" : "จำนวนครั้งที่ถูกล็อค",
                        ]}
                      />
                      <Legend
                        formatter={(value) =>
                          value === "COUNT" ? "จำนวนครั้งที่ไม่เข้าใช้งานห้อง" : "จำนวนครั้งที่ถูกล็อค"
                        }
                        wrapperStyle={{paddingTop: "20px"}}
                      />
                      <Bar
                        dataKey="COUNT"
                        name="COUNT"
                        fill="hsl(45, 100%, 50%)"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={40}
                      />
                      <Bar
                        dataKey="LOCKCOUNT"
                        name="LOCKCOUNT"
                        fill="hsl(var(--destructive))"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={40}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8 p-8 max-w-[1800px] mx-auto"
    >
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <motion.div variants={cardVariants} className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            รายงานการใช้งานห้องประชุม
          </h1>
          <p className="text-muted-foreground text-lg">
            แดชบอร์ดแสดงข้อมูลเชิงลึกและการวิเคราะห์การใช้งานห้องประชุม
          </p>
        </motion.div>
        <motion.div variants={cardVariants} className="flex gap-4">
          <Button className="flex gap-2">
            <Calendar className="w-4 h-4" />
            รายงานประจำเดือน
          </Button>
          
        </motion.div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <motion.div variants={cardVariants}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">การจองทั้งหมด</CardTitle>
              <BarChart3 className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">
                {bookingStatusData.find(item => item.name === "การจองทั้งหมด")?.value || 0}
              </div>
              <div className="flex items-center gap-2 text-sm text-emerald-600/80">
                <TrendingUp className="h-4 w-4" />
                <span>เพิ่มขึ้น 12% จากเดือนที่แล้ว</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={cardVariants}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">อัตราการใช้งาน</CardTitle>
              <PieChartIcon className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {Math.round(
                  ((bookingStatusData.find(item => item.name === "เข้าใช้งานแล้ว")?.value || 0) /
                    (bookingStatusData.find(item => item.name === "การจองทั้งหมด")?.value || 1)) * 100
                )}%
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-600/80">
                <Users className="h-4 w-4" />
                <span>อัตราการเข้าใช้งานจริง</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={cardVariants}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">การยกเลิก</CardTitle>
              <BellRing className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {bookingStatusData.find(item => item.name === "ยกเลิกการจอง")?.value || 0}
              </div>
              <div className="flex items-center gap-2 text-sm text-red-600/80">
                <TrendingUp className="h-4 w-4" />
                <span>ลดลง 5% จากเดือนที่แล้ว</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={cardVariants}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">ห้องที่ใช้งานบ่อย</CardTitle>
              <Layers className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {rooms.length}
              </div>
              <div className="flex items-center gap-2 text-sm text-purple-600/80">
                <Calendar className="h-4 w-4" />
                <span>ห้องประชุมทั้งหมด</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <div className="flex justify-between items-center">
          <TabsList className="h-12 bg-muted/20 backdrop-blur">
            <TabsTrigger value="daily" className="flex items-center gap-2 h-10">
              <BarChart3 className="w-4 h-4" />
              ปริมาณการใช้งาน
            </TabsTrigger>
            <TabsTrigger value="status" className="flex items-center gap-2 h-10">
              <PieChartIcon className="w-4 h-4" />
              สถานะการจอง
            </TabsTrigger>
            <TabsTrigger value="department" className="flex items-center gap-2 h-10">
              <Users className="w-4 h-4" />
              แผนก
            </TabsTrigger>
            <TabsTrigger value="lockstats" className="flex items-center gap-2 h-10">
              <BellRing className="w-4 h-4" />
              สถิติการล็อค
            </TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="เลือกเดือน" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    {new Date(2000, i, 1).toLocaleString("th-TH", { month: "long" })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="เลือกปี" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - 2 + i;
                  return (
                    <SelectItem key={year} value={year.toString()}>
                      {year + 543}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Use AnimatePresence for tab transitions */}
        <AnimatePresence mode="sync">
          {renderTabContent()}
        </AnimatePresence>
      </Tabs>
    </motion.div>
  );
};

export default ReportSection;

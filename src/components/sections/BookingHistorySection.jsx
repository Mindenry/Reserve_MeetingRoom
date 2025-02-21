import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  AlertCircle, 
  QrCode, 
  MoreVertical, 
  Info, 
  DoorOpen, 
  Calendar, 
  Clock, 
  Shield, 
  Users, 
  Building, 
  Receipt, 
  Printer 
} from 'lucide-react';
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import CancelConfirmationModal from "../modals/CancelConfirmationModal";
import QRCodeModal from "../modals/QRCodeModal";
import ReceiptDialog from "@/components/ReceiptDialog";

const API_URL = "http://localhost:8080";
const containerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 100 },
  },
};

const BookingHistorySection = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [showCancelReason, setShowCancelReason] = useState(false);
  const [selectedCancelDetails, setSelectedCancelDetails] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const { user } = useAuth();

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API_URL}/user-bookings/${user.ssn}`);
      const sortedBookings = response.data.sort(
        (a, b) => new Date(b.BDATE) - new Date(a.BDATE)
      );
      setBookings(sortedBookings);
    } catch (error) {
      console.error("Error fetching history:", error);
      toast.error("ไม่สามารถดึงข้อมูลการจองได้");
    }
  };

  useEffect(() => {
    if (user?.ssn) {
      fetchHistory();
      const interval = setInterval(fetchHistory, 60000);
      return () => clearInterval(interval);
    }
  }, [user?.ssn]);

  const handleCancelBooking = (booking) => {
    setSelectedBooking(booking);
    setIsCancelModalOpen(true);
  };

  const handleShowCancelReason = async (booking) => {
    try {
      const response = await axios.get(`${API_URL}/cancel-reason/${booking.RESERVERID}`);
      if (response.data.success) {
        setSelectedCancelDetails({
          reason: response.data.reason || "ไม่พบข้อมูลเหตุผลการยกเลิก",
        });
        setShowCancelReason(true);
      } else {
        throw new Error(response.data.error || "Failed to fetch cancel details");
      }
    } catch (error) {
      console.error("Error fetching cancel details:", error);
      toast.error("ไม่สามารถดึงข้อมูลการยกเลิกได้");
    }
  };

  const confirmCancelBooking = async () => {
    if (selectedBooking) {
      try {
        const response = await axios.post(`${API_URL}/cancel/${selectedBooking.RESERVERID}/${selectedBooking.CFRNUM}`);
        if (response.data.success) {
          setBookings((prevBookings) =>
            prevBookings.map((b) =>
              b.RESERVERID === selectedBooking.RESERVERID ? { ...b, STUBOOKING: 5 } : b
            )
          );
          toast.success("การจองถูกยกเลิกเรียบร้อยแล้ว");
          await fetchHistory();
        } else {
          toast.error(response.data.error || "เกิดข้อผิดพลาดในการยกเลิกการจอง");
        }
        setIsCancelModalOpen(false);
      } catch (error) {
        console.error("Error cancelling booking:", error);
        toast.error(error.response?.data?.error || "เกิดข้อผิดพลาดในการยกเลิกการจอง");
      }
    }
  };

  const handleShowQRCode = (booking) => {
    setSelectedBooking(booking);
    setIsQRModalOpen(true);
  };

  const handleShowReceipt = (booking) => {
    setSelectedBooking(booking);
    setIsReceiptOpen(true);
  };

  const isTimeToShowQR = (booking) => {
    const now = new Date();
    const startTime = new Date(booking.STARTTIME);
    return now >= startTime && booking.STUBOOKING === 1;
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      1: { 
        label: "จอง", 
        gradientClass: "from-blue-500 to-blue-600",
        icon: Calendar,
        bgClass: "bg-blue-50",
        textClass: "text-blue-700"
      },
      2: { 
        label: "ไม่มีการเข้าใช้ห้อง", 
        gradientClass: "from-red-500 to-red-600",
        icon: Building,
        bgClass: "bg-red-50",
        textClass: "text-red-700"
      },
      3: { 
        label: "เข้าใช้งานแล้ว", 
        gradientClass: "from-green-500 to-green-600",
        icon: Users,
        bgClass: "bg-green-50",
        textClass: "text-green-700"
      },
      4: { 
        label: "รออนุมัติ", 
        gradientClass: "from-yellow-500 to-yellow-600",
        icon: Clock,
        bgClass: "bg-yellow-50",
        textClass: "text-yellow-700"
      },
      5: { 
        label: "ยกเลิกการจอง", 
        gradientClass: "from-gray-500 to-gray-600",
        icon: Shield,
        bgClass: "bg-gray-50",
        textClass: "text-gray-700"
      }
    };
    return statusMap[status] || {
      label: "ไม่ทราบสถานะ",
      gradientClass: "from-gray-500 to-gray-600",
      icon: Info,
      bgClass: "bg-gray-50",
      textClass: "text-gray-700"
    };
  };

  const getStatusBadge = (status) => {
    const statusInfo = getStatusInfo(status);
    const IconComponent = statusInfo.icon;
    return (
      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium text-xs ${statusInfo.bgClass} ${statusInfo.textClass}`}>
          <IconComponent className="w-3.5 h-3.5" />
          {statusInfo.label}
        </span>
      </div>
    );
  };

  const getBookingStats = () => {
    const total = bookings.length;
    const active = bookings.filter(b => b.STUBOOKING === 1).length;
    const completed = bookings.filter(b => b.STUBOOKING === 3).length;
    const cancelled = bookings.filter(b => b.STUBOOKING === 5).length;
    return { total, active, completed, cancelled };
  };

  const EmptyState = ({ message, description }) => (
    <motion.div
      className="text-center py-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-2xl shadow-inner">
        <div className="bg-white/50 rounded-full p-4 w-16 h-16 mx-auto mb-4 backdrop-blur-sm">
          <AlertCircle className="w-8 h-8 text-blue-400" />
        </div>
        <p className="mt-2 text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {message}
        </p>
        {description && <p className="mt-2 text-sm text-gray-500">{description}</p>}
      </div>
    </motion.div>
  );

  if (!user?.ssn) {
    return (
      <motion.div 
        variants={containerVariants} 
        initial="hidden" 
        animate="visible" 
        className="min-h-screen py-8 px-4"
      >
        <Card className="max-w-4xl mx-auto overflow-hidden shadow-2xl rounded-xl border-0">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
            <CardTitle className="text-3xl font-bold flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <DoorOpen className="h-8 w-8" />
              </div>
              ประวัติการจองห้อง
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <EmptyState message="กรุณาเข้าสู่ระบบเพื่อดูประวัติการจอง" />
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const stats = getBookingStats();

  return (
    <motion.div 
      variants={containerVariants} 
      initial="hidden" 
      animate="visible" 
      className="min-h-screen py-8 px-4"
    >
      <motion.div variants={itemVariants} className="max-w-6xl mx-auto">
        <motion.div variants={itemVariants} className="text-center mb-8 space-y-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
            className="flex justify-center"
          >
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
              <DoorOpen className="w-6 h-6 text-white" />
            </div>
          </motion.div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ประวัติการจองห้อง
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white shadow-lg"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">การจองทั้งหมด</h3>
              <div className="p-2 bg-white/10 rounded-lg">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold mt-2">{stats.total}</p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-4 text-white shadow-lg"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">กำลังใช้งาน</h3>
              <div className="p-2 bg-white/10 rounded-lg">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold mt-2">{stats.active}</p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-4 text-white shadow-lg"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">เสร็จสิ้น</h3>
              <div className="p-2 bg-white/10 rounded-lg">
                <Shield className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold mt-2">{stats.completed}</p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-4 text-white shadow-lg"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">ยกเลิก</h3>
              <div className="p-2 bg-white/10 rounded-lg">
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold mt-2">{stats.cancelled}</p>
          </motion.div>
        </div>

        <Card className="overflow-hidden shadow-xl rounded-xl border-0">
          <CardHeader className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgeD0iMCIgeT0iMCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDIwIDAgTCAwIDAgMCAyMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')]" />
            <div className="relative z-10">
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                  <DoorOpen className="h-6 w-6" />
                </div>
                รายการจองทั้งหมด
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {bookings.length === 0 ? (
              <EmptyState
                message="ไม่พบประวัติการจอง"
                description="ยังไม่มีการจองห้องใดๆ"
              />
            ) : (
              <div className="overflow-x-auto rounded-xl shadow-sm border border-gray-100">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100/50">
                      <TableHead className="font-semibold">รหัสการจอง</TableHead>
                      <TableHead className="font-semibold">ห้อง</TableHead>
                      <TableHead className="font-semibold">วันที่</TableHead>
                      <TableHead className="font-semibold">เริ่มต้น</TableHead>
                      <TableHead className="font-semibold">สิ้นสุด</TableHead>
                      <TableHead className="font-semibold">สถานะ</TableHead>
                      <TableHead className="font-semibold">เข้าใช้งาน</TableHead>
                      <TableHead className="font-semibold text-right">พิมพ์</TableHead>
                      <TableHead className="font-semibold text-right">จัดการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {bookings.map((booking, index) => (
                        <motion.tr
                          key={booking.RESERVERID}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-blue-50/50 transition-colors`}
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${getStatusInfo(booking.STUBOOKING).gradientClass}`} />
                              {booking.RESERVERID}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium text-gray-900">{booking.CFRNAME}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-gray-600">
                              {format(new Date(booking.BDATE), "dd MMM yyyy")}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-gray-600">
                              {format(new Date(booking.STARTTIME), "HH:mm")}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-gray-600">
                              {format(new Date(booking.ENDTIME), "HH:mm")}
                            </span>
                          </TableCell>
                          <TableCell>{getStatusBadge(booking.STUBOOKING)}</TableCell>
                          <TableCell>
                            <span className="text-gray-600">
                              {booking.TIME ? format(new Date(booking.TIME), "HH:mm") : "-"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="hover:bg-blue-50 transition-colors text-blue-600"
                              onClick={() => {
                                handleShowReceipt(booking);
                                setTimeout(() => {
                                  window.print();
                                }, 500);
                              }}
                            >
                              <Printer className="h-4 w-4" />
                              <span className="sr-only">พิมพ์ใบเสร็จ</span>
                            </Button>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  className="h-8 w-8 p-0 hover:bg-blue-50 transition-colors"
                                  disabled={booking.STUBOOKING === 3}
                                >
                                  <span className="sr-only">Open menu</span>
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="w-48 bg-white shadow-lg rounded-lg border-0"
                              >
                                {(booking.STUBOOKING === 1 || booking.STUBOOKING === 4) && (
                                  <DropdownMenuItem
                                    onClick={() => handleCancelBooking(booking)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer px-4 py-2 text-sm"
                                  >
                                    ยกเลิก
                                  </DropdownMenuItem>
                                )}
                                {booking.STUBOOKING === 5 && (
                                  <DropdownMenuItem
                                    onClick={() => handleShowCancelReason(booking)}
                                    className="hover:bg-blue-50 transition-colors cursor-pointer px-4 py-2 text-sm"
                                  >
                                    <Info className="h-4 w-4 mr-2" />
                                    ดูเหตุผลการยกเลิก
                                  </DropdownMenuItem>
                                )}
                                {isTimeToShowQR(booking) && (
                                  <DropdownMenuItem
                                    onClick={() => handleShowQRCode(booking)}
                                    className="hover:bg-blue-50 transition-colors cursor-pointer px-4 py-2 text-sm"
                                  >
                                    <QrCode className="mr-2 h-4 w-4" /> QR Code
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onClick={() => handleShowReceipt(booking)}
                                  className="hover:bg-blue-50 transition-colors cursor-pointer px-4 py-2 text-sm"
                                >
                                  <Receipt className="mr-2 h-4 w-4" /> ดูใบเสร็จ
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <CancelConfirmationModal
          isOpen={isCancelModalOpen}
          onClose={() => setIsCancelModalOpen(false)}
          onConfirm={confirmCancelBooking}
          booking={selectedBooking}
        />

        <QRCodeModal
          isOpen={isQRModalOpen}
          onClose={() => setIsQRModalOpen(false)}
          booking={selectedBooking}
        />

        <Dialog open={showCancelReason} onOpenChange={setShowCancelReason}>
          <DialogContent className="sm:max-w-[525px] p-0 overflow-hidden bg-white shadow-2xl">
            <DialogHeader className="px-6 pt-6 pb-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
              <DialogTitle className="text-xl font-semibold flex items-center">
                <div className="p-2 bg-white/10 rounded-lg mr-3">
                  <Info className="h-6 w-6" />
                </div>
                <span>เหตุผลการยกเลิก</span>
              </DialogTitle>
            </DialogHeader>
            <div className="p-6">
              {selectedCancelDetails && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-50 p-6 rounded-xl border border-gray-100"
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        รายละเอียดการยกเลิก
                      </h4>
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {selectedCancelDetails.reason}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <ReceiptDialog
          isOpen={isReceiptOpen}
          onClose={() => setIsReceiptOpen(false)}
          booking={selectedBooking}
        />
      </motion.div>
    </motion.div>
  );
};

export default BookingHistorySection;
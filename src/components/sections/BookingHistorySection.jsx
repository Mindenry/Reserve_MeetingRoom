import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, QrCode, MoreVertical, Info } from "lucide-react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import CancelConfirmationModal from "../modals/CancelConfirmationModal";
import QRCodeModal from "../modals/QRCodeModal";

const API_URL = "http://localhost:8080";

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

const tableVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const rowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 100,
    },
  },
};

const BookingHistorySection = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [showCancelReason, setShowCancelReason] = useState(false);
  const [selectedCancelDetails, setSelectedCancelDetails] = useState(null);
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
      const response = await axios.get(
        `${API_URL}/cancel-reason/${booking.RESERVERID}`
      );
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
        const response = await axios.post(
          `${API_URL}/cancel/${selectedBooking.RESERVERID}/${selectedBooking.CFRNUM}`
        );
        if (response.data.success) {
          setBookings((prevBookings) =>
            prevBookings.map((b) =>
              b.RESERVERID === selectedBooking.RESERVERID
                ? { ...b, STUBOOKING: 5 }
                : b
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
        toast.error(
          error.response?.data?.error || "เกิดข้อผิดพลาดในการยกเลิกการจอง"
        );
      }
    }
  };

  const handleShowQRCode = (booking) => {
    setSelectedBooking(booking);
    setIsQRModalOpen(true);
  };

  const isTimeToShowQR = (booking) => {
    const now = new Date();
    const startTime = new Date(booking.STARTTIME);
    return now >= startTime && booking.STUBOOKING === 1;
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      1: { label: "จอง", color: "bg-blue-500" },
      2: { label: "ไม่มีการเข้าใช้ห้อง", color: "bg-red-500" },
      3: { label: "เข้าใช้งานแล้ว", color: "bg-green-500" },
      4: { label: "รออนุมัติ", color: "bg-yellow-500" },
      5: { label: "ยกเลิกการจอง", color: "bg-gray-500" },
    };
    const status_info = statusMap[status] || {
      label: "ไม่ทราบสถานะ",
      color: "bg-gray-500",
    };
    return <Badge className={status_info.color}>{status_info.label}</Badge>;
  };

  const EmptyState = ({ message, description }) => (
    <motion.div
      className="text-center py-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
      <p className="mt-2 text-lg font-semibold text-gray-900">{message}</p>
      {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
    </motion.div>
  );

  if (!user?.ssn) {
    return (
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <Card className="max-w-6xl mx-auto overflow-hidden shadow-lg rounded-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <CardTitle className="text-2xl font-bold">
              ประวัติการจองห้อง
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <EmptyState message="กรุณาเข้าสู่ระบบเพื่อดูประวัติการจอง" />
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <Card className="max-w-6xl mx-auto overflow-hidden shadow-lg rounded-lg">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <CardTitle className="text-2xl font-bold">
            ประวัติการจองห้อง
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {bookings.length === 0 ? (
            <EmptyState
              message="ไม่พบประวัติการจอง"
              description="ยังไม่มีการจองห้องใดๆ"
            />
          ) : (
            <div className="overflow-x-auto">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={tableVariants}
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>รหัสการจอง</TableHead>
                      <TableHead>ชื่อห้อง</TableHead>
                      <TableHead>วันที่</TableHead>
                      <TableHead>เวลาเริ่มต้น</TableHead>
                      <TableHead>เวลาสิ้นสุด</TableHead>
                      <TableHead>สถานะ</TableHead>
                      <TableHead>เวลาเข้าใช้งาน</TableHead>
                      <TableHead>การดำเนินการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <motion.tr
                        key={booking.RESERVERID}
                        variants={rowVariants}
                        className="hover:bg-gray-50"
                      >
                        <TableCell className="font-medium">
                          {booking.RESERVERID}
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{booking.CFRNAME}</span>
                        </TableCell>
                        <TableCell>
                          {format(new Date(booking.BDATE), "dd MMM yyyy")}
                        </TableCell>
                        <TableCell>
                          {format(new Date(booking.STARTTIME), "HH:mm")}
                        </TableCell>
                        <TableCell>
                          {format(new Date(booking.ENDTIME), "HH:mm")}
                        </TableCell>
                        <TableCell>{getStatusBadge(booking.STUBOOKING)}</TableCell>
                        <TableCell>
                          {booking.TIME
                            ? format(new Date(booking.TIME), "HH:mm")
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                disabled={booking.STUBOOKING === 3}
                              >
                                <span className="sr-only">Open menu</span>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {(booking.STUBOOKING === 1 ||
                                booking.STUBOOKING === 4) && (
                                <DropdownMenuItem
                                  onClick={() => handleCancelBooking(booking)}
                                  className="text-red-600"
                                >
                                  ยกเลิก
                                </DropdownMenuItem>
                              )}
                              {booking.STUBOOKING === 5 && (
                                <DropdownMenuItem
                                  onClick={() => handleShowCancelReason(booking)}
                                >
                                  <Info className="h-4 w-4 mr-2" />
                                  ดูเหตุผลการยกเลิก
                                </DropdownMenuItem>
                              )}
                              {isTimeToShowQR(booking) && (
                                <DropdownMenuItem
                                  onClick={() => handleShowQRCode(booking)}
                                >
                                  <QrCode className="mr-2 h-4 w-4" /> QR Code
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </motion.div>
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
          <DialogHeader className="px-6 pt-6 pb-4 bg-gradient-to-r from-blue-50 to-blue-100/50 border-b">
            <DialogTitle className="text-xl font-semibold flex items-center">
              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                <Info className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-blue-900">เหตุผลการยกเลิก</span>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 bg-gradient-to-b from-white to-blue-50/30">
            {selectedCancelDetails && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 mt-2 rounded-full bg-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">
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
          <div className="flex justify-end px-6 py-4 bg-gradient-to-b from-blue-50/30 to-blue-50 border-t border-blue-100">
            <Button
              onClick={() => setShowCancelReason(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all duration-200 ease-in-out hover:shadow-md"
            >
              ปิด
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default BookingHistorySection;


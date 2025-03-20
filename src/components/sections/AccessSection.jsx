import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  MoreVertical,
  Info,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";

const ITEMS_PER_PAGE = 10;

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

const AccessSection = () => {
  const [accessRecords, setAccessRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingToApprove, setBookingToApprove] = useState(null); // Add this line
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelReason, setShowCancelReason] = useState(false);
  const [selectedCancelDetails, setSelectedCancelDetails] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [user, setUser] = useState(null);

  const statusMap = {
    1: "จองสำเร็จ",
    2: "ไม่มีการเข้าใช้ห้อง",
    3: "เข้าใช้งานแล้ว",
    4: "รออนุมัติ",
    5: "ยกเลิกการจอง",
  };

  const statusColors = {
    1: "bg-green-100 text-green-800",
    2: "bg-gray-100 text-gray-800",
    3: "bg-blue-100 text-blue-800",
    4: "bg-yellow-100 text-yellow-800",
    5: "bg-red-100 text-red-800",
  };

  useEffect(() => {
    fetchAccessRecords();
    const statusCheckInterval = setInterval(async () => {
      try {
        await axios.post("http://localhost:8080/check-room-status");
        fetchAccessRecords();
      } catch (error) {
        console.error("Error checking room status:", error);
      }
    }, 60000);
    return () => clearInterval(statusCheckInterval);
  }, []);

  const fetchAccessRecords = async () => {
    try {
      const response = await fetch("http://localhost:8080/admin-bookings");
      if (!response.ok) throw new Error("Error fetching access records");
      const data = await response.json();
      setAccessRecords(data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("ไม่สามารถดึงข้อมูลการจองได้");
    }
  };

  const handleShowCancelReason = async (booking) => {
    try {
      const response = await fetch(
        `http://localhost:8080/cancel-reason/${booking.RESERVERID}`
      );
      if (!response.ok) throw new Error("Failed to fetch cancel details");
      const data = await response.json();
      if (!data.success)
        throw new Error(data.error || "Failed to fetch cancel details");
      setSelectedCancelDetails({
        reason: data.reason || "ไม่พบข้อมูลเหตุผลการยกเลิก",
      });
      setShowCancelReason(true);
    } catch (error) {
      console.error("Error fetching cancel details:", error);
      toast.error("ไม่สามารถดึงข้อมูลการยกเลิกได้");
    }
  };

  const handleCancelClick = (booking) => {
    setSelectedBooking(booking);
    setCancelReason("");
    setCancelDialogOpen(true);
  };

  const handleCancelBooking = async () => {
    if (!cancelReason.trim()) {
      toast.error("กรุณาระบุเหตุผลในการยกเลิก");
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:8080/cancel/${selectedBooking.RESERVERID}/${selectedBooking.CFRNUM}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reason: cancelReason,
            empId: user?.ssn || "",
          }),
        }
      );
      if (!response.ok) throw new Error("Failed to cancel booking");
      const data = await response.json();
      if (data.success) {
        toast.success("ยกเลิกการจองเรียบร้อยแล้ว");
        fetchAccessRecords();
        setCancelDialogOpen(false);
      } else {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการยกเลิกการจอง");
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.error("เกิดข้อผิดพลาดในการยกเลิกการจอง");
    }
  };

  const handleApproveClick = (booking) => {
    setBookingToApprove(booking);
    setApproveDialogOpen(true);
  };

  const handleApproveBooking = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/approve/${bookingToApprove.RESERVERID}/${bookingToApprove.CFRNUM}`,
        { method: "POST" }
      );
      if (!response.ok) throw new Error("Failed to approve booking");
      const data = await response.json();
      if (data.success) {
        setApproveDialogOpen(false);
        await fetchAccessRecords();
        toast.success("อนุมัติการจองสำเร็จ");
      } else {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการอนุมัติการจอง");
      }
    } catch (error) {
      console.error("Error approving booking:", error);
      toast.error("เกิดข้อผิดพลาดในการอนุมัติการจอง");
    }
  };

  const filteredRecords = accessRecords.filter((record) =>
    Object.values(record).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const sortedRecords = filteredRecords.sort(
    (a, b) => new Date(b.BDATE) - new Date(a.BDATE)
  );

  const totalPages = Math.ceil(sortedRecords.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedRecords = sortedRecords.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
    document
      .querySelector(".rounded-md.border")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  // Animation variants
  const tableVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };
  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
    exit: {
      opacity: 0,
      x: -20,
      transition: {
        duration: 0.2,
      },
    },
  };
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="p-6 space-y-6"
    >
      <Card className="backdrop-blur-sm bg-white/90 border-none shadow-xl">
        <CardHeader className="border-b border-gray-100 pb-6">
          <div className="flex items-center justify-between">
            <motion.div variants={itemVariants}>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Manage Room Reservations
              </CardTitle>
            </motion.div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <motion.div
            variants={itemVariants}
            className="flex items-center space-x-4 mb-6"
          >
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="ค้นหาการจอง..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 transition-all duration-300"
              />
            </div>
          </motion.div>
          <motion.div
            variants={itemVariants}
            className="booking-table overflow-hidden rounded-lg border border-gray-200 bg-white"
          >
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold text-gray-600">
                    รหัสการจอง
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600">
                    รหัสพนักงาน
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600">
                    ชื่อห้อง
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600">
                    วันที่เริ่มต้น
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600">
                    เวลาเริ่มต้น
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600">
                    เวลาสิ้นสุด
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600">
                    เวลาเข้าใช้งาน
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600">
                    สถานะ
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600">
                    การจัดการ
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence mode="wait">
                  {paginatedRecords.length === 0 ? (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <TableCell
                        colSpan={9}
                        className="h-[400px] text-center text-gray-500"
                      >
                        ไม่พบข้อมูล
                      </TableCell>
                    </motion.tr>
                  ) : (
                    paginatedRecords.map((record) => (
                      <motion.tr
                        key={record.RESERVERID}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="hover:bg-gray-50/50 transition-colors duration-200"
                      >
                        <TableCell className="font-medium">
                          {record.RESERVERID}
                        </TableCell>
                        <TableCell>{record.ESSN}</TableCell>
                        <TableCell>{record.CFRNAME}</TableCell>
                        <TableCell>
                          {new Date(record.BDATE).toLocaleDateString("th-TH")}
                        </TableCell>
                        <TableCell>
                          {new Date(record.STARTTIME).toLocaleTimeString(
                            "th-TH",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(record.ENDTIME).toLocaleTimeString(
                            "th-TH",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </TableCell>
                        <TableCell>
                          {record.TIME
                            ? new Date(record.TIME).toLocaleTimeString(
                                "th-TH",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                              statusColors[record.STUBOOKING]
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current mr-2"></span>
                            {statusMap[record.STUBOOKING]}
                          </span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="h-8 w-8 p-0 hover:bg-gray-100 transition-colors duration-200"
                                disabled={
                                  record.STUBOOKING === 2 ||
                                  record.STUBOOKING === 3
                                }
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            {record.STUBOOKING !== 2 &&
                              record.STUBOOKING !== 3 && (
                                <DropdownMenuContent
                                  align="end"
                                  className="w-32"
                                >
                                  {record.STUBOOKING === 4 && (
                                    <>
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleApproveClick(record)
                                        }
                                        className="cursor-pointer"
                                      >
                                        Approve
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleCancelClick(record)
                                        }
                                        className="cursor-pointer text-red-600"
                                      >
                                        Cancel
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  {record.STUBOOKING === 1 && (
                                    <DropdownMenuItem
                                      onClick={() => handleCancelClick(record)}
                                      className="cursor-pointer text-red-600"
                                    >
                                      Cancel
                                    </DropdownMenuItem>
                                  )}
                                  {record.STUBOOKING === 5 && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleShowCancelReason(record)
                                      }
                                      className="cursor-pointer"
                                    >
                                      <Info className="h-4 w-4 mr-2" />
                                      View Cancellation Reason
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              )}
                          </DropdownMenu>
                        </TableCell>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </TableBody>
            </Table>
            {/* Pagination */}
            <div className="border-t border-gray-200 px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  แสดง <span className="font-medium">{startIndex + 1}</span> ถึง{" "}
                  <span className="font-medium">
                    {Math.min(
                      startIndex + ITEMS_PER_PAGE,
                      sortedRecords.length
                    )}
                  </span>{" "}
                  จาก{" "}
                  <span className="font-medium">{sortedRecords.length}</span>{" "}
                  รายการ
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {[...Array(totalPages)].map((_, i) => (
                    <Button
                      key={i + 1}
                      variant={currentPage === i + 1 ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(i + 1)}
                      className={`h-8 w-8 p-0 ${
                        currentPage === i + 1
                          ? "bg-emerald-600 hover:bg-emerald-700"
                          : ""
                      }`}
                    >
                      {i + 1}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </CardContent>
      </Card>
      {/* Keep existing dialogs with the same structure */}
      <AnimatePresence>
        {cancelDialogOpen && (
          <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              <DialogContent className="sm:max-w-[525px] p-0 overflow-hidden bg-white">
                <DialogHeader className="px-6 pt-6 pb-4 bg-red-50/50 border-b">
                  <DialogTitle className="text-xl font-semibold flex items-center text-red-700">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 mr-2 text-red-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    ยกเลิกการจอง #{selectedBooking?.RESERVERID}
                  </DialogTitle>
                </DialogHeader>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        เหตุผลในการยกเลิก
                      </label>
                      <Textarea
                        placeholder="กรุณาระบุเหตุผล..."
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        className="min-h-[120px] resize-none border-gray-200 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 px-6 py-4 bg-gray-50 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setCancelDialogOpen(false)}
                    className="hover:bg-gray-100"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleCancelBooking}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Confirm Cancellation
                  </Button>
                </div>
              </DialogContent>
            </motion.div>
          </Dialog>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showCancelReason && (
          <Dialog open={showCancelReason} onOpenChange={setShowCancelReason}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
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
                    <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm">
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
                    </div>
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
            </motion.div>
          </Dialog>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {approveDialogOpen && (
          <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              <DialogContent className="sm:max-w-[525px] p-0 overflow-hidden bg-white rounded-xl shadow-2xl transform transition-all">
                <DialogHeader className="px-6 pt-6 pb-4 bg-gradient-to-r from-green-50 via-green-50/70 to-white border-b">
                  <DialogTitle className="text-xl font-semibold flex items-center text-green-800">
                    <div className="bg-green-100 p-2.5 rounded-lg mr-3 shadow-sm">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-green-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="flex flex-col">
                      <span>Confirm Booking Approval</span>
                      <span className="text-sm font-normal text-green-600 mt-0.5">
                        Please review the information before proceeding.
                      </span>
                    </div>
                  </DialogTitle>
                </DialogHeader>
                <div className="p-6 bg-gradient-to-b from-white to-green-50/30">
                  <div className="space-y-4">
                    {bookingToApprove && (
                      <div className="bg-white rounded-xl border border-green-100 shadow-sm overflow-hidden">
                        <div className="px-4 py-3 bg-green-50 border-b border-green-100">
                          <h3 className="text-sm font-medium text-green-800 flex items-center">
                            <svg
                              className="w-4 h-4 mr-2 text-green-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            รายละเอียดการจอง
                          </h3>
                        </div>
                        <div className="p-4 space-y-3">
                          <div className="flex items-center space-x-3 text-sm">
                            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                              <span className="text-green-600 text-xs">#</span>
                            </div>
                            <span className="text-gray-500">รหัสการจอง:</span>
                            <span className="font-medium text-gray-900">
                              {bookingToApprove.RESERVERID}
                            </span>
                          </div>
                          <div className="flex items-center space-x-3 text-sm">
                            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                              <svg
                                className="w-3 h-3 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                />
                              </svg>
                            </div>
                            <span className="text-gray-500">ห้อง:</span>
                            <span className="font-medium text-gray-900">
                              {bookingToApprove.CFRNAME}
                            </span>
                          </div>
                          <div className="flex items-center space-x-3 text-sm">
                            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                              <svg
                                className="w-3 h-3 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            </div>
                            <span className="text-gray-500">วันที่:</span>
                            <span className="font-medium text-gray-900">
                              {new Date(
                                bookingToApprove.BDATE
                              ).toLocaleDateString("th-TH")}
                            </span>
                          </div>
                          <div className="flex items-center space-x-3 text-sm">
                            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                              <svg
                                className="w-3 h-3 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                              </svg>
                            </div>
                            <span className="text-gray-500">เวลา:</span>
                            <span className="font-medium text-gray-900">
                              {new Date(
                                bookingToApprove.STARTTIME
                              ).toLocaleTimeString("th-TH", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}{" "}
                              -{" "}
                              {new Date(
                                bookingToApprove.ENDTIME
                              ).toLocaleTimeString("th-TH", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start space-x-3 px-1">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-yellow-100 flex items-center justify-center mt-0.5">
                        <svg
                          className="w-3 h-3 text-yellow-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-600">
                        กรุณาตรวจสอบข้อมูลให้ถูกต้องก่อนดำเนินการ
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 px-6 py-4 bg-gradient-to-b from-green-50/30 to-green-50 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setApproveDialogOpen(false)}
                    className="hover:bg-gray-100 transition-colors duration-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleApproveBooking}
                    className="bg-green-600 hover:bg-green-700 text-white shadow-sm transition-all duration-200 ease-in-out"
                  >
                    Confirm Approval
                  </Button>
                </div>
              </DialogContent>
            </motion.div>
          </Dialog>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
export default AccessSection;

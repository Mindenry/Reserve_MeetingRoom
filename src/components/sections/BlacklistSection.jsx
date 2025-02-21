import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MoreVertical, Unlock, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

const BlacklistSection = () => {
  const [blacklistedUsers, setBlacklistedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [unlockDialogOpen, setUnlockDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchBlacklistedUsers = async () => {
    try {
      const response = await axios.get("http://localhost:8080/blacklist");
      setBlacklistedUsers(response.data);
    } catch (error) {
      console.error("Error fetching blacklisted users:", error);
      toast.error("ไม่สามารถดึงข้อมูลบัญชีดำได้");
    }
  };

  useEffect(() => {
    fetchBlacklistedUsers();
  }, []);

  const handleUnlockUser = async () => {
    try {
      const response = await axios.post(`http://localhost:8080/unlock-employee/${selectedUser.ESSN}`);
      if (response.data.success) {
        toast.success(
          <div className="flex items-start space-x-4 p-2">
            <div className="flex-shrink-0 bg-green-100 rounded-full p-2">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <div className="font-semibold text-green-800 text-base">ปลดล็อคบัญชีดำสำเร็จ</div>
              <div className="space-y-1">
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>รหัสพนักงาน: </span>
                  <span className="ml-1 font-medium text-green-700">{selectedUser?.ESSN}</span>
                </div>
              </div>
            </div>
          </div>,
          {
            duration: 3000,
            className: "bg-white border-l-4 border-l-green-500 shadow-lg rounded-lg",
            style: {
              background: "linear-gradient(to right, #f0fdf4, white)",
            },
          }
        );
        fetchBlacklistedUsers();
        setUnlockDialogOpen(false);
      } else {
        throw new Error(response.data.error || "Failed to unlock user");
      }
    } catch (error) {
      console.error("Error unlocking user:", error);
      toast.error("ไม่สามารถปลดล็อคบัญชีดำได้", {
        style: {
          background: "#FEE2E2",
          color: "#991B1B",
          border: "1px solid #FCA5A5",
        },
        duration: 3000,
      });
    }
  };

  const filteredUsers = blacklistedUsers.filter((user) =>
    Object.values(user).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  ).sort((a, b) => a.LOCKEMPID - b.LOCKEMPID);

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
                จัดการบัญชีดำ
              </CardTitle>
            </motion.div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <motion.div variants={itemVariants} className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="ค้นหาบัญชีดำ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 transition-all duration-300"
              />
            </div>
          </motion.div>
          <motion.div variants={itemVariants} className="booking-table overflow-hidden rounded-lg border border-gray-200 bg-white">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold text-gray-600">รหัสบัญชีดำ</TableHead>
                  <TableHead className="font-semibold text-gray-600">รหัสพนักงาน</TableHead>
                  <TableHead className="font-semibold text-gray-600">วันที่ถูกแบน</TableHead>
                  <TableHead className="font-semibold text-gray-600">การจัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence mode="wait">
                  {filteredUsers.length === 0 ? (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <TableCell
                        colSpan={4}
                        className="h-[400px] text-center text-gray-500"
                      >
                        ไม่พบข้อมูล
                      </TableCell>
                    </motion.tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <motion.tr
                        key={user.LOCKEMPID}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="hover:bg-gray-50/50 transition-colors duration-200"
                      >
                        <TableCell className="font-medium">{user.LOCKEMPID}</TableCell>
                        <TableCell>{user.ESSN}</TableCell>
                        <TableCell>
                          {new Date(user.LOCKDATE).toLocaleDateString("th-TH")}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="h-8 w-8 p-0 hover:bg-gray-100 transition-colors duration-200"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(user);
                                  setUnlockDialogOpen(true);
                                }}
                                className="cursor-pointer text-blue-600 hover:text-blue-700"
                              >
                                <Unlock className="h-4 w-4 mr-2" />
                                ปลดล็อคบัญชีดำ
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </TableBody>
            </Table>
          </motion.div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {unlockDialogOpen && (
          <Dialog open={unlockDialogOpen} onOpenChange={setUnlockDialogOpen}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              <DialogContent className="sm:max-w-[525px] p-0 overflow-hidden bg-white rounded-xl shadow-2xl">
                <DialogHeader className="px-6 pt-6 pb-4 bg-gradient-to-r from-blue-50 via-blue-50/70 to-white border-b">
                  <DialogTitle className="text-xl font-semibold flex items-center text-blue-800">
                    <div className="bg-blue-100 p-2.5 rounded-lg mr-3 shadow-sm">
                      <Unlock className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex flex-col">
                      <span>ยืนยันการปลดล็อคบัญชีดำ</span>
                      <span className="text-sm font-normal text-blue-600 mt-0.5">
                        กรุณาตรวจสอบข้อมูลก่อนดำเนินการ
                      </span>
                    </div>
                  </DialogTitle>
                </DialogHeader>
                <div className="p-6 bg-gradient-to-b from-white to-blue-50/30">
                  <div className="bg-white rounded-xl border border-blue-100 shadow-sm p-4">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 mt-2 rounded-full bg-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-700">
                          คุณต้องการปลดล็อคบัญชีดำของพนักงานรหัส{" "}
                          <span className="font-semibold text-blue-700">
                            {selectedUser?.ESSN}
                          </span>{" "}
                          ใช่หรือไม่?
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 px-6 py-4 bg-gradient-to-b from-blue-50/30 to-blue-50 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setUnlockDialogOpen(false)}
                    className="hover:bg-gray-100 transition-colors duration-200"
                  >
                    ยกเลิก
                  </Button>
                  <Button
                    onClick={handleUnlockUser}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all duration-200 ease-in-out hover:shadow-md"
                  >
                    ยืนยันการปลดล็อค
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

export default BlacklistSection;
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MoreVertical, Unlock } from "lucide-react";
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
  DialogFooter,
} from "@/components/ui/dialog";
const BlacklistSection = () => {
  const [blacklistedUsers, setBlacklistedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [unlockDialogOpen, setUnlockDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // ฟังก์ชันสำหรับดึงข้อมูลผู้ใช้ที่ถูกบัญชีดำ
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

  // ฟังก์ชันสำหรับปลดล็อคผู้ใช้
  const handleUnlockUser = async () => {
    try {
      const response = await axios.post(
        `http://localhost:8080/unlock-employee/${selectedUser.ESSN}`
      );

      if (response.data.success) {
        // แสดงข้อความแจ้งเตือนว่าปลดล็อคสำเร็จ
        toast.success("ปลดล็อคบัญชีดำสำเร็จ");
        fetchBlacklistedUsers();
        setUnlockDialogOpen(false);
      } else {
        throw new Error(response.data.error || "Failed to unlock user");
      }
    } catch (error) {
      console.error("Error unlocking user:", error);
      toast.error("ไม่สามารถปลดล็อคบัญชีดำได้");
    }
  };
  // กรองผู้ใช้ที่ถูกบัญชีดำตามคำค้นหา
  const filteredUsers = blacklistedUsers
    .filter((user) =>
      // เช็คว่า value ของ user ใด ๆ มีคำค้นหาหรือไม่
      Object.values(user).some((value) =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
    // เรียงลำดับผู้ใช้ตาม LOCKEMPID
    .sort((a, b) => a.LOCKEMPID - b.LOCKEMPID);
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
    <motion.div initial="hidden" animate="show" variants={cardVariants}>
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CardTitle className="text-2xl font-bold">จัดการบัญชีดำ</CardTitle>
          </motion.div>
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="ค้นหาบัญชีดำ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 transition-all duration-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </motion.div>
        </CardHeader>
        <CardContent>
          <motion.div
            className="rounded-md border"
            variants={cardVariants}
            initial="hidden"
            animate="show"
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>รหัสบัญชีดำ</TableHead>
                  <TableHead>รหัสพนักงาน</TableHead>
                  <TableHead>วันที่ถูกแบน</TableHead>
                  <TableHead>การจัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <AnimatePresence mode="wait">
                <motion.tbody variants={tableVariants}>
                  {filteredUsers.length === 0 ? (
                    <motion.tr variants={rowVariants}>
                      <TableCell colSpan={4} className="h-[400px] text-center">
                        ไม่พบข้อมูล
                      </TableCell>
                    </motion.tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <motion.tr
                        key={user.LOCKEMPID}
                        variants={rowVariants}
                        initial="hidden"
                        animate="show"
                        exit="exit"
                        className="hover:bg-gray-50 transition-colors duration-200"
                      >
                        <TableCell>{user.LOCKEMPID}</TableCell>
                        <TableCell>{user.ESSN}</TableCell>
                        <TableCell>
                          {new Date(user.LOCKDATE).toLocaleDateString("th-TH")}
                        </TableCell>
                        <TableCell>
                          <motion.div whileHover={{ scale: 1.1 }}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  className="h-8 w-8 p-0 transition-all duration-300"
                                >
                                  <span className="sr-only">Open menu</span>
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setUnlockDialogOpen(true);
                                  }}
                                  className="transition-colors duration-200 hover:bg-blue-50"
                                >
                                  <Unlock className="h-4 w-4 mr-2" />
                                  ปลดล็อคบัญชีดำ
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </motion.div>
                        </TableCell>
                      </motion.tr>
                    ))
                  )}
                </motion.tbody>
              </AnimatePresence>
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
              <DialogContent className="sm:max-w-[425px] transition-all duration-300">
                <DialogHeader>
                  <DialogTitle>ยืนยันการปลดล็อคบัญชีดำ</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <p>
                    คุณต้องการปลดล็อคบัญชีดำของพนักงานรหัส {selectedUser?.ESSN}{" "}
                    ใช่หรือไม่?
                  </p>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setUnlockDialogOpen(false)}
                    className="transition-all duration-300 hover:bg-gray-100"
                  >
                    ยกเลิก
                  </Button>
                  <Button
                    onClick={handleUnlockUser}
                    className="bg-green-600 hover:bg-green-700 transition-all duration-300"
                  >
                    ยืนยันการปลดล็อค
                  </Button>
                </DialogFooter>
              </DialogContent>
            </motion.div>
          </Dialog>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
export default BlacklistSection;

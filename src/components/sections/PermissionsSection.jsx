import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  MoreVertical,
  Shield,
  AlertTriangle,
  Lock,
  Settings,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import PermissionModal from "../modals/PermissionModal";
import axios from "axios";
const API_URL = "http://localhost:8080";
// Enhanced animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.6, -0.05, 0.01, 0.99],
    },
  },
};
const tableRowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: [0.6, -0.05, 0.01, 0.99],
    },
  }),
  exit: {
    opacity: 0,
    x: 20,
    transition: { duration: 0.2 },
  },
};
const badgeVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
    },
  },
};
const PermissionsSection = () => {
  const [permissions, setPermissions] = useState([]);
  const [positions, setPositions] = useState([]);
  const [menus, setMenus] = useState([]);
  const [editingPermission, setEditingPermission] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState(null);
  useEffect(() => {
    fetchData();
  }, []);
  // ฟังก์ชันสำหรับดึงข้อมูลจาก API
  const fetchData = async () => {
    try {
      // ใช้ Promise.all เพื่อเรียก API พร้อมกัน
      const [accessMenusRes, positionsRes, menusRes] = await Promise.all([
        axios.get(`${API_URL}/accessmenus`), // เรียกข้อมูลเมนูการเข้าถึง
        axios.get(`${API_URL}/positions`), // เรียกข้อมูลตำแหน่ง
        axios.get(`${API_URL}/menus`), // เรียกข้อมูลเมนู
      ]);
      // จัดกลุ่มข้อมูลสิทธิ์ตาม PNUM
      const groupedPermissions = {};
      accessMenusRes.data.forEach((item) => {
        if (!groupedPermissions[item.PNUM]) {
          // หากยังไม่มีการกำหนด PNUM นี้ ให้สร้างรายการใหม่
          groupedPermissions[item.PNUM] = {
            PNUM: item.PNUM,
            PNAME: item.PNAME,
            access: [], // สร้าง array สำหรับเก็บข้อมูลการเข้าถึง
          };
        }
        // เพิ่มเมนูการเข้าถึงลงในรายการ
        groupedPermissions[item.PNUM].access.push({
          MNUM: item.MNUM,
          MNAME: item.MNAME,
        });
      });
      // ตั้งค่าข้อมูลสิทธิ์และตำแหน่ง
      setPermissions(Object.values(groupedPermissions)); // แปลงอ็อบเจ็กต์เป็นอาร์เรย์
      setPositions(positionsRes.data); // ตั้งค่าตำแหน่ง
      setMenus(menusRes.data); // ตั้งค่าเมนู
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("เกิดข้อผิดพลาดในการดึงข้อมูล");
    }
  };
  // ฟังก์ชันสำหรับเปิด Modal เพื่อเพิ่มสิทธิ์
  const handleAddPermission = () => {
    setEditingPermission(null); // รีเซ็ตการแก้ไข
    setIsModalOpen(true); // เปิด Modal
  };
  // ฟังก์ชันสำหรับเปิดกล่องโต้ตอบการแก้ไข
  const handleEditClick = (permission) => {
    setSelectedPermission(permission); // ตั้งค่าการเลือกสิทธิ์
    setShowEditDialog(true);
  };
  // ฟังก์ชันสำหรับเปิดกล่องโต้ตอบการลบ
  const handleDeleteClick = (permission) => {
    setSelectedPermission(permission); // ตั้งค่าการเลือกสิทธิ์
    setShowDeleteDialog(true);
  };
  // ฟังก์ชันสำหรับยืนยันการแก้ไข
  const handleEditConfirm = () => {
    setShowEditDialog(false); // ปิดกล่องโต้ตอบการแก้ไข
    setEditingPermission(selectedPermission); // ตั้งค่าสิทธิ์ที่จะแก้ไข
    setIsModalOpen(true); // เปิด Modal เพื่อแก้ไข
  };
  // ฟังก์ชันสำหรับยืนยันการลบ
  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(
        `${API_URL}/accessmenus/position/${selectedPermission.PNUM}`
      ); // ทำการลบสิทธิ์จาก API
      fetchData();
      toast.success("ลบสิทธิ์สำเร็จ");
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting permission:", error);
      toast.error("เกิดข้อผิดพลาดในการลบสิทธิ์");
    }
  };
  // ฟังก์ชันสำหรับการกรองข้อมูลสิทธิ์ตามคำค้นหา
  const filteredPermissions = permissions.filter((permission) => {
    const searchLower = searchTerm.toLowerCase(); // แปลงคำค้นหาเป็นตัวพิมพ์เล็ก
    const positionMatch = permission.PNAME.toLowerCase().includes(searchLower); // ตรวจสอบว่าชื่อตำแหน่งตรงกับคำค้นหาหรือไม่
    const menuMatch = permission.access.some(
      (menu) => menu.MNAME.toLowerCase().includes(searchLower) // ตรวจสอบว่าเมนูการเข้าถึงตรงกับคำค้นหาหรือไม่
    );
    return positionMatch || menuMatch; // คืนค่าความจริงถ้าตรงกัน
  });
  // ฟังก์ชันสำหรับบันทึกสิทธิ์ใหม่หรืออัปเดตสิทธิ์ที่มีอยู่
  const handleSavePermission = async (data) => {
    try {
      const { position, selectedMenus } = data; // ดึงตำแหน่งและเมนูที่เลือกจากข้อมูล
      const positionExists = permissions.some(
        (permission) => permission.PNUM === position // ตรวจสอบว่าตำแหน่งนี้มีอยู่แล้วหรือไม่
      );
      if (!editingPermission && positionExists) {
        toast.error("มีการกำหนดสิทธิ์ตำเเหน่งนี้เเล้ว");
        return;
      }
      if (editingPermission) {
        await axios.delete(`${API_URL}/accessmenus/position/${position}`);
      }
      for (const menuId of selectedMenus) {
        await axios.post(`${API_URL}/accessmenus`, {
          PNUM: position,
          MNUM: menuId,
        });
      }
      toast.success(
        editingPermission ? "แก้ไขสิทธิ์สำเร็จ" : "เพิ่มสิทธิ์สำเร็จ"
      );
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error saving permission:", error);
      toast.error("เกิดข้อผิดพลาดในการบันทึกสิทธิ์");
    }
  };
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen p-6"
    >
      {/* Header Section */}
      <motion.div
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-8 mb-8 shadow-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <motion.div
              className="p-4 bg-white/10 backdrop-blur-xl rounded-xl"
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.7 }}
            >
              <Lock className="h-8 w-8 text-white" />
            </motion.div>
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl font-bold text-white mb-2"
              >
                จัดการสิทธิ์การใช้งาน
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-slate-300"
              >
                กำหนดและจัดการสิทธิ์การเข้าถึงระบบอย่างมีประสิทธิภาพ
              </motion.p>
            </div>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={handleAddPermission}
              className="bg-white text-slate-900 hover:bg-slate-100 shadow-lg transition-all duration-300 px-6 py-6 text-lg font-medium rounded-xl"
              size="lg"
            >
              <Plus className="mr-2 h-5 w-5" /> เพิ่มสิทธิ์
            </Button>
          </motion.div>
        </div>
      </motion.div>
      {/* Main Content Section */}
      <motion.div
        variants={containerVariants}
        className="space-y-6"
      >
        <Card className="overflow-hidden border-none shadow-2xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="border-b bg-slate-50/50 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Settings className="h-5 w-5 text-slate-600" />
                <CardTitle className="text-xl font-semibold text-slate-700">
                  รายการสิทธิ์ทั้งหมด
                </CardTitle>
              </div>
              <motion.div
                className="relative w-96"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="ค้นหาสิทธิ์หรือตำแหน่ง..."
                  className="pl-12 pr-4 py-5 border-slate-200 focus:ring-slate-400 rounded-xl transition-shadow duration-200 bg-white/70 backdrop-blur-sm text-slate-600 placeholder:text-slate-400"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </motion.div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="rounded-xl border border-slate-100 overflow-hidden bg-white/70 backdrop-blur-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/80">
                    <TableHead className="font-semibold text-slate-700 py-4 px-6">
                      ตำแหน่ง
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 py-4 px-6">
                      สิทธิ์การเข้าถึง
                    </TableHead>
                    <TableHead className="w-[100px] text-center font-semibold text-slate-700 py-4 px-6">
                      จัดการ
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="wait">
                    {filteredPermissions.map((permission, index) => (
                      <motion.tr
                        key={permission.PNUM}
                        custom={index}
                        variants={tableRowVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="group hover:bg-slate-50/80 transition-colors duration-200"
                      >
                        <TableCell className="font-medium text-slate-700 px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <Shield className="h-5 w-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                            <span>{permission.PNAME}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            <AnimatePresence>
                              {permission.access.map((access) => (
                                <motion.span
                                  key={access.MNUM}
                                  variants={badgeVariants}
                                  initial="hidden"
                                  animate="visible"
                                  exit="hidden"
                                  className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 transition-colors duration-200"
                                  whileHover={{ scale: 1.05 }}
                                >
                                  <Lock className="h-3.5 w-3.5 mr-2 text-slate-500" />
                                  {access.MNAME}
                                </motion.span>
                              ))}
                            </AnimatePresence>
                          </div>
                        </TableCell>
                        <TableCell className="text-center px-6 py-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="h-9 w-9 p-0 hover:bg-slate-100 rounded-full flex items-center justify-center transition-colors duration-200"
                              >
                                <MoreVertical className="h-5 w-5 text-slate-600" />
                              </motion.button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem
                                onClick={() => handleEditClick(permission)}
                                className="hover:bg-slate-100 cursor-pointer py-2.5 px-4"
                              >
                                <Edit className="mr-2 h-4 w-4 text-blue-500" />
                                <span>แก้ไข</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteClick(permission)}
                                className="hover:bg-red-50 text-red-600 cursor-pointer py-2.5 px-4"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>ลบ</span>
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
          </CardContent>
        </Card>
      </motion.div>
      {/* Modals */}
      <PermissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePermission}
        permission={editingPermission}
        positions={positions}
        menus={menus}
      />
      {/* Edit Confirmation Dialog */}
      <AlertDialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <AlertDialogContent className="max-w-[400px] rounded-xl bg-white/90 backdrop-blur-lg p-6">
          <AlertDialogHeader>
            <div className="flex items-center space-x-3 text-blue-600 mb-4">
              <Edit className="h-6 w-6" />
              <AlertDialogTitle className="text-xl font-semibold">
                ยืนยันการแก้ไขสิทธิ์
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-slate-600 text-base">
              คุณต้องการแก้ไขสิทธิ์ของตำแหน่ง "{selectedPermission?.PNAME}"
              ใช่หรือไม่?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 space-x-3">
            <AlertDialogCancel className="bg-slate-100 hover:bg-slate-200 transition-colors">
              ยกเลิก
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEditConfirm}
              className="bg-blue-500 text-white hover:bg-blue-600 transition-colors px-6"
            >
              <Edit className="mr-2 h-4 w-4" />
              ยืนยันการแก้ไข
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-[400px] rounded-xl bg-white/90 backdrop-blur-lg p-6">
          <AlertDialogHeader>
            <div className="flex items-center space-x-3 text-red-500 mb-4">
              <AlertTriangle className="h-6 w-6" />
              <AlertDialogTitle className="text-xl font-semibold">
                ยืนยันการลบสิทธิ์
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-slate-600 text-base">
              คุณต้องการลบสิทธิ์ของตำแหน่ง "{selectedPermission?.PNAME}"
              ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 space-x-3">
            <AlertDialogCancel className="bg-slate-100 hover:bg-slate-200 transition-colors">
              ยกเลิก
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-500 text-white hover:bg-red-600 transition-colors px-6"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              ยืนยันการลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};
export default PermissionsSection;
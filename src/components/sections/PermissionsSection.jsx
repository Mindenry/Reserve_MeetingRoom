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
// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};
const tableRowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: { duration: 0.2 },
  },
};
const badgeVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 500, damping: 30 },
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
      className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6"
    >
      <motion.div
        className="flex items-center justify-between mb-8 bg-gradient-to-r from-primary/5 to-transparent p-6 rounded-2xl"
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center space-x-4">
          <motion.div
            className="p-3 bg-primary/10 rounded-xl"
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            <Shield className="h-8 w-8 text-primary" />
          </motion.div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              จัดการสิทธิ์การใช้งาน
            </h1>
            <p className="text-muted-foreground mt-1">
              จัดการและกำหนดสิทธิ์การเข้าถึงระบบ
            </p>
          </div>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={handleAddPermission}
            className="bg-primary hover:bg-primary/90 text-white shadow-lg transition-all duration-200 px-6"
            size="lg"
          >
            <Plus className="mr-2 h-5 w-5" /> เพิ่มสิทธิ์
          </Button>
        </motion.div>
      </motion.div>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Card className="overflow-hidden border-none shadow-xl bg-gradient-to-br from-white to-gray-50/50">
          <CardHeader className="border-b bg-gray-50/30 px-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold text-gray-700">
                รายการสิทธิ์ทั้งหมด
              </CardTitle>
              <motion.div
                className="relative w-80"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="ค้นหาสิทธิ์..."
                  className="pl-10 pr-4 py-2 border-gray-200 focus:ring-primary rounded-full transition-shadow duration-200 bg-white/50 backdrop-blur-sm"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </motion.div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="rounded-xl border border-gray-100 overflow-hidden bg-white/50 backdrop-blur-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    <TableHead className="font-semibold text-gray-700">
                      ตำแหน่ง
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">
                      สิทธิ์การเข้าถึง
                    </TableHead>
                    <TableHead className="w-[100px] text-center font-semibold text-gray-700">
                      จัดการ
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {filteredPermissions.map((permission, index) => (
                      <motion.tr
                        key={permission.PNUM}
                        variants={tableRowVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={{ delay: index * 0.1 }}
                        className="hover:bg-gray-50/50 transition-colors duration-150"
                      >
                        <TableCell className="font-medium">
                          {permission.PNAME}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            <AnimatePresence>
                              {permission.access.map((access) => (
                                <motion.span
                                  key={access.MNUM}
                                  variants={badgeVariants}
                                  initial="hidden"
                                  animate="visible"
                                  exit="hidden"
                                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20"
                                  whileHover={{ scale: 1.05 }}
                                >
                                  {access.MNAME}
                                </motion.span>
                              ))}
                            </AnimatePresence>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full flex items-center justify-center"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </motion.button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem
                                onClick={() => handleEditClick(permission)}
                                className="hover:bg-gray-100 cursor-pointer"
                              >
                                <Edit className="mr-2 h-4 w-4 text-blue-500" />
                                <span>แก้ไข</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteClick(permission)}
                                className="hover:bg-red-50 text-red-600 cursor-pointer"
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
        <AlertDialogContent className="max-w-[400px]">
          <AlertDialogHeader>
            <div className="flex items-center space-x-2 text-blue-600">
              <Edit className="h-5 w-5" />
              <AlertDialogTitle className="text-xl font-semibold">
                ยืนยันการแก้ไขสิทธิ์
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-gray-600">
              คุณต้องการแก้ไขสิทธิ์ของตำแหน่ง "{selectedPermission?.PNAME}"
              ใช่หรือไม่?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200">
              ยกเลิก
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEditConfirm}
              className="bg-blue-500 text-white hover:bg-blue-600"
            >
              <Edit className="mr-2 h-4 w-4" />
              ยืนยันการแก้ไข
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-[400px]">
          <AlertDialogHeader>
            <div className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <AlertDialogTitle className="text-xl font-semibold">
                ยืนยันการลบสิทธิ์
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-gray-600">
              คุณต้องการลบสิทธิ์ของตำแหน่ง "{selectedPermission?.PNAME}"
              ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200">
              ยกเลิก
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-500 text-white hover:bg-red-600"
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

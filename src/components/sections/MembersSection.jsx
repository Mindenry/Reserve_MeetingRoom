import React, { useState, useMemo } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Search,
  MoreVertical,
  Edit,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// กำหนด URL ของ API และจำนวนรายการที่จะแสดงต่อหน้า
const API_URL = "http://localhost:8080";
const ITEMS_PER_PAGE = 10;
// ฟังก์ชันสำหรับดึงข้อมูลสมาชิกจาก API
const fetchMembers = async () => {
  const response = await axios.get(`${API_URL}/members`);
  return response.data;
};
// ฟังก์ชันสำหรับดึงข้อมูลแผนก
const fetchDepartments = async () => {
  const response = await axios.get(`${API_URL}/departments`);
  return response.data;
};
// ฟังก์ชันสำหรับดึงข้อมูลตำแหน่ง
const fetchPositions = async () => {
  const response = await axios.get(`${API_URL}/positions`);
  return response.data;
};
// ฟังก์ชันสำหรับดึงข้อมูลสถานะการทำงานของพนักงาน
const fetchStatusEmps = async () => {
  const response = await axios.get(`${API_URL}/statusemps`);
  return response.data;
};
// ฟังก์ชันแปลง ID ให้เป็นรูปแบบตัวเลข 3 หลัก เช่น 001, 002
const formatID = (id) => {
  return id.toString().padStart(3, "0");
};
// MembersSection component เป็นหน้าที่แสดงรายชื่อสมาชิก
const MembersSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingMember, setEditingMember] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  // กำหนด state สำหรับฟอร์มข้อมูลสมาชิกใหม่ที่ต้องการเพิ่มหรือแก้ไข
  const [formData, setFormData] = useState({
    FNAME: "",
    LNAME: "",
    EMAIL: "",
    PW: "",
    DNO: "",
    PNO: "",
    STUEMP: "",
  }); // Removed SSN since it will be auto-generated
  // QueryClient สำหรับจัดการ cache ข้อมูล
  const queryClient = useQueryClient();
  // กำหนดสีของสถานะการทำงานแต่ละประเภท
  const statusColors = {
    1: "bg-green-100 text-green-800", // ทำงาน
    2: "bg-red-100 text-red-800", // ลาออก
    3: "bg-gray-100 text-gray-800", // เกษียณ
  };
  // Map สถานะเพื่อให้แสดงชื่อสถานะในภาษาที่เข้าใจง่าย
  const statusMap = {
    1: "ทำงาน",
    2: "ลาออก",
    3: "เกษียณ",
  };
  // ใช้ useQuery ดึงข้อมูลสมาชิก แผนก ตำแหน่ง และสถานะการทำงาน
  const {
    data: members = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["members"],
    queryFn: fetchMembers,
  });
  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: fetchDepartments,
  });
  const { data: positions = [] } = useQuery({
    queryKey: ["positions"],
    queryFn: fetchPositions,
  });
  const { data: statusEmps = [] } = useQuery({
    queryKey: ["statusEmps"],
    queryFn: fetchStatusEmps,
  });
  // เรียงลำดับสมาชิกตาม SSN ก่อนแสดงผล
  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => a.SSN - b.SSN);
  }, [members]);
  // กรองข้อมูลสมาชิกตาม search term ที่ผู้ใช้ระบุ
  const filteredMembers = useMemo(() => {
    return sortedMembers.filter((member) =>
      Object.values(member).some((value) =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [sortedMembers, searchTerm]);
  // คำนวณจำนวนหน้าทั้งหมดของข้อมูลที่กรองแล้ว
  const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE);
  // กำหนดดัชนีเริ่มต้นของรายการในหน้าปัจจุบัน
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  // เลือกรายการตามหน้าปัจจุบันที่จะแสดงผลในตาราง
  const paginatedMembers = filteredMembers.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );
  const handlePageChange = (page) => {
    setCurrentPage(page);
    document
      .querySelector(".rounded-md.border")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  // ฟังก์ชันเพิ่มสมาชิกใหม่โดยใช้ useMutation
  const addMemberMutation = useMutation({
    mutationFn: (newMember) => axios.post(`${API_URL}/addmembers`, newMember),
    onSuccess: () => {
      queryClient.invalidateQueries("members");
      toast.success("เพิ่มสมาชิกสำเร็จ");
      setIsModalOpen(false);
      resetForm();
    },
    onError: (error) => {
      if (error.response?.data?.error === "duplicate_email") {
        toast.error(
          error.response.data.message ||
            "อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่น"
        );
      } else {
        toast.error(
          error.response?.data?.message || "เกิดข้อผิดพลาดในการเพิ่มสมาชิก"
        );
      }
    },
  });
  // ฟังก์ชันแก้ไขข้อมูลสมาชิกโดยใช้ useMutation
  const updateMemberMutation = useMutation({
    mutationFn: (updatedMember) =>
      axios.put(`${API_URL}/updatemembers/${updatedMember.SSN}`, updatedMember),
    onSuccess: (data) => {
      queryClient.setQueryData(["members"], (oldData) => {
        return oldData.map((member) =>
          member.SSN === data.data.updatedMember.SSN
            ? data.data.updatedMember
            : member
        );
      });
      toast.success("แก้ไขข้อมูลสมาชิกสำเร็จ");
      setIsModalOpen(false);
      setEditingMember(null);
      resetForm();
    },
    onError: (error) => {
      console.error("Error updating member:", error);
      toast.error(
        "ไม่สามารถแก้ไขข้อมูลสมาชิกได้: " +
          (error.response?.data?.error || error.message)
      );
    },
  });
  // จัดการการเปลี่ยนแปลงข้อมูลในฟอร์ม
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  // ฟังก์ชัน submit ฟอร์มเพื่อตรวจสอบว่าเป็นการเพิ่มหรือแก้ไข
  const handleSubmit = (e) => {
    e.preventDefault();

    // Email validation
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(formData.EMAIL)) {
      toast.error("กรุณาใส่อีเมลที่ถูกต้อง เช่น example@email.com");
      return;
    }

    const processedData = {
      ...formData,
      DNO: Number(formData.DNO),
      PNO: Number(formData.PNO),
      STUEMP: Number(formData.STUEMP),
    };

    if (editingMember) {
      if (!processedData.PW || processedData.PW.trim() === "") {
        delete processedData.PW;
      }
      processedData.SSN = editingMember.SSN;
      updateMemberMutation.mutate(processedData);
    } else {
      addMemberMutation.mutate(processedData);
    }
  };
  // ฟังก์ชันเริ่มการแก้ไขสมาชิกที่ระบุ
  const handleEditClick = (member) => {
    setEditingMember(member);
    setFormData({ ...member, PW: "" });
    setIsModalOpen(true);
  };
  // ฟังก์ชันรีเซ็ตฟอร์มกลับไปเป็นค่าเริ่มต้น
  const resetForm = () => {
    setFormData({
      SSN: "",
      FNAME: "",
      LNAME: "",
      EMAIL: "",
      PW: "",
      DNO: "",
      PNO: "",
      STUEMP: "",
    });
  };
  // แสดงข้อความระหว่างโหลดข้อมูลหรือเกิดข้อผิดพลาด
  if (isLoading) return <div>กำลังโหลด...</div>;
  if (error) return <div>เกิดข้อผิดพลาด: {error.message}</div>;
  // กำหนดการแสดงผลตารางโดยมีอนิเมชั่น
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
            <CardTitle className="text-2xl font-bold">จัดการสมาชิก</CardTitle>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => {
                setEditingMember(null);
                resetForm();
                setIsModalOpen(true);
              }}
              variant="outline"
              className="transition-all duration-300 hover:shadow-lg"
            >
              <Plus className="mr-2 h-4 w-4" /> เพิ่มสมาชิก
            </Button>
          </motion.div>
        </CardHeader>
        <CardContent>
          <motion.div
            className="rounded-md border min-h-[600px] flex flex-col"
            variants={cardVariants}
          >
            <motion.div
              className="flex items-center space-x-2 mb-4 px-4 pt-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Search className="text-gray-400" />
              <Input
                type="text"
                placeholder="ค้นหาสมาชิก..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-grow transition-all duration-300 focus:ring-2 focus:ring-blue-500"
              />
            </motion.div>
            <div className="flex-grow">
              <Table className="border">
                <TableHeader>
                  <TableRow className="border-b">
                    <TableHead className="border-r w-[100px]">ID</TableHead>
                    <TableHead className="border-r w-[150px]">ชื่อ</TableHead>
                    <TableHead className="border-r w-[150px]">
                      นามสกุล
                    </TableHead>
                    <TableHead className="border-r w-[200px]">Email</TableHead>
                    <TableHead className="border-r w-[150px]">แผนก</TableHead>
                    <TableHead className="border-r w-[150px]">
                      ตำแหน่ง
                    </TableHead>
                    <TableHead className="border-r w-[150px]">สถานะ</TableHead>
                    <TableHead className="w-[100px]">การจัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <AnimatePresence mode="wait">
                  <motion.tbody
                    variants={tableVariants}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                  >
                    {paginatedMembers.length === 0 ? (
                      <motion.tr variants={rowVariants}>
                        <TableCell
                          colSpan={8}
                          className="h-[400px] text-center border-r"
                        >
                          ไม่พบข้อมูล
                        </TableCell>
                      </motion.tr>
                    ) : (
                      <>
                        {paginatedMembers.map((member) => (
                          <motion.tr
                            key={member.SSN}
                            variants={rowVariants}
                            initial="hidden"
                            animate="show"
                            exit="exit"
                            className="hover:bg-gray-50 transition-colors duration-200 border-b"
                          >
                            <TableCell className="border-r">
                              {formatID(member.SSN)}
                            </TableCell>
                            <TableCell className="border-r">
                              {member.FNAME}
                            </TableCell>
                            <TableCell className="border-r">
                              {member.LNAME}
                            </TableCell>
                            <TableCell className="border-r">
                              {member.EMAIL}
                            </TableCell>
                            <TableCell className="border-r">
                              {member.DNAME}
                            </TableCell>
                            <TableCell className="border-r">
                              {member.PNAME}
                            </TableCell>
                            <TableCell className="border-r">
                              <motion.div
                                className="w-[130px]"
                                whileHover={{ scale: 1.05 }}
                                transition={{ type: "spring", stiffness: 300 }}
                              >
                                <span
                                  className={`inline-block w-full text-center px-2 py-1 rounded-full text-xs font-medium ${
                                    statusColors[member.STUEMP]
                                  } transition-all duration-300`}
                                >
                                  {statusMap[member.STUEMP]}
                                </span>
                              </motion.div>
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
                                      onClick={() => handleEditClick(member)}
                                      className="transition-colors duration-200 hover:bg-blue-50"
                                    >
                                      <Edit className="mr-2 h-4 w-4" /> แก้ไข
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </motion.div>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </>
                    )}
                  </motion.tbody>
                </AnimatePresence>
              </Table>
            </div>
            <motion.div
              className="flex items-center justify-between px-4 py-4 border-t"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-sm text-gray-700">
                แสดง {startIndex + 1} ถึง{" "}
                {Math.min(startIndex + ITEMS_PER_PAGE, filteredMembers.length)}{" "}
                จาก {filteredMembers.length} รายการ
              </div>
              <div className="flex items-center space-x-2">
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
                        ? "bg-blue-600 text-white hover:bg-blue-700"
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
            </motion.div>
          </motion.div>
        </CardContent>
        <AnimatePresence>
          {isModalOpen && (
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", duration: 0.5 }}
              >
                <DialogContent className="transition-all duration-300">
                  <DialogHeader>
                    <DialogTitle>
                      {editingMember ? "แก้ไขสมาชิก" : "เพิ่มสมาชิก"}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit}>
                    {[
                      "FNAME",
                      "LNAME",
                      "EMAIL",
                      "PW",
                      "DNO",
                      "PNO",
                      "STUEMP",
                    ].map((key) => (
                      <div key={key} className="mb-4">
                        <Label htmlFor={key}>
                          {key === "FNAME"
                            ? "ชื่อ"
                            : key === "LNAME"
                            ? "นามสกุล"
                            : key === "EMAIL"
                            ? "Email"
                            : key === "PW"
                            ? "รหัสผ่าน"
                            : key === "DNO"
                            ? "แผนก"
                            : key === "PNO"
                            ? "ตำแหน่ง"
                            : key === "STUEMP"
                            ? "สถานะ"
                            : key}
                        </Label>
                        {key === "DNO" ? (
                          <Select
                            value={formData.DNO}
                            onValueChange={(value) =>
                              handleChange({ target: { name: "DNO", value } })
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="เลือกแผนก" />
                            </SelectTrigger>
                            <SelectContent>
                              {departments.map((dept) => (
                                <SelectItem
                                  key={dept.DNUMBER}
                                  value={dept.DNUMBER.toString()}
                                >
                                  {dept.DNAME}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : key === "PNO" ? (
                          <Select
                            value={formData.PNO}
                            onValueChange={(value) =>
                              handleChange({ target: { name: "PNO", value } })
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="เลือกตำแหน่ง" />
                            </SelectTrigger>
                            <SelectContent>
                              {positions.map((pos) => (
                                <SelectItem
                                  key={pos.PNUMBER}
                                  value={pos.PNUMBER.toString()}
                                >
                                  {pos.PNAME}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : key === "STUEMP" ? (
                          <Select
                            value={formData.STUEMP}
                            onValueChange={(value) =>
                              handleChange({
                                target: { name: "STUEMP", value },
                              })
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="เลือกสถานะ" />
                            </SelectTrigger>
                            <SelectContent>
                              {statusEmps.map((status) => (
                                <SelectItem
                                  key={status.STATUSEMPID}
                                  value={status.STATUSEMPID.toString()}
                                >
                                  {status.STATUSEMPNAME}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            id={key}
                            name={key}
                            value={formData[key]}
                            onChange={handleChange}
                            required={key !== "PW" || !editingMember}
                            type={key === "PW" ? "password" : "text"}
                            disabled={key === "SSN" && editingMember}
                          />
                        )}
                      </div>
                    ))}
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsModalOpen(false)}
                      >
                        ยกเลิก
                      </Button>
                      <Button type="submit">บันทึก</Button>
                    </div>
                  </form>
                </DialogContent>
              </motion.div>
            </Dialog>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};
export default MembersSection;

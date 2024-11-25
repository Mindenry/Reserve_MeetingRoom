import React, { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Search,
  Plus,
  Trash2,
  Edit,
  XCircle,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Label } from "@/components/ui/label";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_URL = "http://localhost:8080";
const ITEMS_PER_PAGE = 10;

// ฟังก์ชันสำหรับดึงข้อมูลห้องประชุมทั้งหมดจาก API
const fetchRooms = async () => {
  const response = await axios.get(`${API_URL}/room`); // ส่งคำขอ GET ไปยัง endpoint สำหรับห้องประชุม
  return response.data; // ส่งคืนข้อมูลห้องประชุมจากการตอบกลับ
};

// ฟังก์ชันสำหรับดึงข้อมูลอาคารทั้งหมดจาก API
const fetchBuildings = async () => {
  const response = await axios.get(`${API_URL}/buildings`); // ส่งคำขอ GET ไปยัง endpoint สำหรับอาคาร
  return response.data; // ส่งคืนข้อมูลอาคารจากการตอบกลับ
};

// ฟังก์ชันสำหรับดึงประเภทห้องทั้งหมดจาก API
const fetchRoomtypes = async () => {
  const response = await axios.get(`${API_URL}/roomtypes`); // ส่งคำขอ GET ไปยัง endpoint สำหรับประเภทห้อง
  return response.data; // ส่งคืนข้อมูลประเภทห้องจากการตอบกลับ
};

// ฟังก์ชันสำหรับดึงสถานะห้องทั้งหมดจาก API
const fetchStatusrooms = async () => {
  const response = await axios.get(`${API_URL}/statusrooms`); // ส่งคำขอ GET ไปยัง endpoint สำหรับสถานะห้อง
  return response.data; // ส่งคืนข้อมูลสถานะห้องจากการตอบกลับ
};

// ฟังก์ชันสำหรับจัดรูปแบบ ID ให้มี 3 หลัก เช่น 1 จะถูกแปลงเป็น "001"
const formatID = (id) => {
  return id.toString().padStart(3, "0"); // แปลง ID เป็น string และเติม 0 ด้านหน้าถ้าจำนวนน้อยกว่า 3 หลัก
};

// คอมโพเนนต์สำหรับแสดงข้อมูลห้องประชุม
const RoomsSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [floors, setFloors] = useState([]);
  const [dialogState, setDialogState] = useState({
    type: null,
    isOpen: false,
    data: null,
  });

  // กำหนดสีสำหรับสถานะต่าง ๆ
  const statusColors = {
    1: "bg-green-100 text-green-800", // สีสำหรับสถานะ "พร้อมใช้งาน"
    2: "bg-yellow-100 text-yellow-800", // สีสำหรับสถานะ "ชำรุด"
    3: "bg-red-100 text-red-800", // สีสำหรับสถานะ "ปิดให้บริการ"
  };

  // สถานะห้อง
  const statusMap = {
    1: "พร้อมใช้งาน",
    2: "ชำรุด",
    3: "ปิดให้บริการ",
  };

  // สถานะสำหรับข้อมูลฟอร์มที่ใช้เพิ่มหรือแก้ไขห้องประชุม
  const [formData, setFormData] = useState({
    CFRNAME: "", // ชื่อห้อง
    BDNUM: "", // หมายเลขอาคาร
    FLNUM: "", // หมายเลขชั้น
    RTNUM: "", // หมายเลขประเภทห้อง
    STUROOM: "", // สถานะห้อง
    CAPACITY: "", // ความจุของห้อง
  });

  // สร้าง query client สำหรับจัดการสถานะการดึงข้อมูล
  const queryClient = useQueryClient();

  // ดึงข้อมูลห้องประชุม
  const { data: rooms = [], isLoading: isLoadingRooms } = useQuery({
    queryKey: ["rooms"], // กุญแจสำหรับการดึงข้อมูล
    queryFn: fetchRooms, // ฟังก์ชันสำหรับดึงข้อมูลห้อง
  });

  // ดึงข้อมูลอาคาร
  const { data: buildings = [] } = useQuery({
    queryKey: ["buildings"], // กุญแจสำหรับการดึงข้อมูล
    queryFn: fetchBuildings, // ฟังก์ชันสำหรับดึงข้อมูลอาคาร
  });

  // ดึงข้อมูลประเภทห้อง
  const { data: roomtypes = [] } = useQuery({
    queryKey: ["roomtypes"], // กุญแจสำหรับการดึงข้อมูล
    queryFn: fetchRoomtypes, // ฟังก์ชันสำหรับดึงข้อมูลประเภทห้อง
  });

  // ดึงข้อมูลสถานะห้อง
  const { data: statusrooms = [] } = useQuery({
    queryKey: ["statusrooms"], // กุญแจสำหรับการดึงข้อมูล
    queryFn: fetchStatusrooms, // ฟังก์ชันสำหรับดึงข้อมูลสถานะห้อง
  });

  // ใช้ useEffect เพื่อตรวจสอบและดึงข้อมูลชั้นเมื่อเลือกอาคาร
  useEffect(() => {
    const fetchFloors = async () => {
      if (formData.BDNUM) {
        // ถ้ามีหมายเลขอาคาร
        try {
          const response = await axios.get(
            `${API_URL}/floors?buildingId=${formData.BDNUM}` // ส่งคำขอ GET สำหรับชั้นในอาคารที่เลือก
          );
          setFloors(response.data); // ตั้งค่าสถานะชั้นด้วยข้อมูลที่ดึงมา
        } catch (error) {
          console.error("Error fetching floors:", error);
          toast.error("ไม่สามารถดึงข้อมูลชั้นได้");
        }
      } else {
        setFloors([]); // ถ้าไม่มีหมายเลขอาคาร ให้ตั้งค่าสถานะชั้นเป็นว่าง
      }
    };
    fetchFloors(); // เรียกฟังก์ชันเพื่อดึงข้อมูลชั้น
  }, [formData.BDNUM]); // ดำเนินการทุกครั้งเมื่อ BDNUM เปลี่ยนแปลง

  // Reset ชั้นเมื่อเปลี่ยนอาคาร
  useEffect(() => {
    if (formData.BDNUM) {
      // ถ้ามีหมายเลขอาคาร
      setFormData((prev) => ({ ...prev, FLNUM: "" })); // ตั้งค่า FLNUM เป็นว่าง
    }
  }, [formData.BDNUM]); // ดำเนินการทุกครั้งเมื่อ BDNUM เปลี่ยนแปลง

  // จัดเรียงห้องประชุมตามหมายเลขห้อง
  const sortedRooms = useMemo(() => {
    return [...rooms].sort(
      (a, b) => parseInt(a.CFRNUMBER) - parseInt(b.CFRNUMBER) // จัดเรียงห้องโดยเปรียบเทียบ CFRNUMBER
    );
  }, [rooms]); // จัดการเมื่อ rooms เปลี่ยนแปลง

  // กรองห้องประชุมตามคำค้นหา
  const filteredRooms = useMemo(() => {
    return sortedRooms.filter((room) =>
      Object.values(room).some(
        (value) =>
          value?.toString().toLowerCase().includes(searchTerm.toLowerCase()) // ตรวจสอบว่าค่าของห้องประชุมมีคำค้นหาหรือไม่
      )
    );
  }, [sortedRooms, searchTerm]); // จัดการเมื่อ sortedRooms หรือ searchTerm เปลี่ยนแปลง

  // คำนวณจำนวนหน้าจากจำนวนห้องที่กรอง
  const totalPages = Math.ceil(filteredRooms.length / ITEMS_PER_PAGE); // คำนวณจำนวนหน้าที่ต้องแสดง
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE; // คำนวณ เริ่มต้นสำหรับการแสดงห้องประชุมในหน้าปัจจุบัน
  const paginatedRooms = filteredRooms.slice(
    // ตัดสินใจแสดงห้องประชุมตามหน้า
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // ฟังก์ชันสำหรับเปลี่ยนหน้า
  const handlePageChange = (page) => {
    setCurrentPage(page); // ตั้งค่าหน้าปัจจุบัน
    document
      .querySelector(".rounded-md.border") // เลือกองค์ประกอบที่ต้องการเลื่อน
      ?.scrollIntoView({ behavior: "smooth", block: "start" }); // เลื่อนหน้าไปยังตำแหน่งที่ต้องการ
  };

  // ฟังก์ชันสำหรับเพิ่มห้องประชุม
  const addRoomMutation = useMutation({
    mutationFn: (newRoom) => axios.post(`${API_URL}/addroom`, newRoom), // ส่งคำขอ POST เพื่อเพิ่มห้องประชุมใหม่
    onSuccess: () => {
      queryClient.invalidateQueries("rooms"); // อัปเดตข้อมูลห้องประชุมหลังจากเพิ่มห้องใหม่สำเร็จ
      toast.success("เพิ่มห้องประชุมสำเร็จ");
      setIsModalOpen(false); // ปิด Modal หลังจากเพิ่มห้องสำเร็จ
    },
    onError: (error) => {
      toast.error("ไม่สามารถเพิ่มห้องประชุมได้: " + error.message);
    },
  });

  const updateRoomMutation = useMutation({
    mutationFn: (updatedRoom) =>
      axios.put(`${API_URL}/updateroom/${updatedRoom.CFRNUMBER}`, updatedRoom),
    onSuccess: () => {
      queryClient.invalidateQueries("rooms");
      toast.success("อัปเดตข้อมูลห้องประชุมสำเร็จ");
      setIsModalOpen(false);
      setDialogState({ type: null, isOpen: false, data: null });
    },
    onError: (error) => {
      toast.error("ไม่สามารถอัปเดตข้อมูลห้องประชุมได้: " + error.message);
    },
  });

  const deleteRoomMutation = useMutation({
    mutationFn: (CFRNUMBER) =>
      axios.delete(`${API_URL}/deleteroom/${CFRNUMBER}`),
    onSuccess: () => {
      queryClient.invalidateQueries("rooms");
      toast.success("ลบห้องประชุมสำเร็จ");
      setDialogState({ type: null, isOpen: false, data: null });
    },
    onError: (error) => {
      toast.error("ไม่สามารถลบห้องประชุมได้: " + error.message);
    },
  });

  const handleAction = (action, room = null) => {
    switch (action) {
      case "add":
        setEditingRoom(null);
        setFormData({
          CFRNUMBER: "",
          CFRNAME: "",
          BDNUM: "",
          FLNUM: "",
          RTNUM: "",
          STUROOM: "",
          CAPACITY: "",
        });
        setIsModalOpen(true);
        break;
      case "edit":
        setEditingRoom(room);
        setFormData(room);
        setIsModalOpen(true);
        break;
      case "delete":
      case "approve":
      case "close":
        setDialogState({ type: action, isOpen: true, data: room });
        break;
      default:
        break;
    }
  };

  const handleSaveRoom = (roomData) => {
    // เช็คว่ากรอกข้อมูลครบทุกอย่างไหม
    if (
      !roomData.CFRNAME ||
      !roomData.BDNUM ||
      !roomData.FLNUM ||
      !roomData.RTNUM ||
      !roomData.STUROOM ||
      !roomData.CAPACITY
    ) {
      toast.error("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }

    if (editingRoom) {
      updateRoomMutation.mutate(roomData);
    } else {
      addRoomMutation.mutate(roomData);
    }
  };

  // ฟังก์ชันสำหรับการจัดการการลบห้องประชุม
  const handleDeleteRoom = () => {
    deleteRoomMutation.mutate(dialogState.data.CFRNUMBER); // เรียกใช้ฟังก์ชันลบห้องประชุม
  };

  // ฟังก์ชันสำหรับการจัดการการเปลี่ยนแปลงค่าฟอร์ม
  const handleChange = (field, value) => {
    // ดึงชื่อและค่า
    setFormData((prev) => ({ ...prev, [field]: value })); // ตั้งค่าฟอร์มใหม่
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

  if (isLoadingRooms) return <div>กำลังโหลด...</div>;
  return (
    <motion.div initial="hidden" animate="show" variants={cardVariants}>
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CardTitle className="text-2xl font-bold">
              จัดการห้องประชุม
            </CardTitle>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button onClick={() => handleAction("add")} variant="outline">
              <Plus className="mr-2 h-4 w-4" /> เพิ่มห้องประชุม
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
                placeholder="ค้นหาห้องประชุม..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-grow transition-all duration-300 focus:ring-2 focus:ring-blue-500"
              />
            </motion.div>
            <div className="flex-grow">
              <Table className="border">
                <TableHeader>
                  <TableRow className="border-b">
                    <TableHead className="border-r">ID</TableHead>
                    <TableHead className="border-r">ชื่อห้อง</TableHead>
                    <TableHead className="border-r">ตึก</TableHead>
                    <TableHead className="border-r">ชั้น</TableHead>
                    <TableHead className="border-r">ประเภท</TableHead>
                    <TableHead className="border-r">สถานะ</TableHead>
                    <TableHead className="border-r">ความจุ</TableHead>
                    <TableHead>การจัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <AnimatePresence mode="wait">
                  <motion.tbody
                    variants={tableVariants}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                  >
                    {paginatedRooms.length === 0 ? (
                      <motion.tr variants={rowVariants}>
                        <TableCell
                          colSpan={8}
                          className="h-[400px] text-center border"
                        >
                          ไม่พบข้อมูล
                        </TableCell>
                      </motion.tr>
                    ) : (
                      <>
                        {paginatedRooms.map((room) => (
                          <motion.tr
                            key={room.CFRNUMBER}
                            variants={rowVariants}
                            initial="hidden"
                            animate="show"
                            exit="exit"
                            className="hover:bg-gray-50 transition-colors duration-200 border-b"
                          >
                            <TableCell className="border-r">
                              {formatID(room.CFRNUMBER)}
                            </TableCell>
                            <TableCell className="border-r">
                              {room.CFRNAME}
                            </TableCell>
                            <TableCell className="border-r">
                              {room.BDNAME}
                            </TableCell>
                            <TableCell className="border-r">
                              {room.FLNAME}
                            </TableCell>
                            <TableCell className="border-r">
                              {room.RTNAME}
                            </TableCell>
                            <TableCell className="border-r">
                              <motion.div
                                className="w-[130px]"
                                whileHover={{ scale: 1.05 }}
                                transition={{ type: "spring", stiffness: 300 }}
                              >
                                <span
                                  className={`inline-block w-full text-center px-2 py-1 rounded-full text-xs font-medium ${
                                    statusColors[room.STUROOM]
                                  } transition-all duration-300`}
                                >
                                  {statusMap[room.STUROOM]}
                                </span>
                              </motion.div>
                            </TableCell>
                            <TableCell className="border-r">
                              {room.CAPACITY}
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
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => handleAction("edit", room)}
                                      className="transition-colors duration-200 hover:bg-blue-50"
                                    >
                                      <Edit className="mr-2 h-4 w-4" /> แก้ไข
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleAction("delete", room)
                                      }
                                      className="transition-colors duration-200 hover:bg-red-50"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" /> ลบ
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleAction("close", room)
                                      }
                                      className="transition-colors duration-200 hover:bg-yellow-50"
                                    >
                                      <XCircle className="mr-2 h-4 w-4" />{" "}
                                      เปลี่ยนสถานะ
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
                {Math.min(startIndex + ITEMS_PER_PAGE, filteredRooms.length)}{" "}
                จาก {filteredRooms.length} รายการ
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
                <DialogContent className="sm:max-w-[425px] transition-all duration-300">
                  <DialogHeader>
                    <DialogTitle>
                      {editingRoom ? "แก้ไขห้องประชุม" : "เพิ่มห้องประชุม"}
                    </DialogTitle>
                  </DialogHeader>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSaveRoom(formData);
                    }}
                    className="space-y-4"
                  >
                    {editingRoom && (
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">ID</Label>
                        <div className="col-span-3">
                          <span className="text-gray-600">
                            {formatID(editingRoom.CFRNUMBER)}
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="CFRNAME" className="text-right">
                        ชื่อห้อง
                      </Label>
                      <Input
                        id="CFRNAME"
                        value={formData.CFRNAME}
                        onChange={(e) =>
                          handleChange("CFRNAME", e.target.value)
                        }
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="BDNUM" className="text-right">
                        ตึก
                      </Label>
                      <Select
                        value={formData.BDNUM}
                        onValueChange={(value) => handleChange("BDNUM", value)}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="เลือกตึก" />
                        </SelectTrigger>
                        <SelectContent>
                          {buildings.map((building) => (
                            <SelectItem
                              key={building.BDNUMBER}
                              value={building.BDNUMBER.toString()}
                            >
                              {building.BDNAME}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="FLNUM" className="text-right">
                        ชั้น
                      </Label>
                      <Select
                        value={formData.FLNUM}
                        onValueChange={(value) => handleChange("FLNUM", value)}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="เลือกชั้น" />
                        </SelectTrigger>
                        <SelectContent>
                          {floors.map((floor) => (
                            <SelectItem
                              key={floor.FLNUMBER}
                              value={floor.FLNUMBER.toString()}
                            >
                              {floor.FLNAME}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="CAPACITY" className="text-right">
                        จำนวน
                      </Label>
                      <Input
                        id="CAPACITY"
                        type="number"
                        value={formData.CAPACITY}
                        onChange={(e) =>
                          handleChange("CAPACITY", e.target.value)
                        }
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="RTNUM" className="text-right">
                        ประเภท
                      </Label>
                      <Select
                        value={formData.RTNUM}
                        onValueChange={(value) => handleChange("RTNUM", value)}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="เลือกประเภท" />
                        </SelectTrigger>
                        <SelectContent>
                          {roomtypes.map((roomtype) => (
                            <SelectItem
                              key={roomtype.RTNUMBER}
                              value={roomtype.RTNUMBER.toString()}
                            >
                              {roomtype.RTNAME}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="STUROOM" className="text-right">
                        สถานะ
                      </Label>
                      <Select
                        value={formData.STUROOM}
                        onValueChange={(value) =>
                          handleChange("STUROOM", value)
                        }
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="เลือกสถานะ" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusrooms.map((statusroom) => (
                            <SelectItem
                              key={statusroom.STATUSROOMID}
                              value={statusroom.STATUSROOMID.toString()}
                            >
                              {statusroom.STATUSROOMNAME}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsModalOpen(false)}
                      >
                        ยกเลิก
                      </Button>
                      <Button
                        type="submit"
                        onClick={() => handleSaveRoom(formData)}
                      >
                        บันทึก
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </motion.div>
            </Dialog>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {dialogState.type === "delete" && (
            <Dialog
              open={dialogState.type === "delete"}
              onOpenChange={() =>
                setDialogState({ type: null, isOpen: false, data: null })
              }
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", duration: 0.5 }}
              >
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader className="space-y-4">
                    <div className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-6 w-6" />
                      <DialogTitle>ยืนยันการลบห้องประชุม</DialogTitle>
                    </div>
                    <div className="border-l-4 border-destructive bg-destructive/10 p-4 rounded-r-lg">
                      <p className="text-base">
                        คุณต้องการลบห้องประชุม{" "}
                        <span className="font-semibold">
                          {dialogState.data?.CFRNAME}
                        </span>{" "}
                        ใช่หรือไม่?
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        การดำเนินการนี้ไม่สามารถย้อนกลับได้
                      </p>
                    </div>
                  </DialogHeader>
                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                      onClick={() =>
                        setDialogState({
                          type: null,
                          isOpen: false,
                          data: null,
                        })
                      }
                      variant="outline"
                    >
                      ยกเลิก
                    </Button>
                    <Button
                      onClick={handleDeleteRoom}
                      variant="destructive"
                      className="gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      ยืนยันการลบ
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </motion.div>
            </Dialog>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {dialogState.type === "close" && (
            <Dialog
              open={dialogState.type === "close"}
              onOpenChange={() =>
                setDialogState({ type: null, isOpen: false, data: null })
              }
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", duration: 0.5 }}
              >
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader className="space-y-4">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-6 w-6 text-blue-500" />
                      <DialogTitle>เปลี่ยนสถานะห้องประชุม</DialogTitle>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="font-medium">
                        ห้องประชุม: {dialogState.data?.CFRNAME}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        เลือกสถานะที่ต้องการเปลี่ยน
                      </p>
                    </div>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Select
                        value={formData.STUROOM}
                        onValueChange={(value) => {
                          const updatedRoom = {
                            ...dialogState.data,
                            STUROOM: value,
                          };
                          updateRoomMutation.mutate(updatedRoom);
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="เลือกสถานะ" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem
                            value="1"
                            className="flex items-center gap-2"
                          >
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-green-500" />
                              <span>พร้อมใช้งาน</span>
                            </div>
                          </SelectItem>
                          <SelectItem
                            value="2"
                            className="flex items-center gap-2"
                          >
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-yellow-500" />
                              <span>ชำรุด</span>
                            </div>
                          </SelectItem>
                          <SelectItem
                            value="3"
                            className="flex items-center gap-2"
                          >
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-red-500" />
                              <span>ปิดให้บริการ</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={() =>
                        setDialogState({
                          type: null,
                          isOpen: false,
                          data: null,
                        })
                      }
                      variant="outline"
                    >
                      ยกเลิก
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </motion.div>
            </Dialog>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};
export default RoomsSection;

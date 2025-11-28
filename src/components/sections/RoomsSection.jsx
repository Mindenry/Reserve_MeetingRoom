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
  MoreVertical,
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
import { API_URL } from "@/config";
const ITEMS_PER_PAGE = 10;
const fetchRooms = async () => {
  const response = await axios.get(`${API_URL}/room`);
  return response.data;
};
const fetchBuildings = async () => {
  const response = await axios.get(`${API_URL}/buildings`);
  return response.data;
};
const fetchRoomtypes = async () => {
  const response = await axios.get(`${API_URL}/roomtypes`);
  return response.data;
};
const fetchStatusrooms = async () => {
  const response = await axios.get(`${API_URL}/statusrooms`);
  return response.data;
};
const formatID = (id) => {
  return id.toString().padStart(3, "0");
};
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      staggerChildren: 0.1,
    },
  },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};
export const RoomsSection = () => {
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
  const statusColors = {
    1: "bg-emerald-100 text-emerald-800 border border-emerald-200",
    2: "bg-amber-100 text-amber-800 border border-amber-200",
    3: "bg-rose-100 text-rose-800 border border-rose-200",
  };
  const statusMap = {
    1: "พร้อมใช้งาน",
    2: "ชำรุด",
    3: "ปิดให้บริการ",
  };
  const [formData, setFormData] = useState({
    CFRNAME: "",
    BDNUM: "",
    FLNUM: "",
    RTNUM: "",
    STUROOM: "",
    CAPACITY: "",
  });
  const queryClient = useQueryClient();
  const { data: rooms = [], isLoading: isLoadingRooms } = useQuery({
    queryKey: ["rooms"],
    queryFn: fetchRooms,
  });
  const { data: buildings = [] } = useQuery({
    queryKey: ["buildings"],
    queryFn: fetchBuildings,
  });
  const { data: roomtypes = [] } = useQuery({
    queryKey: ["roomtypes"],
    queryFn: fetchRoomtypes,
  });
  const { data: statusrooms = [] } = useQuery({
    queryKey: ["statusrooms"],
    queryFn: fetchStatusrooms,
  });
  useEffect(() => {
    const fetchFloors = async () => {
      if (formData.BDNUM) {
        try {
          const response = await axios.get(
            `${API_URL}/floors?buildingId=${formData.BDNUM}`
          );
          setFloors(response.data);
        } catch (error) {
          console.error("Error fetching floors:", error);
          toast.error("ไม่สามารถดึงข้อมูลชั้นได้");
        }
      } else {
        setFloors([]);
      }
    };
    fetchFloors();
  }, [formData.BDNUM]);
  useEffect(() => {
    if (formData.BDNUM) {
      setFormData((prev) => ({ ...prev, FLNUM: "" }));
    }
  }, [formData.BDNUM]);
  const sortedRooms = useMemo(() => {
    return [...rooms].sort(
      (a, b) => parseInt(a.CFRNUMBER) - parseInt(b.CFRNUMBER)
    );
  }, [rooms]);
  const filteredRooms = useMemo(() => {
    return sortedRooms.filter((room) =>
      Object.values(room).some((value) =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [sortedRooms, searchTerm]);
  const totalPages = Math.ceil(filteredRooms.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedRooms = filteredRooms.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );
  const handlePageChange = (page) => {
    setCurrentPage(page);
    document
      .querySelector(".rounded-md.border")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const addRoomMutation = useMutation({
    mutationFn: (newRoom) => axios.post(`${API_URL}/addroom`, newRoom),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      toast.success("เพิ่มห้องประชุมสำเร็จ");
      setIsModalOpen(false);
    },
    onError: (error) => {
      toast.error("ไม่สามารถเพิ่มห้องประชุมได้: " + error.message);
    },
  });
  const updateRoomMutation = useMutation({
    mutationFn: (updatedRoom) =>
      axios.put(`${API_URL}/updateroom/${updatedRoom.CFRNUMBER}`, updatedRoom),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
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
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
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
  const handleDeleteRoom = () => {
    deleteRoomMutation.mutate(dialogState.data.CFRNUMBER);
  };
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  const statusStyles = {
    1: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
    },
    2: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
    },
    3: {
      bg: "bg-rose-50",
      text: "text-rose-700",
      border: "border-rose-200",
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
        <CardHeader className="p-6 relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-purple-500" />
          <div className="flex items-center justify-between">
            <motion.div variants={itemVariants}>
              <CardTitle className="text-3xl font-bold text-foreground">
                Room Management
              </CardTitle>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Button onClick={() => handleAction("add")}> 
                <Plus className="mr-2 h-4 w-4" /> Add Room
              </Button>
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
                placeholder="Search rooms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-200 focus:border-primary focus:ring-primary transition-all duration-300"
              />
            </div>
          </motion.div>
          <motion.div
            variants={itemVariants}
            className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5"
          >
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold text-muted-foreground">
                    รหัส
                  </TableHead>
                  <TableHead className="font-semibold text-muted-foreground">
                    ชื่อ
                  </TableHead>
                  <TableHead className="font-semibold text-muted-foreground">
                    อาคาร
                  </TableHead>
                  <TableHead className="font-semibold text-muted-foreground">
                    ชั้น
                  </TableHead>
                  <TableHead className="font-semibold text-muted-foreground">
                    ประเภท
                  </TableHead>
                  <TableHead className="font-semibold text-muted-foreground">
                    สถานะ
                  </TableHead>
                  <TableHead className="font-semibold text-muted-foreground">
                    ความจุ
                  </TableHead>
                  <TableHead className="font-semibold text-muted-foreground">
                    การจัดการ
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
        <AnimatePresence mode="sync">
                  {paginatedRooms.map((room) => (
                    <motion.tr
                      key={room.CFRNUMBER}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="hover:bg-gray-50/50 transition-colors duration-200"
                    >
                      <TableCell className="font-medium">
                        {formatID(room.CFRNUMBER)}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-gray-900">
                          {room.CFRNAME}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {room.BDNAME}
                      </TableCell>
                      <TableCell>{room.FLNAME}</TableCell>
                      <TableCell>{room.RTNAME}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                            statusStyles[room.STUROOM].bg
                          } ${statusStyles[room.STUROOM].text} ${
                            statusStyles[room.STUROOM].border
                          } border`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current mr-2"></span>
                          {statusMap[room.STUROOM]}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {room.CAPACITY} seats
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
                          <DropdownMenuContent align="end" className="w-32">
                            <DropdownMenuItem
                              onClick={() => handleAction("edit", room)}
                              className="cursor-pointer"
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleAction("delete", room)}
                              className="cursor-pointer text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleAction("close", room)}
                              className="cursor-pointer"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Status
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
            <div className="border-t border-gray-200 px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{startIndex + 1}</span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(
                      startIndex + ITEMS_PER_PAGE,
                      filteredRooms.length
                    )}
                  </span>{" "}
                  of <span className="font-medium">{filteredRooms.length}</span>{" "}
                  results
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
                  {Array.from({ length: totalPages }).map((_, i) => (
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
      {/* Add/Edit Room Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">
                  {editingRoom ? "Edit Room" : "Add New Room"}
                </DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveRoom(formData);
                }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="CFRNAME">Room Name</Label>
                  <Input
                    id="CFRNAME"
                    value={formData.CFRNAME}
                    onChange={(e) => handleChange("CFRNAME", e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="BDNUM">Building</Label>
                    <Select
                      value={formData.BDNUM}
                      onValueChange={(value) => handleChange("BDNUM", value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select building" />
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
                  <div>
                    <Label htmlFor="FLNUM">Floor</Label>
                    <Select
                      value={formData.FLNUM}
                      onValueChange={(value) => handleChange("FLNUM", value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select floor" />
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
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="RTNUM">Type</Label>
                    <Select
                      value={formData.RTNUM}
                      onValueChange={(value) => handleChange("RTNUM", value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {roomtypes.map((type) => (
                          <SelectItem
                            key={type.RTNUMBER}
                            value={type.RTNUMBER.toString()}
                          >
                            {type.RTNAME}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="CAPACITY">Capacity</Label>
                    <Input
                      id="CAPACITY"
                      type="number"
                      value={formData.CAPACITY}
                      onChange={(e) => handleChange("CAPACITY", e.target.value)}
                      className="mt-1"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="STUROOM">Status</Label>
                  <Select
                    value={formData.STUROOM}
                    onValueChange={(value) => handleChange("STUROOM", value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusrooms.map((status) => (
                        <SelectItem
                          key={status.STATUSROOMID}
                          value={status.STATUSROOMID.toString()}
                        >
                          {status.STATUSROOMNAME}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {editingRoom ? "Update" : "Add"} Room
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {dialogState.type === "delete" && (
          <Dialog
            open={dialogState.type === "delete"}
            onOpenChange={() =>
              setDialogState({ type: null, isOpen: false, data: null })
            }
          >
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Confirm Deletion
                </DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm text-gray-600">
                  Are you sure you want to delete room{" "}
                  <span className="font-medium">
                    {dialogState.data?.CFRNAME}
                  </span>
                  ? This action cannot be undone.
                </p>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() =>
                    setDialogState({ type: null, isOpen: false, data: null })
                  }
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteRoom}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
      {/* Status Change Dialog */}
      <AnimatePresence>
        {dialogState.type === "close" && (
          <Dialog
            open={dialogState.type === "close"}
            onOpenChange={() =>
              setDialogState({ type: null, isOpen: false, data: null })
            }
          >
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-blue-500" />
                  Change Room Status
                </DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <Label>New Status</Label>
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
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusrooms.map((status) => (
                      <SelectItem
                        key={status.STATUSROOMID}
                        value={status.STATUSROOMID.toString()}
                      >
                        {status.STATUSROOMNAME}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() =>
                    setDialogState({ type: null, isOpen: false, data: null })
                  }
                >
                  Cancel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
export default RoomsSection;

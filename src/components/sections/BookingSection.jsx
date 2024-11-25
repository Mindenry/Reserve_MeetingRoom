import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import axios from "axios";
import {
  CalendarIcon,
  Clock,
  Building,
  Layers,
  DoorOpen,
  Users,
  Home,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

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

const formControlVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

const BookingSection = () => {
  const [roomTypes, setRoomTypes] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedRoomType, setSelectedRoomType] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [selectedFloor, setSelectedFloor] = useState("");
  const [participants, setParticipants] = useState("");

  const { user } = useAuth(); // ใช้ข้อมูลผู้ใช้ที่ล็อกอินอยู่ผ่าน useAuth

  const form = useForm({
    defaultValues: {
      roomType: "",
      date: "",
      startTime: "",
      endTime: "",
      building: "",
      floor: "",
      room: "",
      participants: "",
    },
  });

  useEffect(() => {
    fetchRoomTypes();
  }, []);

  useEffect(() => {
    if (selectedRoomType && participants) {
      fetchBuildings();
      form.setValue("building", "");
      form.setValue("floor", "");
      form.setValue("room", "");
      setSelectedBuilding("");
      setSelectedFloor("");
      setRooms([]);
    }
  }, [selectedRoomType, participants]);

  // ใช้ selectedBuilding เพื่อดึงข้อมูลชั้น เมื่อมีการเปลี่ยนแปลงค่า
  useEffect(() => {
    if (selectedBuilding && selectedRoomType && participants) {
      fetchFloors(selectedBuilding);
    }
  }, [selectedBuilding, selectedRoomType, participants]);

  // เฝ้าดู selectedBuilding, selectedFloor, selectedRoomType และ participants เพื่อดึงข้อมูลห้อง
  useEffect(() => {
    if (selectedBuilding && selectedFloor && selectedRoomType && participants) {
      fetchRooms();
    }
  }, [selectedBuilding, selectedFloor, selectedRoomType, participants]);

  // ฟังก์ชันสำหรับดึงประเภทห้องจาก API
  const fetchRoomTypes = async () => {
    try {
      const response = await axios.get(`${API_URL}/roomtypes`);
      setRoomTypes(response.data);
    } catch (error) {
      console.error("Error fetching room types:", error);
      toast.error("ไม่สามารถดึงข้อมูลประเภทห้องได้");
    }
  };

  // ฟังก์ชันดึงข้อมูลอาคาร
  const fetchBuildings = async () => {
    try {
      const response = await axios.get(`${API_URL}/buildings`);
      setBuildings(response.data);
    } catch (error) {
      console.error("Error fetching buildings:", error);
      toast.error("ไม่สามารถดึงข้อมูลอาคารได้");
    }
  };

  // ฟังก์ชันดึงข้อมูลชั้น ตามอาคารที่เลือก
  const fetchFloors = async (buildingId) => {
    try {
      const response = await axios.get(
        `${API_URL}/floors?buildingId=${buildingId}`
      );
      setFloors(response.data);
    } catch (error) {
      console.error("Error fetching floors:", error);
      toast.error("ไม่สามารถดึงข้อมูลชั้นได้");
    }
  };

  // ฟังก์ชันดึงข้อมูลห้อง ตามเงื่อนไขที่เลือก
  const fetchRooms = async () => {
    try {
      const response = await axios.get(`${API_URL}/rooms`, {
        params: {
          buildingId: selectedBuilding,
          floorId: selectedFloor,
          participants,
        },
      });
      // กรองห้องที่ตรงกับประเภทห้องที่เลือก
      const filteredRooms = response.data.filter((room) => {
        return room.RTNUM.toString() === selectedRoomType.toString();
      });
      if (filteredRooms.length === 0) {
        toast.error(
          `ไม่พบห้องประเภท ${getRoomTypeName(selectedRoomType)} ในชั้นที่เลือก`
        );
        form.setValue("room", ""); // เคลียร์ค่า room ถ้าไม่มีห้อง
      }
      setRooms(filteredRooms);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      toast.error("ไม่สามารถดึงข้อมูลห้องประชุมได้");
    }
  };

  // ฟังก์ชันเสริมในการดึงชื่อประเภทห้อง
  const getRoomTypeName = (rtNumber) => {
    const roomType = roomTypes.find(
      (rt) => rt.RTNUMBER.toString() === rtNumber
    );
    return roomType ? roomType.RTNAME : "";
  };

  // ฟังก์ชันส่งข้อมูลการจอง
  const onSubmit = async (data) => {
    try {
      if (!user?.ssn) {
        toast.error("กรุณาเข้าสู่ระบบก่อนทำการจอง");
        return;
      }

      // กำหนดเวลาเริ่มต้นและสิ้นสุดจาก input และตรวจสอบเวลาให้ถูกต้อง
      const bookingDate = new Date(data.date);
      const startDateTime = new Date(bookingDate);
      const [startHours, startMinutes] = data.startTime.split(":");
      startDateTime.setHours(
        parseInt(startHours, 10),
        parseInt(startMinutes, 10)
      );
      const endDateTime = new Date(bookingDate);
      const [endHours, endMinutes] = data.endTime.split(":");
      endDateTime.setHours(parseInt(endHours, 10), parseInt(endMinutes, 10));

      // ตรวจสอบว่าเวลาเริ่มน้อยกว่าเวลาสิ้นสุดหรือไม่
      if (startDateTime >= endDateTime) {
        toast.error("เวลาเริ่มต้นต้องน้อยกว่าเวลาสิ้นสุด");
        return;
      }

      // จัดการข้อมูลการจองที่จะส่งไป API
      const bookingData = {
        date: format(bookingDate, "yyyy-MM-dd"),
        startTime: format(startDateTime, "HH:mm"),
        endTime: format(endDateTime, "HH:mm"),
        room: data.room,
        essn: user.ssn,
      };

      // เรียก API เพื่อบันทึกการจอง
      const response = await axios.post(`${API_URL}/book-room`, bookingData);
      if (response.data.success) {
        // แสดงข้อความตอบกลับตามประเภทห้อง
        if (response.data.isVIP) {
          toast.info("การจองห้อง VIP อยู่ระหว่างรอการอนุมัติ");
        } else {
          toast.success("การจองสำเร็จ!");
        }
        form.reset(); // รีเซ็ตฟอร์มเมื่อจองเสร็จสิ้น
      }
    } catch (error) {
      if (error.response?.data?.error === "ห้องถูกจองในช่วงเวลานี้แล้ว") {
        toast.error(
          "ไม่สามารถจองห้องได้ เนื่องจากต้องเว้นระยะห่าง 1 ชั่วโมงระหว่างการจอง"
        );
      } else {
        toast.error(
          error.response?.data?.error ||
            "เกิดข้อผิดพลาดในการจอง กรุณาลองใหม่อีกครั้ง"
        );
      }
    }
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants}>
      <Card className="max-w-3xl mx-auto overflow-hidden shadow-2xl rounded-xl">
        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-r from-blue-600 to-purple-600"
        >
          <CardHeader className="text-white p-8">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <DoorOpen className="w-6 h-6" />
              จองห้องประชุม
            </CardTitle>
          </CardHeader>
        </motion.div>

        <CardContent className="p-8 bg-white">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <motion.div
                variants={containerVariants}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {/* Date Field */}
                <motion.div variants={formControlVariants}>
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="flex items-center text-gray-700 font-medium mb-2">
                          <CalendarIcon className="mr-2" size={18} />
                          วันที่
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal border-gray-300 hover:border-blue-500 transition-all duration-300",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>เลือกวันที่</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < new Date() ||
                                date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
                {/* Time Fields */}
                <motion.div variants={formControlVariants}>
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center text-gray-700 font-medium mb-2">
                          <Clock className="mr-2" size={18} />
                          เวลาเริ่มต้น
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full border-gray-300 hover:border-blue-500 transition-all duration-300">
                              <SelectValue placeholder="เลือกเวลาเริ่มต้น" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[...Array(24)].map((_, i) => (
                              <SelectItem
                                key={i}
                                value={`${i.toString().padStart(2, "0")}:00`}
                              >
                                {`${i.toString().padStart(2, "0")}:00`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
                <motion.div variants={formControlVariants}>
                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center text-gray-700 font-medium mb-2">
                          <Clock className="mr-2" size={18} />
                          เวลาสิ้นสุด
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full border-gray-300 hover:border-blue-500 transition-all duration-300">
                              <SelectValue placeholder="เลือกเวลาสิ้นสุด" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[...Array(24)].map((_, i) => (
                              <SelectItem
                                key={i}
                                value={`${i.toString().padStart(2, "0")}:00`}
                              >
                                {`${i.toString().padStart(2, "0")}:00`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
                <motion.div variants={formControlVariants}>
                  <FormField
                    control={form.control}
                    name="participants"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center text-gray-700 font-medium mb-2">
                          <Users className="mr-2" size={18} />
                          จำนวนผู้เข้าร่วม
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              setParticipants(e.target.value);
                            }}
                            className="w-full bg-white border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-200"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
                <motion.div variants={formControlVariants}>
                  <FormField
                    control={form.control}
                    name="roomType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center text-gray-700 font-medium mb-2">
                          <Home className="mr-2" size={18} />
                          ประเภทห้อง
                        </FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            setSelectedRoomType(value);
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full border-gray-300 hover:border-blue-500 transition-all duration-300">
                              <SelectValue placeholder="เลือกประเภทห้อง" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {roomTypes?.map((type) => (
                              <SelectItem
                                key={type.RTNUMBER}
                                value={type.RTNUMBER.toString()}
                              >
                                {type.RTNAME}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
                <motion.div variants={formControlVariants}>
                  <FormField
                    control={form.control}
                    name="building"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center text-gray-700 font-medium mb-2">
                          <Building className="mr-2" size={18} />
                          ตึก
                        </FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            setSelectedBuilding(value);
                          }}
                          value={field.value}
                          disabled={!selectedRoomType || !participants}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full border-gray-300 hover:border-blue-500 transition-all duration-300">
                              <SelectValue placeholder="เลือกตึก" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {buildings?.map((building) => (
                              <SelectItem
                                key={building.BDNUMBER}
                                value={building.BDNUMBER.toString()}
                              >
                                {building.BDNAME}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
                <motion.div variants={formControlVariants}>
                  <FormField
                    control={form.control}
                    name="floor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center text-gray-700 font-medium mb-2">
                          <Layers className="mr-2" size={18} />
                          ชั้น
                        </FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            setSelectedFloor(value);
                          }}
                          value={field.value}
                          disabled={
                            !selectedBuilding ||
                            !selectedRoomType ||
                            !participants
                          }
                        >
                          <FormControl>
                            <SelectTrigger className="w-full border-gray-300 hover:border-blue-500 transition-all duration-300">
                              <SelectValue placeholder="เลือกชั้น" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {floors?.map((floor) => (
                              <SelectItem
                                key={floor.FLNUMBER}
                                value={floor.FLNUMBER.toString()}
                              >
                                {floor.FLNAME}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
                <motion.div variants={formControlVariants}>
                  <FormField
                    control={form.control}
                    name="room"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center text-gray-700 font-medium mb-2">
                          <DoorOpen className="mr-2" size={18} />
                          ห้อง
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={
                            !selectedFloor ||
                            !selectedRoomType ||
                            !participants ||
                            rooms.length === 0
                          }
                        >
                          <FormControl>
                            <SelectTrigger
                              className={cn(
                                "w-full border-gray-300 hover:border-blue-500 transition-all duration-300",
                                rooms.length === 0 &&
                                  "opacity-50 cursor-not-allowed"
                              )}
                            >
                              <SelectValue
                                placeholder={
                                  rooms.length === 0 && selectedFloor
                                    ? "ไม่พบห้องที่ตรงตามเงื่อนไข"
                                    : "เลือกห้อง"
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {rooms?.map((room) => (
                              <SelectItem
                                key={room.CFRNUMBER}
                                value={room.CFRNUMBER.toString()}
                              >
                                {room.CFRNAME}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
              </motion.div>
              <motion.div
                variants={formControlVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-xl"
                >
                  จองห้อง
                </Button>
              </motion.div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </motion.div>
  );
};
export default BookingSection;

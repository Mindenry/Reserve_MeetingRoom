import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import axios from "axios";
import {
  CalendarIcon, Clock, Building, Layers, DoorOpen,
  Users, Home, Check
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Form, FormControl, FormField,
  FormItem, FormLabel, FormMessage,
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
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
    mode: "onChange",
  });
  const dateTime = form.watch(['date', 'startTime', 'endTime']);
  const details = form.watch(['participants', 'roomType']);
  const location = form.watch(['building', 'floor', 'room']);
  const [formProgress, setFormProgress] = useState({
    dateTime: false,
    details: false,
    location: false,
    confirm: false
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
  }, [selectedRoomType, participants, form]);
  useEffect(() => {
    if (selectedBuilding && selectedRoomType && participants) {
      fetchFloors(selectedBuilding);
    }
  }, [selectedBuilding, selectedRoomType, participants]);
  useEffect(() => {
    if (selectedBuilding && selectedFloor && selectedRoomType && participants) {
      fetchRooms();
    }
  }, [selectedBuilding, selectedFloor, selectedRoomType, participants]);
  useEffect(() => {
    const allDateTimeFields = dateTime.every(field => field);
    const allDetailsFields = details.every(field => field && field !== "0");
    const allLocationFields = location.every(field => field);
    setFormProgress(prev => ({
      ...prev,
      dateTime: allDateTimeFields,
      details: allDetailsFields,
      location: allLocationFields,
      confirm: allDateTimeFields && allDetailsFields && allLocationFields
    }));
  }, [dateTime, details, location]);
  const fetchRoomTypes = async () => {
    try {
      const response = await axios.get(`${API_URL}/roomtypes`);
      setRoomTypes(response.data);
    } catch (error) {
      console.error("Error fetching room types:", error);
      toast.error("ไม่สามารถดึงข้อมูลประเภทห้องได้");
    }
  };
  const fetchBuildings = async () => {
    try {
      const response = await axios.get(`${API_URL}/buildings`);
      setBuildings(response.data);
    } catch (error) {
      console.error("Error fetching buildings:", error);
      toast.error("ไม่สามารถดึงข้อมูลอาคารได้");
    }
  };
  const fetchFloors = async (buildingId) => {
    try {
      const response = await axios.get(`${API_URL}/floors?buildingId=${buildingId}`);
      setFloors(response.data);
    } catch (error) {
      console.error("Error fetching floors:", error);
      toast.error("ไม่สามารถดึงข้อมูลชั้นได้");
    }
  };
  const fetchRooms = async () => {
    try {
      const response = await axios.get(`${API_URL}/rooms`, {
        params: {
          buildingId: selectedBuilding,
          floorId: selectedFloor,
          participants,
        },
      });
      const filteredRooms = response.data.filter((room) => {
        return room.RTNUM.toString() === selectedRoomType.toString();
      });
      if (filteredRooms.length === 0) {
        toast.error(`ไม่พบห้องประเภท ${getRoomTypeName(selectedRoomType)} ในชั้นที่เลือก`);
        form.setValue("room", "");
      }
      setRooms(filteredRooms);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      toast.error("ไม่สามารถดึงข้อมูลห้องประชุมได้");
    }
  };
  const getRoomTypeName = (rtNumber) => {
    const roomType = roomTypes.find((rt) => rt.RTNUMBER.toString() === rtNumber);
    return roomType ? roomType.RTNAME : "";
  };
  const validateBookingData = (data) => {
    if (!user?.ssn) {
      toast.error("กรุณาเข้าสู่ระบบก่อนทำการจอง");
      return false;
    }
    if (!data.date || !data.startTime || !data.endTime) {
      toast.error("กรุณากรอกข้อมูลวันและเวลาให้ครบถ้วน");
      return false;
    }
    if (!data.participants || parseInt(data.participants) <= 0) {
      toast.error("กรุณาระบุจำนวนผู้เข้าร่วมที่ถูกต้อง");
      return false;
    }
    if (!data.roomType || !data.building || !data.floor || !data.room) {
      toast.error("กรุณาเลือกห้องประชุมให้ครบถ้วน");
      return false;
    }
    return true;
  };
  const onSubmit = async (data) => {
    if (!validateBookingData(data)) return;
    try {
      setIsSubmitting(true);
      const bookingDate = new Date(data.date);
      const startDateTime = new Date(bookingDate);
      const [startHours, startMinutes] = data.startTime.split(":");
      startDateTime.setHours(parseInt(startHours, 10), parseInt(startMinutes, 10));
      
      const endDateTime = new Date(bookingDate);
      const [endHours, endMinutes] = data.endTime.split(":");
      endDateTime.setHours(parseInt(endHours, 10), parseInt(endMinutes, 10));
      if (startDateTime >= endDateTime) {
        toast.error("เวลาเริ่มต้นต้องน้อยกว่าเวลาสิ้นสุด");
        return;
      }
      const bookingData = {
        date: format(bookingDate, "yyyy-MM-dd"),
        startTime: format(startDateTime, "HH:mm"),
        endTime: format(endDateTime, "HH:mm"),
        room: data.room,
        essn: user.ssn,
        participants: parseInt(data.participants),
      };
      const response = await axios.post(`${API_URL}/book-room`, bookingData);
      
      if (response.data.success) {
        if (response.data.isVIP) {
          toast.info("การจองห้อง VIP อยู่ระหว่างรอการอนุมัติ");
        } else {
          toast.success("การจองสำเร็จ!");
        }
        form.reset();
        setFormProgress({
          dateTime: false,
          details: false,
          location: false,
          confirm: false
        });
        setSelectedRoomType("");
        setSelectedBuilding("");
        setSelectedFloor("");
        setParticipants("");
      }
    } catch (error) {
      if (error.response?.data?.error === "ห้องถูกจองในช่วงเวลานี้แล้ว") {
        toast.error("ไม่สามารถจองห้องได้ เนื่องจากต้องเว้นระยะห่าง 1 ชั่วโมงระหว่างการจอง");
      } else {
        toast.error(error.response?.data?.error || "เกิดข้อผิดพลาดในการจอง กรุณาลองใหม่อีกครั้ง");
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="min-h-screen py-8 px-4">
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="max-w-4xl mx-auto">
        <motion.div variants={itemVariants} className="text-center mb-8 space-y-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
            className="flex justify-center"
          >
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
              <DoorOpen className="w-6 h-6 text-white" />
            </div>
          </motion.div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            จองห้องประชุม
          </h1>
        </motion.div>
        <Card className="overflow-hidden shadow-xl rounded-xl border-0">
          <CardHeader className="relative z-10 border-b border-gray-100">
            <CardTitle className="text-xl font-bold text-gray-800">
              กรอกข้อมูลการจอง
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 relative z-10">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <motion.div variants={containerVariants} className="grid grid-cols-4 gap-2 mb-6">
                  {[
                    { label: 'วันและเวลา', completed: formProgress.dateTime },
                    { label: 'รายละเอียด', completed: formProgress.details },
                    { label: 'สถานที่', completed: formProgress.location },
                    { label: 'ยืนยัน', completed: Object.values(formProgress).every(v => v) }
                  ].map((step, index) => (
                    <motion.div key={step.label} variants={itemVariants} className="space-y-1">
                      <div className={`h-1.5 rounded-full transition-all duration-300 ${
                        step.completed ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gray-200'
                      }`} />
                      <span className="text-xs text-gray-600 font-medium">
                        {step.label}
                        {step.completed && <Check className="w-3 h-3 inline ml-1 text-green-500" />}
                      </span>
                    </motion.div>
                  ))}
                </motion.div>
                <motion.div variants={containerVariants} className="grid grid-cols-1 gap-6">
                  <motion.div variants={formControlVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg border border-gray-100">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="flex items-center space-x-2 text-gray-700">
                            <CalendarIcon className="w-4 h-4" />
                            <span>วันที่</span>
                          </FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                  {field.value ? format(field.value, "PPP") : <span>เลือกวันที่</span>}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="startTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2 text-gray-700">
                            <Clock className="w-4 h-4" />
                            <span>เวลาเริ่มต้น</span>
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="เลือกเวลาเริ่มต้น" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {[...Array(24)].map((_, i) => (
                                <SelectItem key={i} value={`${i.toString().padStart(2, "0")}:00`}>
                                  {`${i.toString().padStart(2, "0")}:00`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="endTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2 text-gray-700">
                            <Clock className="w-4 h-4" />
                            <span>เวลาสิ้นสุด</span>
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="เลือกเวลาสิ้นสุด" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {[...Array(24)].map((_, i) => (
                                <SelectItem key={i} value={`${i.toString().padStart(2, "0")}:00`}>
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
                  <motion.div variants={formControlVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg border border-gray-100">
                    <FormField
                      control={form.control}
                      name="participants"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2 text-gray-700">
                            <Users className="w-4 h-4" />
                            <span>จำนวนผู้เข้าร่วม</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                setParticipants(e.target.value);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="roomType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2 text-gray-700">
                            <Home className="w-4 h-4" />
                            <span>ประเภทห้อง</span>
                          </FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              setSelectedRoomType(value);
                            }}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="เลือกประเภทห้อง" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {roomTypes?.map((type) => (
                                <SelectItem key={type.RTNUMBER} value={type.RTNUMBER.toString()}>
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
                  <motion.div variants={formControlVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg border border-gray-100">
                    <FormField
                      control={form.control}
                      name="building"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2 text-gray-700">
                            <Building className="w-4 h-4" />
                            <span>ตึก</span>
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
                              <SelectTrigger>
                                <SelectValue placeholder="เลือกตึก" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {buildings?.map((building) => (
                                <SelectItem key={building.BDNUMBER} value={building.BDNUMBER.toString()}>
                                  {building.BDNAME}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="floor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2 text-gray-700">
                            <Layers className="w-4 h-4" />
                            <span>ชั้น</span>
                          </FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              setSelectedFloor(value);
                            }}
                            value={field.value}
                            disabled={!selectedBuilding || !selectedRoomType || !participants}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="เลือกชั้น" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {floors?.map((floor) => (
                                <SelectItem key={floor.FLNUMBER} value={floor.FLNUMBER.toString()}>
                                  {floor.FLNAME}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="room"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2 text-gray-700">
                            <DoorOpen className="w-4 h-4" />
                            <span>ห้อง</span>
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={!selectedFloor || !selectedRoomType || !participants || rooms.length === 0}
                          >
                            <FormControl>
                              <SelectTrigger>
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
                                <SelectItem key={room.CFRNUMBER} value={room.CFRNUMBER.toString()}>
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
                <motion.div variants={formControlVariants} className="pt-4">
                  <Button
                    type="submit"
                    className="w-full relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-2.5 rounded-lg transition-all duration-300 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
                    disabled={!Object.values(formProgress).every(v => v) || isSubmitting}
                  >
                    <span className="relative flex items-center justify-center gap-2">
                      {isSubmitting ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      ) : (
                        <>
                          <DoorOpen className="w-4 h-4" />
                          จองห้อง
                        </>
                      )}
                    </span>
                  </Button>
                </motion.div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
export default BookingSection;
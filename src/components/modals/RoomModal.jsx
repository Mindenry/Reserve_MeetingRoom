import React from "react";
import axios from "axios";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const RoomModal = ({ isOpen, onClose, onSave, room }) => {
  const [formData, setFormData] = React.useState({
    id: "",
    name: "",
    floor: "",
    building: "",
    capacity: "",
    type: "",
    status: "ว่าง",
  });

  React.useEffect(() => {
    if (room) {
      setFormData(room);
    } else {
      setFormData({
        id: "",
        name: "",
        floor: "",
        building: "",
        capacity: "",
        type: "",
        status: "ว่าง",
      });
    }
  }, [room]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   onSave(formData);
  // };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (room) {
        // แก้ไขข้อมูลห้อง
        await axios.put(`http://localhost:8080/room/${formData.id}`, formData);
      } else {
        // สร้างห้องใหม่
        await axios.post("http://localhost:8080/room", formData);
      }
      onSave(formData);
      onClose(); // ปิดโมดัล
    } catch (error) {
      console.error("Error saving room:", error);
      // แจ้งเตือนผู้ใช้ว่ามีข้อผิดพลาด
    }
  };

  const floorOptions = Array.from({ length: 20 }, (_, i) => i + 1);
  const buildingOptions = ["อาคาร A", "อาคาร B", "อาคาร C", "อาคาร D"];
  const typeOptions = ["ธรรมดา", "VIP"];
  const statusOptions = ["ว่าง", "ไม่ว่าง", "ปิดปรับปรุง"];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {room ? "แก้ไขห้องประชุม" : "เพิ่มห้องประชุม"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                ชื่อห้อง
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="floor" className="text-right">
                ชั้น
              </Label>
              <Select
                name="floor"
                value={formData.floor}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, floor: value }))
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="เลือกชั้น" />
                </SelectTrigger>
                <SelectContent>
                  {floorOptions.map((floor) => (
                    <SelectItem key={floor} value={floor.toString()}>
                      {floor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="building" className="text-right">
                ตึก
              </Label>
              <Select
                name="building"
                value={formData.building}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, building: value }))
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="เลือกตึก" />
                </SelectTrigger>
                <SelectContent>
                  {buildingOptions.map((building) => (
                    <SelectItem key={building} value={building}>
                      {building}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="capacity" className="text-right">
                จำนวน
              </Label>
              <Input
                id="capacity"
                name="capacity"
                type="number"
                value={formData.capacity}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                ประเภทห้อง
              </Label>
              <Select
                name="type"
                value={formData.type}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="เลือกประเภทห้อง" />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                สถานะ
              </Label>
              <Select
                name="status"
                value={formData.status}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="เลือกสถานะ" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">บันทึก</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RoomModal;

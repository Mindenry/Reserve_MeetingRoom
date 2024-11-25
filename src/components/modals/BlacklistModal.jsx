import React, { useState, useEffect } from "react";
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
import { Textarea } from "../ui/textarea";

const BlacklistModal = ({ isOpen, onClose, onSave, blacklistItem }) => {
  const [formData, setFormData] = useState({
    id: "",
    username: "",
    reason: "",
    dateAdded: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (blacklistItem) {
      setFormData(blacklistItem);
    } else {
      setFormData({
        id: "",
        username: "",
        reason: "",
        dateAdded: new Date().toISOString().split("T")[0],
      });
    }
  }, [blacklistItem]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {blacklistItem ? "แก้ไขบัญชีดำ" : "เพิ่มบัญชีดำ"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                ชื่อผู้ใช้
              </Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reason" className="text-right">
                เหตุผล
              </Label>
              <Textarea
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dateAdded" className="text-right">
                วันที่เพิ่ม
              </Label>
              <Input
                id="dateAdded"
                name="dateAdded"
                type="date"
                value={formData.dateAdded}
                onChange={handleChange}
                className="col-span-3"
                required
              />
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

export default BlacklistModal;

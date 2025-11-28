import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { API_URL } from "@/config";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Camera, UserCircle } from "lucide-react";

const ProfileSection = () => {
  const { user, login } = useAuth();
  const [form, setForm] = useState({ fname: "", lname: "", email: "", username: "" });
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch(`${API_URL}/profile/${user.ssn}`);
        const data = await r.json();
        if (data.success) {
          setForm({ fname: data.user.fname || "", lname: data.user.lname || "", email: data.user.email || "", username: data.user.username || "" });
          setAvatarUrl(data.user.avatarUrl || null);
        }
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, [user.ssn]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const r = await fetch(`${API_URL}/profile/${user.ssn}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, avatarUrl }),
      });
      const data = await r.json();
      if (data.success) {
        toast.success("บันทึกโปรไฟล์สำเร็จ");
        const userData = { ...user, fname: form.fname, lname: form.lname, email: form.email, avatarUrl, username: form.username };
        login(userData, true);
      } else {
        toast.error(data.error || "บันทึกโปรไฟล์ไม่สำเร็จ");
      }
    } catch (e) {
      toast.error("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์");
    }
  };

  const handleAvatarSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        setUploading(true);
        const dataUrl = reader.result;
        const r = await fetch(`${API_URL}/upload-avatar/${user.ssn}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dataUrl }),
        });
        const out = await r.json();
        if (out.success) {
          setAvatarUrl(out.url);
          toast.success("อัปโหลดรูปสำเร็จ");
        } else {
          toast.error(out.error || "อัปโหลดรูปไม่สำเร็จ");
        }
      } catch (err) {
        toast.error("ไม่สามารถอัปโหลดรูปภาพได้");
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="rounded-2xl shadow-lg ring-1 ring-black/5 overflow-hidden">
        <div className="relative p-8">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-purple-500" />
          <div className="flex items-start gap-8">
            <motion.div whileHover={{ scale: 1.02 }} className="relative">
              <div className="h-28 w-28 rounded-2xl bg-muted flex items-center justify-center overflow-hidden shadow-sm ring-1 ring-black/5">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="avatar" className="h-full w-full object-cover" />
                ) : (
                  <UserCircle className="h-16 w-16 text-muted-foreground" />
                )}
              </div>
              <label className="absolute -bottom-2 -right-2 bg-primary text-white rounded-full p-2 shadow cursor-pointer">
                <Camera className="h-4 w-4" />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarSelect} />
              </label>
            </motion.div>
            <div className="flex-1 grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm text-muted-foreground">ชื่อผู้ใช้</label>
                <Input name="username" value={form.username} onChange={handleChange} />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">ชื่อ</label>
                <Input name="fname" value={form.fname} onChange={handleChange} />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">นามสกุล</label>
                <Input name="lname" value={form.lname} onChange={handleChange} />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-muted-foreground">อีเมล</label>
                <Input type="email" name="email" value={form.email} onChange={handleChange} />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button onClick={handleSave} disabled={uploading}>บันทึกโปรไฟล์</Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProfileSection;

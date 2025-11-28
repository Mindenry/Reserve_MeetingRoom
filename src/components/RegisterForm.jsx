import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/config";
import { useAuth } from "@/contexts/AuthContext";

const RegisterForm = ({ onToggleForm }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const r = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, fname, lname, email, password }),
      });
      const data = await r.json();
      if (r.ok && data.success) {
        const userData = {
          ...data.user,
          positionNo: data.user.positionNo || 3,
          firstName: data.user.fname || "",
          lastName: data.user.lname || "",
          username: data.user.username || username,
        };
        login(userData, true);
      } else {
        alert(data.error || "สมัครสมาชิกไม่สำเร็จ");
      }
    } catch (e) {
      alert("เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-center text-foreground">Join the MUT Reserve</h2>
      <Input type="text" placeholder="Username" value={username} onChange={(e)=>setUsername(e.target.value)} required />
      <div className="grid grid-cols-2 gap-4">
        <Input type="text" placeholder="First Name" value={fname} onChange={(e)=>setFname(e.target.value)} required />
        <Input type="text" placeholder="Last Name" value={lname} onChange={(e)=>setLname(e.target.value)} required />
      </div>
      <Input type="email" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
      <div className="relative">
        <Input type={showPassword?"text":"password"} placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
        <button type="button" onClick={()=>setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
        </button>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>{isLoading?"กำลังสมัครสมาชิก...":"สมัครสมาชิก"}</Button>
      <p className="text-center text-muted-foreground text-sm">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => onToggleForm("login")}
          className="text-primary hover:underline font-semibold"
        >
          Login here
        </button>
      </p>
    </form>
  );
};

export default RegisterForm;

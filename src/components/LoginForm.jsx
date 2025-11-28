import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { API_URL } from "@/config";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const LoginForm = ({ onToggleForm }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("กรุณากรอกอีเมลและรหัสผ่าน", { duration: 1000 });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (data.user.status === 2) {
          toast.error("ไม่สามารถเข้าสู่ระบบได้เนื่องจากสถานะลาออก", {
            duration: 2000,
          });
          return;
        }

        const userData = {
          ...data.user,
          positionNo: data.user.positionNo || data.user.pnum || 3,
          firstName: data.user.fname || data.user.firstName || "",
          lastName: data.user.lname || data.user.lastName || "",
          username: data.user.username || (data.user.email ? String(data.user.email).split('@')[0] : ""),
        };

        login(userData, rememberMe);
        navigate("/dashboard");
      } else {
        toast.error(data.error || "อีเมลหรือรหัสผ่านไม่ถูกต้อง", {
          duration: 2000,
        });
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้", { duration: 1000 });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-center text-foreground mb-6">
        Login MUT Reserve
      </h2>
      <div className="space-y-4">
        <div className="relative">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Email"
          />
        </div>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="mr-2"
          />
          Remember me
        </label>
      </div>
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
      </Button>
    </form>
  );
};

export default LoginForm;

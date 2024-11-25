import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  Calendar,
  UserCircle,
} from "lucide-react";

const RegisterForm = ({ onToggleForm, onRegister }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    birthday: "",
    gender: "",
    email: "",
    phone: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onRegister(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-3xl font-bold text-center text-white mb-8">
        Join the MUT Reserve
      </h2>
      <div className="grid grid-cols-2 gap-6">
        <div className="col-span-2 relative">
          <User
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white opacity-70"
            size={20}
          />
          <input
            type="text"
            name="username"
            required
            value={formData.username}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-[#e94560] transition duration-300"
            placeholder="Username"
          />
        </div>
        <div className="relative">
          <UserCircle
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white opacity-70"
            size={20}
          />
          <input
            type="text"
            name="firstName"
            required
            value={formData.firstName}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-[#e94560] transition duration-300"
            placeholder="First Name"
          />
        </div>
        <div className="relative">
          <UserCircle
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white opacity-70"
            size={20}
          />
          <input
            type="text"
            name="lastName"
            required
            value={formData.lastName}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-[#e94560] transition duration-300"
            placeholder="Last Name"
          />
        </div>
      </div>
      <div className="relative">
        <Calendar
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white opacity-70"
          size={20}
        />
        <input
          type="date"
          name="birthday"
          required
          value={formData.birthday}
          onChange={handleChange}
          className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-[#e94560] transition duration-300"
        />
      </div>
      <div className="flex justify-center space-x-8 text-white">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            name="gender"
            value="male"
            required
            checked={formData.gender === "male"}
            onChange={handleChange}
            className="form-radio text-[#e94560] focus:ring-[#e94560]"
          />
          <span>Male</span>
        </label>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            name="gender"
            value="female"
            required
            checked={formData.gender === "female"}
            onChange={handleChange}
            className="form-radio text-[#e94560] focus:ring-[#e94560]"
          />
          <span>Female</span>
        </label>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="relative">
          <Mail
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white opacity-70"
            size={20}
          />
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-[#e94560] transition duration-300"
            placeholder="Email"
          />
        </div>
        <div className="relative">
          <Phone
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white opacity-70"
            size={20}
          />
          <input
            type="tel"
            name="phone"
            required
            value={formData.phone}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-[#e94560] transition duration-300"
            placeholder="Phone Number"
          />
        </div>
      </div>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          required
          value={formData.password}
          onChange={handleChange}
          className="w-full pl-10 pr-12 py-3 bg-white bg-opacity-10 border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-[#e94560] transition duration-300"
          placeholder="Password"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white opacity-70 hover:opacity-100 transition duration-300"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
      <button
        type="submit"
        className="w-full py-3 bg-[#e94560] text-white font-bold rounded-lg hover:bg-[#ff6b6b] transition duration-300 transform hover:scale-105"
      >
        Register
      </button>
      <p className="text-center text-white text-sm">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => onToggleForm("login")}
          className="text-[#e94560] hover:underline font-semibold transition duration-300"
        >
          Login here
        </button>
      </p>
    </form>
  );
};

export default RegisterForm;

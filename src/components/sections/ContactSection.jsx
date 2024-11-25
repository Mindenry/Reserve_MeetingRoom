import React from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { MessageCircle, Send, User, IdCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";
import { toast } from "sonner";

const ContactUser = () => {
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm();

  // ฟังก์ชันสำหรับการส่งข้อมูลเมื่อมีการ submit ฟอร์ม
  const onSubmit = async (data) => {
    // ตรวจสอบว่า user มีค่า SSN หรือไม่ (เพื่อยืนยันการล็อกอิน)
    if (!user?.ssn) {
      toast.error("กรุณาเข้าสู่ระบบก่อนส่งข้อความ");
      return;
    }

    try {
      const employeeCheck = await axios.get(
        `http://localhost:8080/employee/${user.ssn}`
      );
      if (!employeeCheck.data.success) {
        toast.error("ไม่พบข้อมูลพนักงาน");
        return;
      }

      const response = await axios.post("http://localhost:8080/contact", {
        ESSN: user.ssn,
        MESSAGE: data.message,
      });

      // ตรวจสอบความสำเร็จในการส่งข้อมูล
      if (response.data.success) {
        toast.success("ส่งคำขอปลดล็อคเรียบร้อยแล้ว");
        reset();
      } else {
        toast.error(response.data.error || "ไม่สามารถส่งข้อความได้");
      }
    } catch (error) {
      console.error("Error submitting contact:", error);
      toast.error(
        error.response?.data?.error ||
          "ไม่สามารถส่งข้อความได้ กรุณาลองใหม่อีกครั้ง"
      );
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
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
      transition: { duration: 0.2 },
    },
  };

  return (
    <div>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-2xl mx-auto"
      >
        <div className="backdrop-blur-sm bg-white/80 rounded-2xl shadow-2xl overflow-hidden border border-white/20">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 to-purple-600/30 backdrop-blur-sm"></div>
            <motion.div variants={itemVariants} className="relative z-10">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                  <MessageCircle className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white">
                  ติดต่อขอปลดล็อค Blacklist
                </h1>
              </div>
              <p className="mt-3 text-blue-100 text-lg">
                กรุณาระบุเหตุผลในการขอปลดล็อค
                เราจะพิจารณาคำขอของคุณโดยเร็วที่สุด
              </p>
            </motion.div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
            <motion.div
              variants={itemVariants}
              className="bg-white/50 backdrop-blur-sm p-6 rounded-xl border border-gray-100 shadow-lg"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    ข้อมูลผู้ส่ง
                  </h3>
                  <p className="text-sm text-gray-500">
                    กรุณาตรวจสอบข้อมูลของคุณ
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <IdCard className="h-4 w-4 text-gray-400" />
                  <p className="font-medium text-gray-700">
                    รหัสพนักงาน:{" "}
                    <span className="text-blue-600">{user?.ssn}</span>
                  </p>
                </div>
                <p className="font-medium text-gray-700">
                  ชื่อ-นามสกุล:{" "}
                  <span className="text-blue-600">
                    {user?.firstName} {user?.lastName}
                  </span>
                </p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-3">
              <label className="text-sm font-medium text-gray-700 block">
                ข้อความ
              </label>
              <div className="relative">
                <Textarea
                  {...register("message", {
                    required: "กรุณากรอกข้อความ",
                    maxLength: {
                      value: 100,
                      message: "ข้อความต้องไม่เกิน 100 ตัวอักษร",
                    },
                  })}
                  placeholder="กรุณาระบุเหตุผลในการขอปลดล็อค..."
                  className="min-h-[150px] resize-none bg-white/50 backdrop-blur-sm border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                {errors.message && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-500 mt-1"
                  >
                    {errors.message.message}
                  </motion.p>
                )}
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex justify-end pt-4"
            >
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-2.5 rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
              >
                {isSubmitting ? (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center"
                  >
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    กำลังส่ง...
                  </motion.span>
                ) : (
                  <span className="flex items-center">
                    <Send className="mr-2 h-4 w-4" />
                    ส่งข้อความ
                  </span>
                )}
              </Button>
            </motion.div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ContactUser;

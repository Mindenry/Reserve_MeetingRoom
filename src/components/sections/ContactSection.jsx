import React from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { MessageCircle, Send, User, IdCard, Lock, ChevronRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";
import { API_URL } from "@/config";
import { toast } from "sonner";

const ContactUser = () => {
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm();

  const onSubmit = async (data) => {
    if (!user?.ssn) {
      toast.error("กรุณาเข้าสู่ระบบก่อนส่งข้อความ");
      return;
    }

    try {
      const employeeCheck = await axios.get(
        `${API_URL}/employee/${user.ssn}`
      );
      if (!employeeCheck.data.success) {
        toast.error("ไม่พบข้อมูลพนักงาน");
        return;
      }

      const response = await axios.post(`${API_URL}/contact`, {
        ESSN: user.ssn,
        MESSAGE: data.message,
      });

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
        duration: 0.6,
        ease: [0.6, -0.05, 0.01, 0.99],
      },
    },
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.6, -0.05, 0.01, 0.99],
      },
    },
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-gray-100">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-3xl mx-auto"
      >
        <div className="relative backdrop-blur-xl bg-white/80 rounded-2xl shadow-2xl overflow-hidden border border-white/20">
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-violet-500/20 to-fuchsia-500/20 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-violet-500/20 to-fuchsia-500/20 rounded-full blur-3xl -z-10" />

          {/* Header */}
          <div className="relative px-8 pt-12 pb-8 text-center">
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center justify-center p-3 bg-violet-500/10 rounded-2xl mb-6"
            >
              <Lock className="h-8 w-8 text-violet-600" />
            </motion.div>
            <motion.h1
              variants={fadeInUp}
              className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600"
            >
              ติดต่อขอปลดล็อค Blacklist
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="mt-3 text-gray-600 text-lg max-w-xl mx-auto"
            >
              กรุณาระบุเหตุผลในการขอปลดล็อค เราจะพิจารณาคำขอของคุณโดยเร็วที่สุด
            </motion.p>
          </div>

          {/* User Info Card */}
          <motion.div
            variants={fadeInUp}
            className="mx-8 mb-8 p-6 bg-white rounded-xl shadow-sm border border-gray-100"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-2 bg-violet-100 rounded-lg">
                <User className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">ข้อมูลผู้ส่ง</h3>
                <p className="text-sm text-gray-500">กรุณาตรวจสอบข้อมูลของคุณ</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <IdCard className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">รหัสพนักงาน</p>
                  <p className="font-medium text-gray-900">{user?.ssn}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">ชื่อ-นามสกุล</p>
                  <p className="font-medium text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="px-8 pb-8">
            <motion.div variants={fadeInUp} className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
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
                  className="min-h-[150px] w-full resize-none bg-white rounded-xl border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
                />
                {errors.message && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -bottom-6 left-0 text-sm text-red-500"
                  >
                    {errors.message.message}
                  </motion.p>
                )}
              </div>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="mt-8 flex justify-end"
            >
              <Button
                type="submit"
                disabled={isSubmitting}
                className="relative inline-flex items-center px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-medium rounded-xl hover:opacity-90 transition-all duration-200 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center"
                  >
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    กำลังส่ง...
                  </motion.div>
                ) : (
                  <>
                    <span>ส่งข้อความ</span>
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </>
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

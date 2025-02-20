import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Home,
  Shield,
  UserX,
  BarChart3,
  Lock,
  Mail,
  MessageCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const AboutSection = () => {
  const features = [
    {
      name: "จัดการสมาชิก",
      icon: Users,
      description: "ระบบจัดการข้อมูลสมาชิกแบบครบวงจร",
      color: "from-violet-500 to-purple-500",
    },
    {
      name: "จัดการห้องประชุม",
      icon: Home,
      description: "จองห้องประชุมและจัดการทรัพยากร",
      color: "from-blue-500 to-cyan-500",
    },
    {
      name: "จัดการการเข้าถึง",
      icon: Shield,
      description: "ควบคุมความปลอดภัยและการเข้าถึง",
      color: "from-green-500 to-emerald-500",
    },
    {
      name: "จัดการล็อคสมาชิก",
      icon: UserX,
      description: "ระงับและจัดการสิทธิ์ผู้ใช้",
      color: "from-rose-500 to-pink-500",
    },
    {
      name: "รายงานและสถิติ",
      icon: BarChart3,
      description: "วิเคราะห์ข้อมูลและออกรายงาน",
      color: "from-amber-500 to-orange-500",
    },
    {
      name: "รับเรื่องติดต่อ",
      icon: MessageCircle,
      description: "รับเรื่องจากการติดต่อสมาชิกที่ต้องการจะปลดล็อค",
      color: "from-indigo-500 to-blue-500",
    },
    {
      name: "จัดการสิทธิ์การใช้งาน",
      icon: Lock,
      description: "กำหนดระดับการเข้าถึงระบบ",
      color: "from-fuchsia-500 to-pink-500",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  };

  return (
    <div className="min-h-screen w-full py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info Card */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader className="space-y-6 p-8">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200">
                    Version 1.0
                  </Badge>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Badge className="bg-gradient-to-r from-violet-600 to-indigo-600">
                      Full Release
                    </Badge>
                  </motion.div>
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600">
                    MUT Reserve DashBoard
                  </CardTitle>
                  <p className="mt-2 text-gray-600">
                    ระบบจัดการการจองห้องประชุมและทรัพยากรแบบครบวงจร พร้อมฟีเจอร์ที่ครอบคลุมทุกการใช้งาน
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">ความคืบหน้าการพัฒนา</span>
                    <span className="text-sm font-semibold text-violet-600">100%</span>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <motion.div
                    variants={itemVariants}
                    className="rounded-xl border border-gray-100 p-6 bg-gradient-to-br from-violet-50/50 to-indigo-50/50"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      ทีมพัฒนา
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-violet-100 rounded-lg">
                          <Users className="w-5 h-5 text-violet-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Team Avenger EIEI</p>
                          <p className="text-xs text-gray-500">Software Development Team</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-violet-100 rounded-lg">
                          <Mail className="w-5 h-5 text-violet-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">support@teamgameover.com</p>
                          <p className="text-xs text-gray-500">Contact Email</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                  <motion.div
                    variants={itemVariants}
                    className="rounded-xl border border-gray-100 p-6 bg-gradient-to-br from-indigo-50/50 to-violet-50/50"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      สถานะระบบ
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <span className="text-sm text-gray-600">ระบบพร้อมใช้งาน</span>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Active
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500">
                        Last updated: {new Date().toLocaleDateString()}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Features Grid */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader className="p-6">
                <CardTitle className="text-xl font-semibold text-gray-900">
                  ฟีเจอร์หลัก
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <TooltipProvider>
                  <div className="space-y-3">
                    {features.map((feature, index) => (
                      <Tooltip key={index}>
                        <TooltipTrigger asChild>
                          <motion.div
                            variants={itemVariants}
                            whileHover={{ scale: 1.02 }}
                            className="group relative p-4 rounded-lg border border-gray-100 bg-white hover:shadow-lg transition-all duration-300"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-10 rounded-lg transition-opacity duration-300 ${feature.color}" />
                            <div className="flex items-center space-x-4">
                              <div className={`p-2 rounded-lg bg-gradient-to-r ${feature.color}`}>
                                <feature.icon className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-gray-900">
                                  {feature.name}
                                </h4>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {feature.description}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-sm">{feature.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </TooltipProvider>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          variants={itemVariants}
          className="mt-8 text-center text-sm text-gray-500"
        >
          © 2024 MUT Reserve. All rights reserved.
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AboutSection;
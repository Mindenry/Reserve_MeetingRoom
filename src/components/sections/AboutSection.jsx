import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
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
} from "../ui/tooltip";

const AboutSection = () => {
  const features = [
    {
      name: "จัดการสมาชิก",
      icon: Users,
      description: "ระบบจัดการข้อมูลสมาชิกแบบครบวงจร",
    },
    {
      name: "จัดการห้องประชุม",
      icon: Home,
      description: "จองห้องประชุมและจัดการทรัพยากร",
    },
    {
      name: "จัดการการเข้าถึง",
      icon: Shield,
      description: "ควบคุมความปลอดภัยและการเข้าถึง",
    },
    {
      name: "จัดการล็อคสมาชิก",
      icon: UserX,
      description: "ระงับและจัดการสิทธิ์ผู้ใช้",
    },
    {
      name: "รายงานและสถิติ",
      icon: BarChart3,
      description: "วิเคราะห์ข้อมูลและออกรายงาน",
    },
    {
      name: "รับเรื่องติดต่อ",
      icon: MessageCircle,
      description: "รับเรื่องจากการติดต่อสมาชิกที่ต้องการจะปลดล็อค",
    },
    {
      name: "จัดการสิทธิ์การใช้งาน",
      icon: Lock,
      description: "กำหนดระดับการเข้าถึงระบบ",
    },
  ];

  // Variants for animation
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: (i) => ({ opacity: 0, x: i % 2 === 0 ? -30 : 30 }), // Left for even, right for odd
    visible: { opacity: 1, x: 0, transition: { type: "spring", damping: 15 } },
  };

  return (
    <div>
      <TooltipProvider>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-3xl mx-auto overflow-hidden shadow-2xl rounded-2xl"
        >
          <Card className="overflow-hidden rounded-2xl">
            <CardHeader className="bg-gradient-to-r from-blue-700 to-purple-700 p-8">
              <motion.div
                variants={itemVariants}
                custom={0}
                className="flex items-center justify-between"
              >
                <div>
                  <CardTitle className="text-2xl font-bold text-white mb-2">
                    ระบบจัดการ MUT Reserve
                  </CardTitle>
                  <p className="text-blue-100">
                    ระบบจัดการการจองห้องประชุมและทรัพยากรแบบครบวงจร
                  </p>
                </div>
                <Badge variant="secondary" className="bg-white/10 text-white">
                  Version 1 Full
                </Badge>
              </motion.div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <motion.div
                variants={itemVariants}
                custom={1}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                <div className="space-y-4">
                  <div className="space-y-3">
                    <h2 className="text-xl font-semibold text-gray-800">
                      DashBoard Admin Advance
                    </h2>
                    <p className="text-sm text-gray-600">
                      ระบบจัดการข้อมูล Backend ที่ครอบคลุมทุกการใช้งาน
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">
                          ความคืบหน้าการพัฒนา
                        </span>
                        <span className="text-sm text-blue-600 font-semibold">
                          100%
                        </span>
                      </div>
                      <Progress value={100} className="h-2 bg-gray-100" />
                    </div>
                  </div>
                  <motion.div
                    variants={itemVariants}
                    custom={2}
                    className="bg-gray-50 p-4 rounded-lg border border-gray-100"
                  >
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                      ข้อมูลการติดต่อ
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Users className="w-4 h-4 text-blue-500" />
                        <span>ทีมพัฒนาซอฟต์แวร์ Team Avenger EIEI</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4 text-blue-500" />
                        <span>support@teamgameover.com</span>
                      </div>
                    </div>
                  </motion.div>
                </div>
                <motion.div variants={containerVariants} className="space-y-3">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    ฟีเจอร์หลัก
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {features.map((feature, index) => (
                      <Tooltip key={index}>
                        <TooltipTrigger asChild>
                          <motion.div
                            custom={index}
                            variants={itemVariants}
                            whileHover={{ scale: 1.03 }}
                            className="p-3 rounded-lg bg-white shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100"
                          >
                            <div className="flex items-center space-x-3">
                              <feature.icon className="w-5 h-5 text-blue-500" />
                              <div>
                                <h4 className="text-sm font-medium text-gray-800">
                                  {feature.name}
                                </h4>
                                <p className="text-xs text-gray-500">
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
                </motion.div>
              </motion.div>
              <motion.div
                variants={itemVariants}
                custom={3}
                className="pt-4 border-t border-gray-100"
              >
                <p className="text-xs text-center text-gray-500">
                  © 2024 MUT Reserve. All rights reserved.
                </p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </TooltipProvider>
    </div>
  );
};

export default AboutSection;

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Search,
  User,
  MessageSquare,
  Loader2,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import axios from "axios";

const ContactInfo = () => {
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchContacts(); // เรียกฟังก์ชันเพื่อดึงข้อมูลผู้ติดต่อ
  }, []);

  // ฟังก์ชันสำหรับดึงข้อมูลผู้ติดต่อจาก API
  const fetchContacts = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("http://localhost:8080/contacts");
      setContacts(response.data); // ตั้งค่าผู้ติดต่อจากข้อมูลที่ได้
    } catch (error) {
      toast.error("ไม่สามารถดึงข้อมูลการติดต่อได้", {
        description: "กรุณาลองใหม่อีกครั้ง",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ฟิลเตอร์ข้อมูลผู้ติดต่อโดยใช้คำค้นหา
  const filteredContacts = contacts.filter(
    (contact) =>
      contact.ESSN.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.MESSAGE.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const LoadingCard = () => (
    <div className="relative overflow-hidden p-4 rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center space-x-4">
        <div className="h-12 w-12 rounded-full bg-gray-200 animate-pulse" />
        <div className="space-y-3 flex-1">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
          <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Panel - Contact List */}
          <div className="md:col-span-5 lg:col-span-4">
            <Card className="shadow-lg border-0 overflow-hidden">
              <CardHeader className="space-y-4 border-b bg-white/50 backdrop-blur supports-[backdrop-filter]:bg-white/50">
                <CardTitle className="text-xl font-bold flex items-center gap-2 text-indigo-700">
                  <Mail className="h-5 w-5" />
                  รายการติดต่อ
                </CardTitle>
                <CardDescription className="text-gray-600">
                  รายการขอปลดล็อค Blacklist ทั้งหมด
                </CardDescription>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="ค้นหารายการ..."
                    className="pl-10 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 bg-white/70"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent className="p-4 bg-white/40">
                <ScrollArea className="h-[calc(100vh-300px)]">
                  <div className="space-y-3">
                    {isLoading ? (
                      Array(5)
                        .fill(0)
                        .map((_, i) => <LoadingCard key={i} />)
                    ) : filteredContacts.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-8"
                      >
                        <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                        <p className="text-gray-500">ไม่พบรายการที่ค้นหา</p>
                      </motion.div>
                    ) : (
                      <AnimatePresence mode="popLayout">
                        {filteredContacts.map((contact) => (
                          <motion.div
                            key={contact.CONTEACTID}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            whileHover={{ scale: 1.01 }}
                            onClick={() => setSelectedContact(contact)}
                            className={`p-4 rounded-lg cursor-pointer transition-all ${
                              selectedContact?.CONTEACTID === contact.CONTEACTID
                                ? "bg-indigo-50 border-indigo-200 shadow-md"
                                : "bg-white hover:bg-gray-50 border-gray-100"
                            } border shadow-sm`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full p-2.5">
                                  <User className="h-6 w-6 text-indigo-600" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium text-gray-900">
                                      {contact.ESSN}
                                    </p>
                                  </div>
                                  <p className="text-sm text-gray-600 mt-0.5">
                                    {contact.FNAME} {contact.LNAME}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Contact Details */}
          <div className="md:col-span-7 lg:col-span-8">
            <Card className="shadow-lg border-0">
              {selectedContact ? (
                <>
                  <CardHeader className="border-b bg-white/50 backdrop-blur supports-[backdrop-filter]:bg-white/50">
                    <CardTitle className="text-xl font-bold flex items-center gap-2 text-indigo-700">
                      <MessageSquare className="h-5 w-5" />
                      รายละเอียดการติดต่อ
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border border-gray-100 p-6 rounded-lg shadow-sm"
                      >
                        <h3 className="font-medium text-indigo-700 mb-4 flex items-center gap-2">
                          <User className="h-4 w-4" />
                          ข้อมูลผู้ติดต่อ
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <p className="text-sm text-gray-500">รหัสพนักงาน</p>
                            <p className="font-medium text-gray-900 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 p-3 rounded-lg border border-indigo-100/50">
                              {selectedContact.ESSN}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm text-gray-500">
                              ชื่อ-นามสกุล
                            </p>
                            <p className="font-medium text-gray-900 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 p-3 rounded-lg border border-indigo-100/50">
                              {selectedContact.FNAME} {selectedContact.LNAME}
                            </p>
                          </div>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white border border-gray-100 p-6 rounded-lg shadow-sm"
                      >
                        <h3 className="font-medium text-indigo-700 mb-4 flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          ข้อความ
                        </h3>
                        <div className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 p-4 rounded-lg border border-indigo-100/50">
                          <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                            {selectedContact.MESSAGE}
                          </p>
                        </div>
                      </motion.div>
                    </div>
                  </CardContent>
                </>
              ) : (
                <CardContent className="h-[calc(100vh-200px)] flex items-center justify-center bg-white/40">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                  >
                    <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full p-4 w-fit mx-auto mb-4">
                      <Mail className="h-12 w-12 text-indigo-600" />
                    </div>
                    <p className="text-lg font-medium text-gray-700">
                      เลือกรายการติดต่อเพื่อดูรายละเอียด
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      คลิกที่รายการด้านซ้ายเพื่อดูข้อมูลเพิ่มเติม
                    </p>
                  </motion.div>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ContactInfo;

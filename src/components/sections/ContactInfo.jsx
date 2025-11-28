import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import axios from "axios";
import { API_URL } from "@/config";
import {
  Mail,
  Search,
  User,
  MessageSquare,
  AlertCircle,
  Calendar,
} from "lucide-react";
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

const ContactInfo = () => {
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    if (selectedContact) {
      setTimeout(() => setShowDetails(true), 300);
    } else {
      setShowDetails(false);
    }
  }, [selectedContact]);

  const fetchContacts = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/contacts`);
      setContacts(response.data);
    } catch (error) {
      toast.error("ไม่สามารถดึงข้อมูลการติดต่อได้", {
        description: "กรุณาลองใหม่อีกครั้ง",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredContacts = contacts.filter((contact) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      contact.ESSN.toLowerCase().includes(searchLower) ||
      contact.FNAME.toLowerCase().includes(searchLower) ||
      contact.LNAME.toLowerCase().includes(searchLower)
    );
  });

  const LoadingCard = () => (
    <div className="relative overflow-hidden p-4 rounded-xl border border-indigo-100 bg-white/60 backdrop-blur-sm">
      <div className="flex items-center space-x-4">
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-200 to-purple-200 animate-pulse" />
        <div className="space-y-3 flex-1">
          <div className="h-4 bg-gradient-to-r from-indigo-100 to-purple-100 rounded animate-pulse w-1/3" />
          <div className="h-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded animate-pulse w-1/2" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-6 transition-all duration-500">
      <div className="max-w-7xl mx-auto fade-in">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Panel - Contact List */}
          <div className="md:col-span-5 lg:col-span-4">
            <Card className="shadow-2xl border-0 overflow-hidden bg-white/80 backdrop-blur-lg">
              <CardHeader className="space-y-4 border-b border-indigo-100 bg-gradient-to-r from-white via-indigo-50/30 to-purple-50/30">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg">
                      <Mail className="h-5 w-5 text-indigo-600" />
                    </div>
                    รายการติดต่อ
                  </CardTitle>
                  <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0">
                    {filteredContacts.length} รายการ
                  </Badge>
                </div>
                <CardDescription className="text-indigo-600/70">
                  รายการขอปลดล็อค Blacklist ทั้งหมด
                </CardDescription>
                <div className="relative transform transition-all duration-200 focus-within:scale-[1.02]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400" />
                  <Input
                    placeholder="ค้นหาด้วยรหัสพนักงานหรือชื่อ..."
                    className="pl-10 border-indigo-100 focus:border-indigo-300 focus:ring-indigo-200 bg-white/90 transition-all duration-300"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent className="p-4 bg-gradient-to-br from-white/90 to-indigo-50/30">
                <ScrollArea className="h-[calc(100vh-300px)] px-2">
                  <div className="space-y-3 py-2">
                    {isLoading ? (
                      Array(5)
                        .fill(0)
                        .map((_, i) => <LoadingCard key={i} />)
                    ) : filteredContacts.length === 0 ? (
                      <div className="text-center py-8 fade-in">
                        <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full p-4 w-fit mx-auto mb-4">
                          <AlertCircle className="h-8 w-8 text-indigo-500" />
                        </div>
                        <p className="text-indigo-700 font-medium">
                          ไม่พบรายการที่ค้นหา
                        </p>
                        <p className="text-indigo-500/70 mt-1">
                          ลองค้นหาด้วยคำค้นอื่น
                        </p>
                      </div>
                    ) : (
                      filteredContacts.map((contact, index) => (
                        <div
                          key={contact.CONTEACTID}
                          className={`transform transition-all duration-300 hover:scale-[1.02] ${
                            index === 0 ? "" : "mt-4"
                          }`}
                          style={{
                            animationDelay: `${index * 100}ms`,
                          }}
                        >
                          <div
                            onClick={() => setSelectedContact(contact)}
                            className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                              selectedContact?.CONTEACTID === contact.CONTEACTID
                                ? "bg-gradient-to-r from-indigo-100 via-indigo-50 to-purple-50 border-indigo-200 shadow-lg scale-[1.02]"
                                : "bg-white hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 border-gray-100 hover:shadow-md"
                            } border backdrop-blur-sm`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-center space-x-4">
                                <div
                                  className={`rounded-xl p-3 transition-all duration-300 ${
                                    selectedContact?.CONTEACTID ===
                                    contact.CONTEACTID
                                      ? "bg-gradient-to-br from-indigo-200 to-purple-200"
                                      : "bg-gradient-to-br from-indigo-100 to-purple-100"
                                  }`}
                                >
                                  <User
                                    className={`h-6 w-6 ${
                                      selectedContact?.CONTEACTID ===
                                      contact.CONTEACTID
                                        ? "text-indigo-700"
                                        : "text-indigo-500"
                                    }`}
                                  />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p
                                      className={`font-medium transition-all duration-300 ${
                                        selectedContact?.CONTEACTID ===
                                        contact.CONTEACTID
                                          ? "text-indigo-700"
                                          : "text-gray-700"
                                      }`}
                                    >
                                      {contact.ESSN}
                                    </p>
                                  </div>
                                  <p className="text-sm text-indigo-500/70 mt-1">
                                    {contact.FNAME} {contact.LNAME}
                                  </p>
                                </div>
                              </div>
                              <Badge className="bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 border-0 hover:from-indigo-200 hover:to-purple-200">
                                รายละเอียด
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Contact Details */}
          <div className="md:col-span-7 lg:col-span-8">
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-lg">
              {selectedContact ? (
                <>
                  <CardHeader className="border-b border-indigo-100 bg-gradient-to-r from-white via-indigo-50/30 to-purple-50/30">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                        <div className="p-2 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg">
                          <MessageSquare className="h-5 w-5 text-indigo-600" />
                        </div>
                        รายละเอียดการติดต่อ
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <div
                        className={`transition-all duration-500 transform ${
                          showDetails
                            ? "translate-y-0 opacity-100"
                            : "translate-y-4 opacity-0"
                        }`}
                      >
                        <div className="bg-gradient-to-br from-white to-indigo-50/30 border border-indigo-100 p-6 rounded-xl shadow-sm">
                          <h3 className="font-medium text-indigo-700 mb-4 flex items-center gap-2">
                            <User className="h-4 w-4" />
                            ข้อมูลผู้ติดต่อ
                          </h3>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <p className="text-sm text-indigo-600/70">
                                รหัสพนักงาน
                              </p>
                              <p className="font-medium text-gray-900 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 p-3 rounded-xl border border-indigo-100">
                                {selectedContact.ESSN}
                              </p>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm text-indigo-600/70">
                                ชื่อ-นามสกุล
                              </p>
                              <p className="font-medium text-gray-900 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 p-3 rounded-xl border border-indigo-100">
                                {selectedContact.FNAME} {selectedContact.LNAME}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`transition-all duration-500 delay-100 transform ${
                          showDetails
                            ? "translate-y-0 opacity-100"
                            : "translate-y-4 opacity-0"
                        }`}
                      >
                        <div className="bg-gradient-to-br from-white to-indigo-50/30 border border-indigo-100 p-6 rounded-xl shadow-sm">
                          <h3 className="font-medium text-indigo-700 mb-4 flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            ข้อความ
                          </h3>
                          <div className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 p-4 rounded-xl border border-indigo-100">
                            <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                              {selectedContact.MESSAGE}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </>
              ) : (
                <CardContent className="h-[calc(100vh-200px)] flex items-center justify-center">
                  <div className="text-center transform transition-all duration-500 hover:scale-105">
                    <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl p-6 w-fit mx-auto mb-6">
                      <Mail className="h-12 w-12 text-indigo-600" />
                    </div>
                    <p className="text-xl font-medium text-indigo-700 mb-2">
                      เลือกรายการติดต่อเพื่อดูรายละเอียด
                    </p>
                    <p className="text-sm text-indigo-500">
                      คลิกที่รายการด้านซ้ายเพื่อดูข้อมูลเพิ่มเติม
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;

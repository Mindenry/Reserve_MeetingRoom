import React, { useState, useMemo } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  MoreVertical,
  Edit,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_URL = "http://localhost:8080";
const ITEMS_PER_PAGE = 10;

// Utility functions
const fetchMembers = async () => {
  const response = await axios.get(`${API_URL}/members`);
  return response.data;
};

const fetchDepartments = async () => {
  const response = await axios.get(`${API_URL}/departments`);
  return response.data;
};

const fetchPositions = async () => {
  const response = await axios.get(`${API_URL}/positions`);
  return response.data;
};

const fetchStatusEmps = async () => {
  const response = await axios.get(`${API_URL}/statusemps`);
  return response.data;
};

const formatID = (id) => id.toString().padStart(3, "0");

const MembersSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingMember, setEditingMember] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    FNAME: "",
    LNAME: "",
    EMAIL: "",
    PW: "",
    DNO: "",
    PNO: "",
    STUEMP: "",
  });

  const queryClient = useQueryClient();

  // Premium status styling
  const statusStyles = {
    1: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      icon: "🟢",
    },
    2: {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
      icon: "🔴",
    },
    3: {
      bg: "bg-gray-50",
      text: "text-gray-700",
      border: "border-gray-200",
      icon: "⚪",
    },
  };

  const statusMap = {
    1: "ทำงาน",
    2: "ลาออก",
    3: "เกษียณอายุ",
  };

  // Queries
  const {
    data: members = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["members"],
    queryFn: fetchMembers,
  });

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: fetchDepartments,
  });

  const { data: positions = [] } = useQuery({
    queryKey: ["positions"],
    queryFn: fetchPositions,
  });

  const { data: statusEmps = [] } = useQuery({
    queryKey: ["statusEmps"],
    queryFn: fetchStatusEmps,
  });

  // Memoized data processing
  const sortedMembers = useMemo(
    () => [...members].sort((a, b) => a.SSN - b.SSN),
    [members]
  );

  const filteredMembers = useMemo(
    () =>
      sortedMembers.filter((member) =>
        Object.values(member).some((value) =>
          value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      ),
    [sortedMembers, searchTerm]
  );

  const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedMembers = filteredMembers.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // Mutations
  const addMemberMutation = useMutation({
    mutationFn: (newMember) => axios.post(`${API_URL}/addmembers`, newMember),
    onSuccess: () => {
      queryClient.invalidateQueries("members");
      toast.success("Member added successfully", {
        className: "bg-emerald-50 border border-emerald-200",
      });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Error adding member", {
        className: "bg-red-50 border border-red-200",
      });
    },
  });

  const updateMemberMutation = useMutation({
    mutationFn: (updatedMember) =>
      axios.put(`${API_URL}/updatemembers/${updatedMember.SSN}`, updatedMember),
    onSuccess: (data) => {
      queryClient.invalidateQueries("members");
      toast.success("Member updated successfully", {
        className: "bg-emerald-50 border border-emerald-200",
      });
      setIsModalOpen(false);
      setEditingMember(null);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Error updating member", {
        className: "bg-red-50 border border-red-200",
      });
    },
  });

  // Event handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
    document
      .querySelector(".member-table")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const processedData = {
      ...formData,
      DNO: Number(formData.DNO),
      PNO: Number(formData.PNO),
      STUEMP: Number(formData.STUEMP),
    };

    if (editingMember) {
      if (!processedData.PW || processedData.PW.trim() === "") {
        delete processedData.PW;
      }
      processedData.SSN = editingMember.SSN;
      updateMemberMutation.mutate(processedData);
    } else {
      addMemberMutation.mutate(processedData);
    }
  };

  const validateForm = () => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(formData.EMAIL)) {
      toast.error("Please enter a valid email address");
      return false;
    }
    return true;
  };

  const handleEditClick = (member) => {
    setEditingMember(member);
    setFormData({ ...member, PW: "" });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      FNAME: "",
      LNAME: "",
      EMAIL: "",
      PW: "",
      DNO: "",
      PNO: "",
      STUEMP: "",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[600px] text-red-600">
        Error: {error.message}
      </div>
    );
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
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
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="p-6 space-y-6"
    >
      <Card className="backdrop-blur-sm bg-white/90 border-none shadow-xl">
        <CardHeader className="border-b border-gray-100 pb-6">
          <div className="flex items-center justify-between">
            <motion.div variants={itemVariants}>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Member Management
              </CardTitle>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Button
                onClick={() => {
                  setEditingMember(null);
                  resetForm();
                  setIsModalOpen(true);
                }}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Plus className="mr-2 h-4 w-4" /> Add Member
              </Button>
            </motion.div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <motion.div
            variants={itemVariants}
            className="flex items-center space-x-4 mb-6"
          >
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 transition-all duration-300"
              />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="member-table overflow-hidden rounded-lg border border-gray-200 bg-white">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold text-gray-600">ID</TableHead>
                  <TableHead className="font-semibold text-gray-600">Name</TableHead>
                  <TableHead className="font-semibold text-gray-600">Email</TableHead>
                  <TableHead className="font-semibold text-gray-600">Department</TableHead>
                  <TableHead className="font-semibold text-gray-600">Position</TableHead>
                  <TableHead className="font-semibold text-gray-600">Status</TableHead>
                  <TableHead className="font-semibold text-gray-600">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                <AnimatePresence mode="wait">
                  {paginatedMembers.map((member) => (
                    <motion.tr
                      key={member.SSN}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="hover:bg-gray-50/50 transition-colors duration-200"
                    >
                      <TableCell className="font-medium">{formatID(member.SSN)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">{member.FNAME}</span>
                          <span className="text-sm text-gray-500">{member.LNAME}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">{member.EMAIL}</TableCell>
                      <TableCell>{member.DNAME}</TableCell>
                      <TableCell>{member.PNAME}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                            statusStyles[member.STUEMP].bg
                          } ${statusStyles[member.STUEMP].text} ${
                            statusStyles[member.STUEMP].border
                          } border`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current mr-2"></span>
                          {statusMap[member.STUEMP]}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0 hover:bg-gray-100 transition-colors duration-200"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-32">
                            <DropdownMenuItem
                              onClick={() => handleEditClick(member)}
                              className="cursor-pointer"
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="border-t border-gray-200 px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                  <span className="font-medium">
                    {Math.min(startIndex + ITEMS_PER_PAGE, filteredMembers.length)}
                  </span>{" "}
                  of <span className="font-medium">{filteredMembers.length}</span>{" "}
                  results
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {[...Array(totalPages)].map((_, i) => (
                    <Button
                      key={i + 1}
                      variant={currentPage === i + 1 ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(i + 1)}
                      className={`h-8 w-8 p-0 ${
                        currentPage === i + 1
                          ? "bg-emerald-600 hover:bg-emerald-700"
                          : ""
                      }`}
                    >
                      {i + 1}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </CardContent>
      </Card>

      {/* Add/Edit Member Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">
                  {editingMember ? "Edit Member" : "Add New Member"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-1">
                    <Label htmlFor="FNAME">First Name</Label>
                    <Input
                      id="FNAME"
                      name="FNAME"
                      value={formData.FNAME}
                      onChange={handleChange}
                      className="mt-1"
                      required
                    />
                  </div>
                  <div className="col-span-1">
                    <Label htmlFor="LNAME">Last Name</Label>
                    <Input
                      id="LNAME"
                      name="LNAME"
                      value={formData.LNAME}
                      onChange={handleChange}
                      className="mt-1"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="EMAIL">Email</Label>
                  <Input
                    id="EMAIL"
                    name="EMAIL"
                    value={formData.EMAIL}
                    onChange={handleChange}
                    type="email"
                    className="mt-1"
                    required
                  />
                </div>

                {!editingMember && (
                  <div>
                    <Label htmlFor="PW">Password</Label>
                    <Input
                      id="PW"
                      name="PW"
                      value={formData.PW}
                      onChange={handleChange}
                      type="password"
                      className="mt-1"
                      required
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-1">
                    <Label htmlFor="DNO">Department</Label>
                    <Select
                      value={formData.DNO}
                      onValueChange={(value) =>
                        handleChange({ target: { name: "DNO", value } })
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem
                            key={dept.DNUMBER}
                            value={dept.DNUMBER.toString()}
                          >
                            {dept.DNAME}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-1">
                    <Label htmlFor="PNO">Position</Label>
                    <Select
                      value={formData.PNO}
                      onValueChange={(value) =>
                        handleChange({ target: { name: "PNO", value } })
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        {positions.map((pos) => (
                          <SelectItem
                            key={pos.PNUMBER}
                            value={pos.PNUMBER.toString()}
                          >
                            {pos.PNAME}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="STUEMP">Status</Label>
                  <Select
                    value={formData.STUEMP}
                    onValueChange={(value) =>
                      handleChange({ target: { name: "STUEMP", value } })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusEmps.map((status) => (
                        <SelectItem
                          key={status.STATUSEMPID}
                          value={status.STATUSEMPID.toString()}
                        >
                          {status.STATUSEMPNAME}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {editingMember ? "Update" : "Add"} Member
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MembersSection;
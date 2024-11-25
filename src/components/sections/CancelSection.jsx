import React, { useState } from "react";
import { toast } from "sonner";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import CancelModal from "../modals/CancelModal";
import { useCancellations } from "../../hooks/useCancellations";

const CancelSection = () => {
  const {
    cancellations,
    addCancellation,
    updateCancellation,
    deleteCancellation,
  } = useCancellations();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCancellation, setEditingCancellation] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [notifications, setNotifications] = useState([]);

  const handleAddCancellation = () => {
    setEditingCancellation(null);
    setIsModalOpen(true);
  };

  const handleEditCancellation = (cancellation) => {
    setEditingCancellation(cancellation);
    setIsModalOpen(true);
  };

  const handleDeleteCancellation = (id) => {
    if (window.confirm("คุณแน่ใจหรือไม่ที่จะลบรายการยกเลิกนี้?")) {
      deleteCancellation(id);
      addNotification("ลบรายการยกเลิกเรียบร้อยแล้ว");
    }
  };

  const handleSaveCancellation = (cancellationData) => {
    if (editingCancellation) {
      updateCancellation(cancellationData);
      addNotification("อัปเดตรายการยกเลิกเรียบร้อยแล้ว");
    } else {
      addCancellation(cancellationData);
      addNotification("เพิ่มรายการยกเลิกเรียบร้อยแล้ว");
    }
    setIsModalOpen(false);
  };

  const addNotification = (message) => {
    const newNotification = {
      id: Date.now(),
      message,
      timestamp: new Date().toLocaleString(),
    };
    setNotifications((prev) => [newNotification, ...prev]);
    toast.success(message);
  };

  const filteredCancellations = cancellations.filter((item) =>
    Object.values(item).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">จัดการการยกเลิก</CardTitle>
        <div className="flex items-center space-x-2">
          <Button onClick={handleAddCancellation} variant="outline">
            <Plus className="mr-2 h-4 w-4" /> เพิ่มการยกเลิก
          </Button>
          <div className="relative">
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                {notifications.length}
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 mb-4">
          <Search className="text-gray-400" />
          <Input
            type="text"
            placeholder="ค้นหาการยกเลิก..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow"
          />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>ชื่อผู้ใช้</TableHead>
              <TableHead>หมายเลขห้อง</TableHead>
              <TableHead>วันที่ยกเลิก</TableHead>
              <TableHead>เหตุผล</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead>การจัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCancellations.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.id}</TableCell>
                <TableCell>{item.username}</TableCell>
                <TableCell>{item.roomNumber}</TableCell>
                <TableCell>{item.cancelDate}</TableCell>
                <TableCell>{item.reason}</TableCell>
                <TableCell>{item.status}</TableCell>
                <TableCell>
                  <Button
                    onClick={() => handleEditCancellation(item)}
                    variant="outline"
                    size="sm"
                    className="mr-2"
                  >
                    <Edit className="h-4 w-4 mr-1" /> แก้ไข
                  </Button>
                  <Button
                    onClick={() => handleDeleteCancellation(item.id)}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> ลบ
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CancelModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCancellation}
        cancellation={editingCancellation}
      />
    </Card>
  );
};

export default CancelSection;

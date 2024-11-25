import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { toast } from "sonner";
import axios from "axios";
import { API_URL } from "@/config";
import { Check, X, Loader2, AlertCircle, Clock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingState } from "@/components/confirm/LoadingState";
import { ErrorState } from "@/components/confirm/ErrorState";
import { RoomDetails } from "@/components/confirm/RoomDetails";

const ConfirmPage = () => {
  // ดึงค่าจาก URL parameters (reserverId และ roomId)
  const { reserverId, roomId } = useParams();
  
  // ใช้ useNavigate เพื่อเปลี่ยนหน้าเมื่อมีการยืนยัน
  const navigate = useNavigate();

  // สร้าง state สำหรับการกำหนดสถานะการยืนยันห้อง, ข้อมูลห้อง, สถานะการโหลด, และข้อผิดพลาด
  const [confirming, setConfirming] = useState(false);
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    const checkRoomStatus = async () => {
      // ตรวจสอบว่ามี reserverId และ roomId หรือไม่
      if (!reserverId || !roomId) return;

      try {
        // เริ่มการโหลดข้อมูล
        setLoading(true);
        // ทำการเรียก API เพื่อดึงสถานะห้อง
        const response = await axios.get(
          `${API_URL}/room-status/${reserverId}/${roomId}`
        );
        // ถ้าข้อมูลกลับมาสำเร็จ
        if (response.data.success) {
          setRoomData(response.data); // ตั้งค่าข้อมูลห้อง
        } else {
          setError("ไม่พบข้อมูลการจอง");
          toast.error("ไม่พบข้อมูลการจอง");
        }
      } catch (error) {
        console.error("Error checking room status:", error);
        setError("ไม่สามารถตรวจสอบสถานะห้องได้");
        toast.error("ไม่สามารถตรวจสอบสถานะห้องได้");
      } finally {
        // หยุดการโหลดข้อมูล
        setLoading(false);
      }
    };

    // เรียกฟังก์ชันเพื่อตรวจสอบสถานะห้อง
    checkRoomStatus();
  }, [reserverId, roomId]); // เรียกใช้อีกครั้งเมื่อ reserverId หรือ roomId เปลี่ยนแปลง


  // ฟังก์ชันสำหรับการยืนยันการเข้าใช้ห้อง
  const handleConfirm = async () => {
    // ตรวจสอบว่ามีข้อมูลห้องและสามารถยืนยันได้หรือไม่
    if (!roomData || roomData.STUBOOKING !== 1) {
      toast.error("ไม่สามารถยืนยันการใช้ห้องได้");
      return;
    }

    const confirmationTime = new Date().toISOString(); // ตั้งค่าเวลายืนยันเป็น ISO string

    try {
      // เริ่มการยืนยัน
      setConfirming(true);
      // ทำการเรียก API เพื่อยืนยันการเข้าใช้ห้อง
      const response = await axios.post(
        `${API_URL}/confirm-usage/${reserverId}/${roomId}`,
        {
          // ส่งเวลายืนยันไปกับ request
          confirmationTime,
        }
      );

      if (response.data.success) { // ถ้าการยืนยันสำเร็จ
        toast.success("ยืนยันการเข้าใช้ห้องสำเร็จ");  // แสดงข้อความสำเร็จ
        setRoomData((prev) => ({ // อัปเดตสถานะของห้อง
          ...prev,
          STUBOOKING: 3, // เปลี่ยน STUBOOKING เป็น 3 (ใช้แล้ว)
          status: "used", // เปลี่ยนสถานะเป็น "used"
          confirmationTime, // ตั้งเวลายืนยัน
        }));
        setTimeout(() => navigate("/dashboard"), 2000); // นำทางไปยังหน้า dashboard หลังจาก 2 วินาที
      } else {
        toast.error(response.data.message || "เกิดข้อผิดพลาดในการยืนยัน");
      }
    } catch (error) {
      console.error("Error confirming room usage:", error);
      toast.error(
        error.response?.data?.message || "ไม่สามารถยืนยันการเข้าใช้ห้องได้"
      );
    } finally {
      setConfirming(false); // หยุดการยืนยัน
    }
  };

  // ถ้ากำลังโหลดข้อมูลให้แสดง LoadingState
  if (loading) return <LoadingState />;
   // ถ้ามีข้อผิดพลาดหรือไม่มีข้อมูลห้องให้แสดง ErrorState
  if (error || !roomData) return <ErrorState error={error} />;

  // ฟังก์ชันเพื่อรับข้อมูลสถานะตามค่า STUBOOKING
  const getStatusInfo = (stubooking) => {
    switch (stubooking) {
      case 1: // สถานะรอการยืนยัน
        return {
          icon: <AlertCircle className="h-8 w-8 text-blue-500 animate-pulse" />,
          title: "ยืนยันการเข้าใช้ห้อง",
          message: "กรุณากดปุ่มด้านล่างเพื่อยืนยันการเข้าใช้ห้อง",
          alertVariant: "default",
          alertBg: "bg-blue-50 border-blue-200",
          canConfirm: true,
        };
      case 2: // ไม่มีการเข้าใช้ห้อง
        return {
          icon: <X className="h-8 w-8 text-red-500" />,
          title: "ไม่มีการเข้าใช้ห้อง",
          message: "ไม่พบการเข้าใช้งานห้องตามเวลาที่กำหนด",
          alertVariant: "destructive",
          alertBg: "bg-red-50 border-red-200",
          canConfirm: false,
        };
      case 3: // เข้าใช้งานแล้ว
        return {
          icon: <Check className="h-8 w-8 text-green-500" />,
          title: "เข้าใช้งานแล้ว",
          message: "ห้องนี้ได้ถูกยืนยันการใช้งานไปแล้ว",
          alertVariant: "default",
          alertBg: "bg-green-50 border-green-200",
          canConfirm: false,
        };
      case 4: // รออนุมัติ
        return {
          icon: <Clock className="h-8 w-8 text-yellow-500 animate-pulse" />,
          title: "รออนุมัติ",
          message: "การจองนี้กำลังรอการอนุมัติ",
          alertVariant: "warning",
          alertBg: "bg-yellow-50 border-yellow-200",
          canConfirm: false,
        };
      case 5: // ยกเลิกการจอง
        return {
          icon: <X className="h-8 w-8 text-gray-500" />,
          title: "ยกเลิกการจอง",
          message: "การจองนี้ถูกยกเลิกไปแล้ว",
          alertVariant: "default",
          alertBg: "bg-gray-50 border-gray-200",
          canConfirm: false,
        };
      default:
        return {
          icon: <AlertCircle className="h-8 w-8 text-gray-500" />,
          title: "ไม่ทราบสถานะ",
          message: "ไม่สามารถระบุสถานะของการจองได้",
          alertVariant: "default",
          alertBg: "bg-gray-50 border-gray-200",
          canConfirm: false,
        };
    }
  };

  const statusInfo = getStatusInfo(roomData.STUBOOKING); // เรียกใช้งานฟังก์ชัน getStatusInfo เพื่อรับข้อมูลสถานะห้อง

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[conic-gradient(at_top,_var(--tw-gradient-stops))] from-gray-900 via-gray-100 to-gray-900">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-0 shadow-lg relative overflow-hidden">
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center gap-3 text-2xl">
            {statusInfo.icon}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
              {statusInfo.title}
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <RoomDetails roomData={roomData} />
          <Alert
            className={statusInfo.alertBg}
            variant={statusInfo.alertVariant}
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{statusInfo.message}</AlertDescription>
          </Alert>
        </CardContent>

        <CardFooter>
          {statusInfo.canConfirm ? (
            <Button
              className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
              onClick={handleConfirm}
              disabled={confirming}
            >
              {confirming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังยืนยัน...
                </>
              ) : (
                "ยืนยันการเข้าใช้ห้อง"
              )}
            </Button>
          ) : (
            <Button
              className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => navigate("/dashboard")}
            >
              กลับหน้าหลัก
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default ConfirmPage;
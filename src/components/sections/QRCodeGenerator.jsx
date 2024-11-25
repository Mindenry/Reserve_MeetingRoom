import React from "react";
import { QRCodeSVG } from "qrcode.react";

// สร้างคอมโพเนนต์ QRCodeGenerator ที่รับ props bookingData
const QRCodeGenerator = ({ bookingData }) => {
  // เช็คว่า bookingData มีข้อมูลหรือไม่ หากไม่มีให้คืนค่า null
  if (!bookingData) return null;

  // สร้างข้อมูลสำหรับ QR Code โดยการแปลงข้อมูล bookingData เป็น JSON String
  const qrCodeData = JSON.stringify({
    reserverId: bookingData.RESERVERID, // ID ผู้จองห้อง
    roomCode: bookingData.CFRNUM, // รหัสห้อง
    date: bookingData.BDATE, // วันที่จอง
    startTime: bookingData.STARTTIME, // เวลาที่เริ่ม
    endTime: bookingData.ENDTIME, // เวลาที่สิ้นสุด
  });

  return (
    <div className="mt-6 text-center">
      <h3 className="text-lg font-semibold mb-2">QR Code สำหรับการจอง</h3>
      <div className="inline-block p-4 bg-white rounded-lg shadow-md">
        <QRCodeSVG value={qrCodeData} size={200} />
      </div>
      <p className="mt-2 text-sm text-gray-600">
        สแกน QR Code นี้เพื่อเข้าใช้ห้องประชุม
      </p>
    </div>
  );
};

export default QRCodeGenerator;

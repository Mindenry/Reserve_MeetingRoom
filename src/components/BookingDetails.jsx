import React from "react";
import { format } from "date-fns";

export const BookingDetails = ({ booking }) => {
  return (
    <div className="flex-1 space-y-4">
      <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-100/50">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">รายละเอียดการจอง</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">รหัสการจอง:</span>
            <span className="font-medium">{booking.RESERVERID}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">ห้อง:</span>
            <span className="font-medium">{booking.CFRNAME}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">วันที่:</span>
            <span className="font-medium">
              {format(new Date(booking.BDATE), "dd/MM/yyyy")}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">เวลา:</span>
            <span className="font-medium">
              {format(new Date(booking.STARTTIME), "HH:mm")} -{" "}
              {format(new Date(booking.ENDTIME), "HH:mm")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
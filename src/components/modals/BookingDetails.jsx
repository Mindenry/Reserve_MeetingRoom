import React from "react";
import { format } from "date-fns";
import { Calendar, Clock, MapPin } from "lucide-react";

export const BookingDetails = ({ booking }) => {
  return (
    <div className="flex-1">
      <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100/50 hover:shadow-xl transition-all duration-300 space-y-5 transform hover:scale-[1.01]">
        <div className="flex items-center space-x-4 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100/50 transition-colors hover:from-blue-100 hover:to-blue-200/50">
          <div className="p-2.5 bg-blue-500/10 rounded-lg shadow-inner">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-600/70">วันที่</p>
            <p className="font-semibold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              {format(new Date(booking.BDATE), "dd/MM/yyyy")}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4 p-3 rounded-xl bg-gradient-to-r from-purple-50 to-purple-100/50 transition-colors hover:from-purple-100 hover:to-purple-200/50">
          <div className="p-2.5 bg-purple-500/10 rounded-lg shadow-inner">
            <Clock className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-purple-600/70">เวลา</p>
            <p className="font-semibold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
              {format(new Date(booking.STARTTIME), "HH:mm")} -{" "}
              {format(new Date(booking.ENDTIME), "HH:mm")} น.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4 p-3 rounded-xl bg-gradient-to-r from-pink-50 to-pink-100/50 transition-colors hover:from-pink-100 hover:to-pink-200/50">
          <div className="p-2.5 bg-pink-500/10 rounded-lg shadow-inner">
            <MapPin className="w-5 h-5 text-pink-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-pink-600/70">ห้องประชุม</p>
            <p className="font-semibold bg-gradient-to-r from-pink-600 to-pink-800 bg-clip-text text-transparent">
              {booking.CFRNAME}
            </p>
          </div>
        </div>

        <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100/80 border border-gray-200/50 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
          <p className="text-sm font-medium text-gray-500">รหัสการจอง</p>
          <p className="text-xl font-mono font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            {booking.RESERVERID}
          </p>
        </div>
      </div>
    </div>
  );
};
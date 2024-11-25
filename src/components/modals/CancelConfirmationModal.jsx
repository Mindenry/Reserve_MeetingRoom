import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { AlertTriangle, Calendar, Clock, MapPin, X } from "lucide-react";

const CancelConfirmationModal = ({ isOpen, onClose, onConfirm, booking }) => {
  if (!booking) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-xl bg-gradient-to-b from-gray-50 to-white/95 backdrop-blur-sm border-0 shadow-[0_0_1.5rem_rgba(0,0,0,0.1)] animate-in slide-in-from-bottom-4">
        <div className="absolute top-4 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full opacity-90" />
        
        <AlertDialogHeader className="pt-6 space-y-6">
          <div className="flex items-center justify-center">
            <AlertDialogTitle className="text-2xl font-bold text-center flex items-center">
              <div className="relative w-8 h-8 -mr-12">
                <div className="absolute inset-0 bg-purple-500/20 blur-lg rounded-full animate-pulse" />
                <AlertTriangle className="w-8 h-8 text-purple-500 animate-bounce relative z-10" />
              </div>
              <span className="text-gray-900 ml-16 relative">
                ยืนยันการยกเลิกการจอง
                <span className="absolute -top-1 -right-3 w-2 h-2 bg-blue-400 rounded-full animate-ping" />
              </span>
            </AlertDialogTitle>
          </div>

          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-lg border border-gray-100/50 space-y-4">
                <div className="flex items-center space-x-4 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100/50 hover:from-blue-100 hover:to-blue-200/50 transform hover:scale-[1.02] transition-all duration-300 hover:shadow-md">
                  <div className="p-2.5 bg-blue-500/10 rounded-lg">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-blue-600/70">ห้องประชุม</div>
                    <div className="font-semibold text-blue-900">
                      ชื่อห้อง {booking.CFRNAME}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-3 rounded-xl bg-gradient-to-r from-purple-50 to-purple-100/50 hover:from-purple-100 hover:to-purple-200/50 transform hover:scale-[1.02] transition-all duration-300 hover:shadow-md">
                  <div className="p-2.5 bg-purple-500/10 rounded-lg">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-purple-600/70">วันที่</div>
                    <div className="font-semibold text-purple-900">
                      {format(new Date(booking.BDATE), "dd/MM/yyyy")}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-3 rounded-xl bg-gradient-to-r from-pink-50 to-pink-100/50 hover:from-pink-100 hover:to-pink-200/50 transform hover:scale-[1.02] transition-all duration-300 hover:shadow-md">
                  <div className="p-2.5 bg-pink-500/10 rounded-lg">
                    <Clock className="w-5 h-5 text-pink-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-pink-600/70">เวลา</div>
                    <div className="font-semibold text-pink-900">
                      {format(new Date(booking.STARTTIME), "HH:mm")} -{" "}
                      {format(new Date(booking.ENDTIME), "HH:mm")} น.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="sm:space-x-4">
          <AlertDialogCancel 
            className="relative group px-8 hover:bg-gray-100/80"
            onClick={onClose}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-gray-200/50 to-gray-100/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md blur" />
            <X className="w-4 h-4 mr-2" />
            ยกเลิก
          </AlertDialogCancel>
          
          <AlertDialogAction
            onClick={onConfirm}
            className="relative group px-8 border-0 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 hover:from-blue-600 hover:via-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-blue-400 to-pink-400 opacity-0 group-hover:opacity-30 transition-opacity rounded-md blur" />
            <AlertTriangle className="w-4 h-4 mr-2" />
            ยืนยันการยกเลิก
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CancelConfirmationModal;
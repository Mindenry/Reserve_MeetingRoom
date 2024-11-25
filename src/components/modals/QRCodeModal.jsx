import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QRCodeDisplay } from "./QRCodeDisplay";
import { BookingDetails } from "./BookingDetails";
import { QrCode } from "lucide-react";

const QRCodeModal = ({ isOpen, onClose, booking }) => {
  if (!booking) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl bg-gradient-to-b from-gray-50 to-white/95 backdrop-blur-sm border-0 shadow-[0_0_1.5rem_rgba(0,0,0,0.1)] animate-in slide-in-from-bottom-4">
        <DialogHeader className="relative pt-6">
          <div className="absolute top-4 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full opacity-90" />
          <DialogTitle className="text-2xl font-bold text-center">
            <div className="relative inline-flex items-center">
              <QrCode className="w-7 h-7 mr-3 animate-pulse text-purple-600" />
              <span className="relative text-black-800 dark:text-black-300">
                QR Code สำหรับการจอง
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full animate-ping" />
              </span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col md:flex-row gap-8 p-6">
          <QRCodeDisplay booking={booking} />
          <BookingDetails booking={booking} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeModal;
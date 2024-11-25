import React, { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Scan, Sparkles } from "lucide-react";
import { CLIENT_URL } from "@/config";
import { QRCodeActions } from "./QRCodeActions";

export const QRCodeDisplay = ({ booking }) => {
  const qrRef = useRef(null);
  const confirmationUrl = `${CLIENT_URL}/confirm/${booking.RESERVERID}/${booking.CFRNUM}`;

  return (
    <div className="flex-1 flex flex-col items-center space-y-6">
      <div ref={qrRef} className="group relative cursor-pointer">
        <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl opacity-25 blur-xl transition-all duration-500 group-hover:opacity-40 group-hover:blur-2xl animate-pulse" />
        <div className="relative p-6 bg-white rounded-2xl shadow-lg border border-gray-100/50 backdrop-blur-sm transform transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-xl">
          <QRCodeSVG
            value={confirmationUrl}
            size={200}
            level="H"
            includeMargin={true}
            className="rounded-lg"
          />
          <Scan className="absolute -bottom-3 -right-3 w-8 h-8 text-purple-500 animate-pulse" />
          <Sparkles className="absolute -top-3 -left-3 w-8 h-8 text-blue-500 animate-pulse" />
        </div>
      </div>
      <QRCodeActions qrRef={qrRef} booking={booking} qrContent={confirmationUrl} />
      <div className="text-sm text-gray-500 text-center mt-2">
        <p>URL: {confirmationUrl}</p>
      </div>
    </div>
  );
};
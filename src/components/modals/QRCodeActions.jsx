import React from "react";
import { Button } from "@/components/ui/button";
import { Download, Share2 } from "lucide-react";
import { toast } from "sonner";

export const QRCodeActions = ({ qrRef, booking, qrContent }) => {
  const handleDownload = () => {
    const svgElement = qrRef.current?.querySelector('svg');
    if (!svgElement) {
      toast.error("ไม่สามารถดาวน์โหลด QR Code ได้");
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const data = (new XMLSerializer()).serializeToString(svgElement);
    const DOMURL = window.URL || window.webkitURL || window;
    const svgBlob = new Blob([data], {type: 'image/svg+xml;charset=utf-8'});
    const url = DOMURL.createObjectURL(svgBlob);
    const img = new Image();

    img.onload = function () {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      DOMURL.revokeObjectURL(url);

      const imgURI = canvas
        .toDataURL('image/png')
        .replace('image/png', 'image/octet-stream');

      const link = document.createElement('a');
      link.download = `booking-${booking.RESERVERID}.png`;
      link.href = imgURI;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("ดาวน์โหลด QR Code สำเร็จ");
    };

    img.src = url;
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "ยืนยันการเข้าใช้ห้อง",
          text: `กรุณายืนยันการเข้าใช้ห้อง ${booking.CFRNAME}`,
          url: qrContent
        });
        toast.success("แชร์ลิงก์สำเร็จ");
      } else {
        await navigator.clipboard.writeText(qrContent);
        toast.success("คัดลอกลิงก์แล้ว");
      }
    } catch (error) {
      console.error("Error sharing:", error);
      toast.error("ไม่สามารถแชร์ QR Code ได้");
    }
  };

  return (
    <div className="flex gap-4 w-full">
      <Button
        onClick={handleDownload}
        className="flex-1 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 hover:scale-105"
      >
        <Download className="w-4 h-4 mr-2" />
        ดาวน์โหลด
      </Button>
      <Button
        onClick={handleShare}
        className="flex-1 bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 hover:from-purple-700 hover:via-purple-800 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 hover:scale-105"
      >
        <Share2 className="w-4 h-4 mr-2" />
        แชร์
      </Button>
    </div>
  );
};
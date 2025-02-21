import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Receipt, Printer, X, Building2, CalendarDays, Clock, CheckCircle, MapPin, User, Shield } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext'; // Add this import

const ReceiptDialog = ({ isOpen, onClose, booking }) => {
  const { user } = useAuth(); // Add this to get user data
  
  if (!booking) return null;

  const handlePrint = () => {
    // Create a new iframe
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    // Get the receipt content
    const receiptContent = document.querySelector('.receipt-content').cloneNode(true);
    
    // Write the receipt content to the iframe
    iframe.contentDocument.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>ใบเสร็จการจองห้อง - MUT Room Booking</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap');
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Prompt', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              color: #333;
              background-color: #fff;
              height: 100vh;
              display: flex;
              justify-content: center;
              align-items: center;
              padding: 0;
            }
            
            .receipt-container {
              width: 100%;
              height: 100vh;
              max-width: 800px;
              margin: 0 auto;
              padding: 40px;
              position: relative;
              background: linear-gradient(135deg, #f5f7ff 0%, #ffffff 100%);
            }
            
            .watermark {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              font-size: 120px;
              color: rgba(26, 35, 126, 0.03);
              font-weight: bold;
              z-index: 0;
              white-space: nowrap;
            }
            
            .border-pattern {
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 8px;
              background: linear-gradient(90deg, #1a237e, #3949ab, #1a237e);
              border-top-left-radius: 4px;
              border-top-right-radius: 4px;
            }
            
            .receipt-header {
              position: relative;
              z-index: 1;
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 1px solid rgba(26, 35, 126, 0.2);
            }
            
            .logo-container {
              display: flex;
              align-items: center;
              gap: 10px;
            }
            
            .logo {
              width: 48px;
              height: 48px;
              border-radius: 8px;
              background-color: #1a237e;
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            
            .receipt-info {
              text-align: right;
            }
            
            .title-section {
              text-align: center;
              position: relative;
              z-index: 1;
              margin-bottom: 40px;
            }
            
            .receipt-title {
              font-size: 28px;
              font-weight: bold;
              color: #1a237e;
              margin-bottom: 5px;
            }
            
            .receipt-subtitle {
              font-size: 16px;
              color: #5c6bc0;
            }
            
            .receipt-number-section {
              display: flex;
              justify-content: space-between;
              margin-bottom: 40px;
              padding: 15px 20px;
              background: rgba(236, 239, 255, 0.7);
              border-radius: 8px;
              border-left: 4px solid #1a237e;
              position: relative;
              z-index: 1;
            }
            
            .number-label {
              font-size: 14px;
              color: #7986cb;
              margin-bottom: 5px;
            }
            
            .number-value {
              font-size: 24px;
              font-weight: bold;
              color: #1a237e;
            }
            
            .receipt-details {
              background-color: white;
              border-radius: 12px;
              padding: 25px;
              margin-bottom: 40px;
              box-shadow: 0 4px 12px rgba(26, 35, 126, 0.05);
              position: relative;
              z-index: 1;
            }
            
            .details-header {
              display: flex;
              align-items: center;
              gap: 10px;
              color: #1a237e;
              font-weight: 600;
              font-size: 18px;
              margin-bottom: 20px;
              padding-bottom: 15px;
              border-bottom: 1px dashed #e3e8ff;
            }
            
            .detail-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 15px;
              padding-bottom: 15px;
              border-bottom: 1px solid #f5f7ff;
            }
            
            .detail-row:last-child {
              border-bottom: none;
              margin-bottom: 0;
              padding-bottom: 0;
            }
            
            .detail-label {
              color: #5c6bc0;
              display: flex;
              align-items: center;
              gap: 8px;
              font-weight: 500;
            }
            
            .detail-value {
              font-weight: 600;
              color: #333;
              font-size: 16px;
            }
            
            .verification-section {
              background-color: rgba(236, 239, 255, 0.7);
              border-radius: 12px;
              padding: 15px 25px;
              margin-bottom: 40px;
              position: relative;
              z-index: 1;
              display: flex;
              align-items: center;
              gap: 15px;
            }
            
            .verification-icon {
              background-color: #e8f5e9;
              width: 40px;
              height: 40px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #43a047;
            }
            
            .verification-text strong {
              color: #1a237e;
              display: block;
              margin-bottom: 3px;
            }
            
            .verification-text span {
              font-size: 14px;
              color: #5c6bc0;
            }
            
            .signatures {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 40px;
              position: relative;
              z-index: 1;
            }
            
            .signature-line {
              text-align: center;
            }
            
            .signature-space {
              height: 80px;
              margin-bottom: 15px;
              position: relative;
            }
            
            .signature-placeholder {
              position: absolute;
              bottom: 15px;
              left: 0;
              right: 0;
              text-align: center;
              font-style: italic;
              color: #c5cae9;
              font-size: 13px;
            }
            
            .signature-title {
              margin-top: 10px;
              padding-top: 10px;
              border-top: 1px solid #e8eaf6;
              color: #5c6bc0;
              font-size: 14px;
              font-weight: 500;
            }
            
            .receipt-footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid rgba(26, 35, 126, 0.1);
              display: flex;
              justify-content: space-between;
              align-items: center;
              position: relative;
              z-index: 1;
            }
            
            .footer-left {
              font-size: 13px;
              color: #7986cb;
              display: flex;
              align-items: center;
              gap: 6px;
            }
            
            .qr-placeholder {
              width: 70px;
              height: 70px;
              background-color: white;
              border: 1px solid #e3e8ff;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 8px;
              color: #c5cae9;
              text-align: center;
            }

            .room-indicators {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 15px;
              margin: 30px 0;
            }
            
            .indicator {
              background-color: white;
              border-radius: 8px;
              padding: 10px 15px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              flex: 1;
              text-align: center;
              box-shadow: 0 2px 8px rgba(26, 35, 126, 0.07);
            }
            
            .indicator-label {
              font-size: 12px;
              color: #7986cb;
              margin-bottom: 5px;
            }
            
            .indicator-value {
              font-weight: 600;
              color: #1a237e;
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div class="border-pattern"></div>
            <div class="watermark">MUT RECEIPT</div>
            
            <!-- Header with Logo -->
            <div class="receipt-header">
              <div class="logo-container">
                <div class="logo">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <path d="M2 15h10"></path>
                    <path d="M9 18l3-3-3-3"></path>
                  </svg>
                </div>
                <div>
                  <h3 style="font-weight: 600; color: #1a237e;">MUT Reserve</h3>
                  <p style="font-size: 12px; color: #7986cb;">ระบบจองห้องประชุม</p>
                </div>
              </div>
              
              <div class="receipt-info">
                <p style="font-size: 12px; color: #7986cb;">Reference ID</p>
                <p style="font-weight: 600; color: #1a237e; letter-spacing: 1px;">REC-${format(new Date(), "yyyyMMdd")}-${booking.RESERVERID}</p>
              </div>
            </div>
            
            <!-- Title Section -->
            <div class="title-section">
              <h1 class="receipt-title">ใบเสร็จการจองห้อง</h1>
              <p class="receipt-subtitle">Room Booking Receipt</p>
            </div>
            
            <!-- Receipt Number Section -->
            <div class="receipt-number-section">
              <div>
                <p class="number-label">เลขที่ใบเสร็จ</p>
                <p class="number-value">${booking.RESERVERID || '847870'}</p>
              </div>
              <div style="text-align: right;">
                <p class="number-label">วันที่</p>
                <p class="number-value" style="font-size: 20px;">${formatDate(booking.BDATE) || '27 Feb 2025'}</p>
              </div>
            </div>
            
            <!-- Room Details Section -->
            <div class="receipt-details">
              <div class="details-header">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                  <line x1="8" y1="21" x2="16" y2="21"></line>
                  <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
                รายละเอียดห้อง
              </div>
              
              <div class="detail-row">
                <div class="detail-label">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                  ห้อง
                </div>
                <div class="detail-value">${booking.CFRNAME || 'A104'}</div>
              </div>
              
              <div class="detail-row">
                <div class="detail-label">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  วันที่จอง
                </div>
                <div class="detail-value">${formatDate(booking.BDATE) || '27 Feb 2025'}</div>
              </div>
              
              <div class="detail-row">
                <div class="detail-label">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  เวลา
                </div>
                <div class="detail-value">${formatTime(booking.STARTTIME)} - ${formatTime(booking.ENDTIME) || '15:00 - 19:00'}</div>
              </div>

              <div class="detail-row">
                <div class="detail-label">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  ผู้จอง
                </div>
                <div class="detail-value">${booking.USERNAME || 'รศ.ดร.ธนพล ลิมปวัธน์'}</div>
              </div>

              <div class="detail-row">
                <div class="detail-label">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                  สถานะ
                </div>
                <div class="detail-value" style="color: #43a047; display: flex; align-items: center; gap: 5px;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #43a047;">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  ยืนยันแล้ว
                </div>
              </div>
            </div>

            <!-- Room Indicators -->
            <div class="room-indicators">
              <div class="indicator">
                <div class="indicator-label">ความจุห้อง</div>
                <div class="indicator-value">30 คน</div>
              </div>
              <div class="indicator">
                <div class="indicator-label">ประเภทห้อง</div>
                <div class="indicator-value">ห้องประชุม</div>
              </div>
              <div class="indicator">
                <div class="indicator-label">อาคาร</div>
                <div class="indicator-value">อาคาร A</div>
              </div>
              <div class="indicator">
                <div class="indicator-label">ชั้น</div>
                <div class="indicator-value">1</div>
              </div>
            </div>
            
            <!-- Verification Section -->
            <div class="verification-section">
              <div class="verification-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <div class="verification-text">
                <strong>ยืนยันการจองเรียบร้อยแล้ว</strong>
                <span>กรุณานำใบเสร็จนี้มาแสดงต่อเจ้าหน้าที่ในวันที่เข้าใช้งาน</span>
              </div>
            </div>
            
            <!-- Signatures Section -->
            <div class="signatures">
              <div class="signature-line">
                <div class="signature-space">
                  <div class="signature-placeholder">ลงชื่อผู้จองที่นี่</div>
                </div>
                <div class="signature-title">ลายเซ็นผู้จอง</div>
              </div>
              <div class="signature-line">
                <div class="signature-space">
                  <div class="signature-placeholder">ลงชื่อผู้อนุมัติที่นี่</div>
                </div>
                <div class="signature-title">ผู้อนุมัติ</div>
              </div>
            </div>
            
            <!-- Footer -->
            <div class="receipt-footer">
              <div class="footer-left">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <path d="M2 15h10"></path>
                  <path d="M9 18l3-3-3-3"></path>
                </svg>
                ออกเมื่อ: ${format(new Date(), "dd MMM yyyy HH:mm")}
              </div>
              <div class="qr-placeholder">
                QR Code<br>สำหรับการตรวจสอบ
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    
    // Print and remove the iframe afterward
    iframe.contentWindow.onload = function() {
      setTimeout(() => {
        iframe.contentWindow.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 500);
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), "dd MMM yyyy");
    } catch (error) {
      console.error("Error formatting date:", error);
      return '-';
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '-';
    try {
      const time = new Date(timeString);
      return format(time, "HH:mm");
    } catch (error) {
      console.error("Error formatting time:", error);
      return '-';
    }
  };

  // Get user's full name
  const userFullName = user ? `${user.firstName} ${user.lastName}` : '-';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[600px] p-0 overflow-hidden bg-white print:shadow-none dialog-content">
        <DialogHeader className="p-6 bg-[#1a237e] text-white print:bg-white print:text-[#1a237e]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg print:bg-[#1a237e]/10">
                <Receipt className="h-6 w-6" />
              </div>
              <DialogTitle className="text-xl font-semibold">ใบเสร็จการจองห้อง</DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10 print:hidden"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="receipt-content p-8 space-y-8">
          {/* Receipt Header */}
          <div className="text-center space-y-2 border-b border-dashed pb-4">
            <h2 className="text-2xl font-bold text-[#1a237e]">
              ใบเสร็จการจองห้อง
            </h2>
            <p className="text-gray-600">Room Booking Receipt</p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Receipt Number */}
            <div className="flex justify-between items-center border-b border-dashed pb-4">
              <div>
                <h3 className="text-sm text-gray-500">เลขที่ใบเสร็จ</h3>
                <p className="text-xl font-bold text-[#1a237e]">{booking.RESERVERID || '847870'}</p>
              </div>
              <div className="text-right">
                <h3 className="text-sm text-gray-500">วันที่</h3>
                <p className="text-lg text-gray-900">{formatDate(booking.BDATE) || '27 Feb 2025'}</p>
              </div>
            </div>

            {/* Room Details */}
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-2 text-[#1a237e]">
                <Building2 className="h-5 w-5" />
                <h3 className="font-semibold">รายละเอียดห้อง</h3>
              </div>
              
              <div className="grid gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">ห้อง</span>
                  <span className="font-semibold text-lg">{booking.CFRNAME || 'A104'}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">วันที่จอง</span>
                  </div>
                  <span className="font-medium">{formatDate(booking.BDATE) || '27 Feb 2025'}</span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">เวลา</span>
                  </div>
                  <span className="font-medium">{`${formatTime(booking.STARTTIME)} - ${formatTime(booking.ENDTIME)}`  || '15:00 - 19:00'}</span>
                </div>

                <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">ผู้จอง</span>
          </div>
          <span className="font-medium">{userFullName}</span>
        </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">สถานะ</span>
                  </div>
                  <span className="font-medium text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    ยืนยันแล้ว
                  </span>
                </div>
              </div>
            </div>

            {/* Signature Section */}
            <div className="grid grid-cols-2 gap-8 pt-8">
              <div className="text-center space-y-8">
                <div className="h-[60px]"></div>
                <div className="border-t border-gray-300 pt-2">
                  <p className="text-gray-500">ลายเซ็นผู้จอง</p>
                </div>
              </div>
              <div className="text-center space-y-8">
                <div className="h-[60px]"></div>
                <div className="border-t border-gray-300 pt-2">
                  <p className="text-gray-500">ผู้อนุมัติ</p>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Footer - Only visible in main view, not in print */}
          <div className="text-center text-xs text-gray-500 mt-6">
            ออกเมื่อ: {format(new Date(), "dd MMM yyyy HH:mm")}
          </div>
        </div>

        <div className="flex justify-center items-center px-6 py-4 bg-gray-50 border-t print:hidden">
          <Button
            onClick={handlePrint}
            className="bg-[#1a237e] hover:bg-[#283593] text-white gap-2"
          >
            <Printer className="h-4 w-4" />
            พิมพ์ใบเสร็จ
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptDialog;
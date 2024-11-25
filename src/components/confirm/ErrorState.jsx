import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export const ErrorState = ({ error }) => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[conic-gradient(at_top,_var(--tw-gradient-stops))] from-gray-900 via-gray-100 to-gray-900">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {error || "ไม่พบข้อมูลการจอง"}
          </h2>
          <p className="text-gray-600 mb-6">กรุณาตรวจสอบข้อมูลการจองของท่านอีกครั้ง</p>
          <Button
            className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800"
            onClick={() => navigate('/')}
          >
            กลับหน้าหลัก
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
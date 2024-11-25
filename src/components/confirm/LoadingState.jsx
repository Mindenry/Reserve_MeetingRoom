import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export const LoadingState = () => (
  <div className="min-h-screen flex items-center justify-center p-4 bg-[conic-gradient(at_top,_var(--tw-gradient-stops))] from-gray-900 via-gray-100 to-gray-900">
    <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardContent className="flex flex-col items-center justify-center p-8">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
          <div className="absolute inset-0 h-12 w-12 animate-ping bg-purple-400 rounded-full opacity-20" />
        </div>
        <p className="text-gray-600 mt-4 font-medium">กำลังตรวจสอบสถานะห้อง...</p>
      </CardContent>
    </Card>
  </div>
);
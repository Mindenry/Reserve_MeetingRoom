import React from 'react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { DoorClosed, Calendar, Clock } from "lucide-react";

export const RoomDetails = ({ roomData }) => (
  <div className="bg-gray-50/50 rounded-xl p-4 backdrop-blur-sm border border-gray-100">
    <div className="flex items-center gap-3 mb-3">
      <DoorClosed className="h-5 w-5 text-purple-600" />
      <h3 className="font-semibold text-gray-800">{roomData.CFRNAME}</h3>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-gray-500" />
        <span className="text-sm text-gray-600">
          {format(new Date(roomData.BDATE), 'dd MMMM yyyy', { locale: th })}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-gray-500" />
        <span className="text-sm text-gray-600">
          {format(new Date(roomData.STARTTIME), 'HH:mm')} - {format(new Date(roomData.ENDTIME), 'HH:mm')}
        </span>
      </div>
    </div>
  </div>
);
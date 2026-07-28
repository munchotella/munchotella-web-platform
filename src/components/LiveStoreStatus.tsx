"use client";

import React, { useState, useEffect } from "react";
import { Clock, CheckCircle2, AlertCircle } from "lucide-react";

export default function LiveStoreStatus({ isDarkBackground = true }: { isDarkBackground?: boolean }) {
  const [status, setStatus] = useState<{ isOpen: boolean; message: string }>({
    isOpen: true,
    message: "Deschis Acum • Preluăm comenzi",
  });

  useEffect(() => {
    const checkStatus = () => {
      const now = new Date();
      const day = now.getDay(); // 0: Sun, 1: Mon, ..., 3: Wed, ..., 6: Sat
      const hours = now.getHours();

      // Wednesday closed
      if (day === 3) {
        setStatus({
          isOpen: false,
          message: "Închis Miercuri • Deschidem Joi la 16:00",
        });
        return;
      }

      // Working hours: 16:00 to 24:00 (00:00)
      if (hours >= 16 && hours < 24) {
        setStatus({
          isOpen: true,
          message: "Deschis Acum • Preluăm comenzi",
        });
      } else {
        const openMsg = hours < 16 ? "Deschidem azi la 16:00" : "Deschidem mâine la 16:00";
        setStatus({
          isOpen: false,
          message: `Închis Momentan • ${openMsg}`,
        });
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <div
        className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider transition-colors
          ${status.isOpen 
          ? `bg-[#D4A853]/10 border-[#D4A853]/30 ${isDarkBackground ? "text-[#FCF9F4]" : "text-[#D4A853]"}` 
          : `bg-[#9B8C7E]/10 border-[#9B8C7E]/30 ${isDarkBackground ? "text-[#FCF9F4]" : "text-[#9B8C7E]"}`
        }`}
      >
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            status.isOpen ? "bg-[#D4A853]" : "bg-[#9B8C7E]"
          }`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${
            status.isOpen ? "bg-[#D4A853]" : "bg-[#9B8C7E]"
          }`}></span>
        </span>
      <span>{status.message}</span>
    </div>
  );
}

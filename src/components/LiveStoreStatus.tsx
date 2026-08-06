"use client";

import React, { useState, useEffect } from "react";
import { Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";

export default function LiveStoreStatus({ isDarkBackground = true }: { isDarkBackground?: boolean }) {
  const t = useTranslations("LiveStore");
  const [status, setStatus] = useState<{ isOpen: boolean; key: string; openMsgKey?: string }>({
    isOpen: true,
    key: 'openNow',
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkStatus = () => {
      const now = new Date();
      const day = now.getDay(); // 0: Sun, 1: Mon, ..., 3: Wed, ..., 6: Sat
      const hours = now.getHours();

      if (day === 3) {
        setStatus({
          isOpen: false,
          key: 'closedWednesday',
        });
        return;
      }

      if (hours >= 16 && hours < 24) {
        setStatus({
          isOpen: true,
          key: 'openNow',
        });
      } else {
        setStatus({
          isOpen: false,
          key: 'closedCurrently',
          openMsgKey: hours < 16 ? 'openToday' : 'openTomorrow',
        });
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

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
      <span>
        {t(status.key)} {status.openMsgKey ? t(status.openMsgKey as any) : ""}
      </span>
    </div>
  );
}

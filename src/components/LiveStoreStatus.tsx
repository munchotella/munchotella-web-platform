"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

interface StoreStatusResponse {
  isOpen: boolean;
  isHoliday?: boolean;
  holidayName?: string;
  isEmergencyClosed?: boolean;
  badgeKey?: string;
  statusText?: string;
  detailText?: string;
  nextOpening?: {
    date: string;
    time: string;
    label: string;
  } | null;
}

export default function LiveStoreStatus({ isDarkBackground = true }: { isDarkBackground?: boolean }) {
  const t = useTranslations("LiveStore");
  const [status, setStatus] = useState<StoreStatusResponse>({
    isOpen: true,
    badgeKey: 'openNow',
    statusText: 'Deschis Acum',
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const fetchLiveStatus = async () => {
      try {
        const res = await fetch("https://munchotella-api.onrender.com/api/settings/store-status", {
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            setStatus(data.data);
            return;
          }
        }
      } catch (err) {
        // Fallback local dacă API-ul este temporar indisponibil
      }

      // Offline Safe Fallback: Miercuri închis, altfel 16:00 - 24:00
      const now = new Date();
      const day = now.getDay();
      const hours = now.getHours();

      if (day === 3) {
        setStatus({
          isOpen: false,
          badgeKey: 'closedWednesday',
          statusText: 'Închis Miercuri',
        });
      } else if (hours >= 16 && hours < 24) {
        setStatus({
          isOpen: true,
          badgeKey: 'openNow',
          statusText: 'Deschis Acum',
        });
      } else {
        setStatus({
          isOpen: false,
          badgeKey: 'closedCurrently',
          statusText: 'Închis Acum',
        });
      }
    };

    fetchLiveStatus();
    const interval = setInterval(fetchLiveStatus, 60000); // Re-verificare la fiecare minut
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  // Calculare etichetă dinamică tradusă
  let displayText = status.statusText || t('openNow');
  if (status.badgeKey) {
    try {
      displayText = t(status.badgeKey as any);
      if (status.isHoliday && status.holidayName) {
        displayText = `${t('closedHoliday')}: ${status.holidayName}`;
      } else if (!status.isOpen && status.nextOpening?.label) {
        displayText = `${displayText} • ${status.nextOpening.label}`;
      }
    } catch {
      displayText = status.statusText || 'Munchotella';
    }
  }

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
        {displayText}
      </span>
    </div>
  );
}

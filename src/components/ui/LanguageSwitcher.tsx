"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";

const languages = [
  { code: "ro", label: "RO" },
  { code: "ru", label: "RU" },
  { code: "en", label: "EN" },
];

interface LanguageSwitcherProps {
  isScrolled?: boolean;
  className?: string;
}

export default function LanguageSwitcher({ isScrolled = true, className = "" }: LanguageSwitcherProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const switchLocale = (newLocale: string) => {
    // Preserve existing query params (e.g. ?product=..., ?item=..., ?openCart=true) for Meta Ads & Instagram Bot
    const search = typeof window !== "undefined" ? window.location.search : "";
    router.replace(`${pathname}${search}`, { locale: newLocale as any });
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1 sm:gap-1.5 h-10 sm:h-11 px-2.5 sm:px-3 rounded-full text-[12px] sm:text-[13px] font-bold tracking-wider transition-all duration-300 active:scale-95 cursor-pointer border ${
          isScrolled 
            ? "bg-[#FAF7F2] text-[#1A120B] border-transparent hover:border-[#E8E2D9] hover:text-[#D4A853]" 
            : "bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-[#D4A853] backdrop-blur-sm"
        }`}
        aria-label="Schimbă limba"
      >
        <span className="uppercase">{locale}</span>
        <ChevronDown size={13} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-full mt-2 right-0 bg-[#FFFCF6] border border-[#E8E2D9] rounded-2xl shadow-[0_12px_32px_rgba(26,18,11,0.14)] py-1.5 min-w-[100px] z-50 flex flex-col overflow-hidden"
          >
            {languages.map((lang) => {
              const isActive = locale === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => switchLocale(lang.code)}
                  className={`px-3.5 py-2.5 min-h-[42px] sm:min-h-[44px] text-[13px] font-bold text-left transition-colors flex items-center justify-between gap-3 cursor-pointer ${
                    isActive
                      ? "text-[#D4A853] bg-[#FAF7F2]"
                      : "text-[#736A60] hover:text-[#1A120B] hover:bg-[#FAF7F2]"
                  }`}
                >
                  <span>{lang.label}</span>
                  {isActive && <Check size={14} className="text-[#D4A853]" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

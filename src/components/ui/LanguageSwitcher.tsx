"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";

const languages = [
  { code: "ro", label: "RO" },
  { code: "ru", label: "RU" },
  { code: "en", label: "EN" },
];

export default function LanguageSwitcher() {
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
    // Basic implementation to swap locale in pathname
    // pathname might be /ro/menu or just /menu if default
    let newPath = pathname;
    if (pathname.startsWith(`/${locale}`)) {
      newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    } else {
      newPath = `/${newLocale}${pathname === '/' ? '' : pathname}`;
    }
    router.push(newPath);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-[#1A120B] hover:text-[#D4A853] transition-colors bg-[#FAF7F2] rounded-full border border-transparent hover:border-[#E8E2D9]"
        aria-label="Schimbă limba"
      >
        <span className="uppercase">{locale}</span>
        <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-full mt-2 right-0 bg-[#FFFCF6] border border-[#E8E2D9] rounded-2xl shadow-xl py-2 min-w-[80px] z-50 flex flex-col"
          >
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => switchLocale(lang.code)}
                className={`px-4 py-2 text-sm font-bold text-left transition-colors ${
                  locale === lang.code
                    ? "text-[#D4A853] bg-[#FAF7F2]"
                    : "text-[#736A60] hover:text-[#1A120B] hover:bg-[#FAF7F2]"
                }`}
              >
                {lang.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

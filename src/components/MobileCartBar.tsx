"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export default function MobileCartBar() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("MobileCartBar");
  const { items, totalItems, totalPrice, setIsCartOpen } = useCart();
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // Monitorizăm dacă un modal este deschis pe ecran (prin lock-ul pe document.body.style.overflow)
  // astfel încât bara să se retragă elegant și să nu interfereze cu butonul de configurare produs
  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkModalState = () => {
      const isLocked = document.body.style.overflow === "hidden";
      setIsProductModalOpen(isLocked);
    };

    const observer = new MutationObserver(checkModalState);
    observer.observe(document.body, { attributes: true, attributeFilter: ["style"] });
    checkModalState();

    return () => observer.disconnect();
  }, []);

  // Ascundem bara pe pagina de checkout, în panoul de admin, când coșul e gol sau când un modal e deschis
  const isCheckout = pathname.includes("/checkout");
  const isAdmin = pathname.includes("/admin");
  const hasItems = items && items.length > 0;

  const isVisible = hasItems && !isCheckout && !isAdmin && !isProductModalOpen;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 80, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 80, opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-6 inset-x-3.5 z-40 md:hidden pointer-events-none flex justify-center"
          style={{
            paddingBottom: "env(safe-area-inset-bottom, 0px)"
          }}
        >
          <div
            onClick={() => router.push("/checkout")}
            role="button"
            tabIndex={0}
            className="pointer-events-auto w-full max-w-[370px] h-[52px] sm:h-[54px] bg-[#1A120B] text-white rounded-full px-3.5 sm:px-4 shadow-[0_16px_36px_-6px_rgba(26,18,11,0.65),0_0_0_1px_rgba(212,168,83,0.35)] flex items-center justify-between gap-2.5 sm:gap-3 border border-[#D4A853]/30 cursor-pointer active:scale-[0.98] transition-all group"
          >
            {/* Stânga: Iconiță Coș albă (identică cu cea de sus) + Număr de produse în dreapta (tap deschide coșul) */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                setIsCartOpen(true);
              }}
              aria-label={t("viewCart")}
              className="flex items-center gap-2 shrink-0 cursor-pointer py-1 pl-1"
            >
              <ShoppingBag className="w-5 h-5 text-white shrink-0 group-hover:scale-105 transition-transform" />
              <span className="flex items-center justify-center bg-[#D4A853] text-white text-[11px] font-bold w-5 h-5 min-w-[20px] px-1 rounded-full shadow-sm">
                {totalItems}
              </span>
            </div>

            {/* Centru: Text de Acțiune Auriu Bold */}
            <div className="flex-1 text-center min-w-0 px-1">
              <span className="font-sans font-black text-[13px] sm:text-[14px] uppercase tracking-wider text-[#D4A853] group-hover:text-white transition-colors truncate block">
                {t("finalizeOrder")}
              </span>
            </div>

            {/* Dreapta: Preț & Săgeată în Pastilă Conturată */}
            <div className="flex items-center gap-1.5 shrink-0 bg-[#261B12] px-2.5 sm:px-3 py-1 rounded-full border border-[#D4A853]/30 shadow-sm">
              <span className="font-sans font-extrabold text-[14px] sm:text-[15px] text-white tracking-tight whitespace-nowrap">
                {totalPrice} MDL
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-[#D4A853] shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

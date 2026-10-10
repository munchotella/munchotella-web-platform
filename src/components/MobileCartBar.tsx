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
          className="fixed bottom-6 inset-x-0 z-40 md:hidden pointer-events-none flex justify-center px-4"
          style={{
            paddingBottom: "env(safe-area-inset-bottom, 0px)"
          }}
        >
          <div className="pointer-events-auto bg-[#1A120B] text-white rounded-full p-1.5 pl-2.5 sm:pl-3 pr-1.5 shadow-[0_16px_36px_-6px_rgba(26,18,11,0.55),0_0_0_1px_rgba(212,168,83,0.35)] flex items-center gap-2.5 sm:gap-3 border border-[#D4A853]/25">
            {/* Secțiunea Stânga: Trigger Coș / Detalii Comandă */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              aria-label={t("viewCart")}
              className="flex items-center gap-2 min-w-0 py-0.5 text-left cursor-pointer group active:opacity-85 transition-opacity shrink-0"
            >
              {/* Badge Icon Coș cu styling Warm Luxury */}
              <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#261B12] border border-[#D4A853]/30 flex items-center justify-center text-white shrink-0 shadow-inner">
                <ShoppingBag className="w-3.5 h-3.5 text-white" />
                <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 bg-[#D4A853] text-[#1A120B] text-[10px] font-black rounded-full flex items-center justify-center shadow-md">
                  {totalItems}
                </span>
              </div>

              {/* Informații preț & cantitate */}
              <div className="flex flex-col justify-center leading-tight">
                <span className="font-sans text-[9.5px] uppercase font-bold tracking-wider text-[#A89F91] whitespace-nowrap">
                  {t("itemsCount", { count: totalItems })}
                </span>
                <span className="font-sans font-extrabold text-[14px] sm:text-[15px] text-white tracking-tight whitespace-nowrap">
                  {totalPrice} MDL
                </span>
              </div>
            </button>

            {/* Separator Vertical Fin (Champagne Gold Hairline) */}
            <div className="w-[1px] h-5 bg-white/15 shrink-0" aria-hidden="true" />

            {/* Secțiunea Dreapta: Buton Direct Checkout Pill */}
            <button
              type="button"
              onClick={() => router.push("/checkout")}
              className="h-[36px] sm:h-[38px] px-3.5 sm:px-4 bg-[#D4A853] text-[#1A120B] rounded-full font-extrabold text-[11px] sm:text-xs uppercase tracking-wide flex items-center gap-1.5 hover:bg-[#DEB461] active:scale-[0.96] transition-all shadow-[0_4px_14px_rgba(212,168,83,0.35)] shrink-0 cursor-pointer"
            >
              <span className="whitespace-nowrap font-black">{t("finalizeOrder")}</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0 text-[#1A120B]" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

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
          className="fixed bottom-6 inset-x-3.5 z-40 md:hidden pointer-events-none"
          style={{
            paddingBottom: "env(safe-area-inset-bottom, 0px)"
          }}
        >
          <div className="pointer-events-auto w-full bg-[#1A120B] text-white rounded-[20px] p-2 sm:p-2.5 shadow-[0_16px_36px_-6px_rgba(26,18,11,0.55),0_0_0_1px_rgba(212,168,83,0.35)] flex items-center justify-between gap-2 overflow-hidden">
            {/* Secțiunea Stânga: Trigger Coș / Detalii Comandă */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              aria-label={t("viewCart")}
              className="flex items-center gap-2 sm:gap-2.5 min-w-0 pl-1 py-0.5 text-left cursor-pointer group active:opacity-85 transition-opacity shrink-0"
            >
              {/* Badge Icon Coș cu styling identic 1:1 cu cel din Navbar */}
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#261B12] border border-[#D4A853]/30 flex items-center justify-center text-white shrink-0 shadow-inner">
                <ShoppingBag className="w-4 h-4 text-white" />
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-[#D4A853] text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-md">
                  {totalItems}
                </span>
              </div>

              {/* Informații preț & cantitate cu typographic hierarchy riguroasă (font-sans Outfit) */}
              <div className="flex flex-col justify-center leading-tight">
                <span className="font-sans text-[10px] uppercase font-bold tracking-wider text-[#A89F91] whitespace-nowrap">
                  {t("itemsCount", { count: totalItems })}
                </span>
                <span className="font-sans font-extrabold text-[15px] sm:text-[16px] text-white tracking-tight whitespace-nowrap">
                  {totalPrice} MDL
                </span>
              </div>
            </button>

            {/* Secțiunea Dreapta: Buton Direct Checkout Proporționat Impecabil */}
            <button
              type="button"
              onClick={() => router.push("/checkout")}
              className="h-[40px] sm:h-[42px] px-3 sm:px-4 bg-[#D4A853] text-[#1A120B] rounded-xl font-bold text-[11px] sm:text-xs uppercase tracking-wide flex items-center gap-1.5 hover:bg-[#DEB461] active:scale-[0.97] transition-all shadow-md shrink-0 cursor-pointer"
            >
              <span className="whitespace-nowrap font-extrabold">{t("finalizeOrder")}</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0 text-[#1A120B]" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

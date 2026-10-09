"use client";

import React from "react";
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

  // Ascundem bara pe checkout, admin, sau dacă nu avem produse în coș
  const isCheckout = pathname.includes("/checkout");
  const isAdmin = pathname.includes("/admin");
  const hasItems = items && items.length > 0;

  if (isCheckout || isAdmin || !hasItems) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-4 left-4 right-4 z-40 md:hidden"
      >
        <div className="bg-[#1A120B] text-white rounded-2xl p-3 shadow-2xl border border-[#D4A853]/40 flex items-center justify-between gap-3 backdrop-blur-md">
          {/* Partea stângă: Deschide drawer-ul de coș */}
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2.5 px-2 py-1 text-left cursor-pointer"
          >
            <div className="relative w-10 h-10 rounded-xl bg-[#D4A853]/20 flex items-center justify-center text-[#D4A853] shrink-0 border border-[#D4A853]/30">
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#D4A853] text-[#1A120B] text-[10px] font-black rounded-full flex items-center justify-center shadow-md">
                {totalItems}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-[#A89F91] uppercase tracking-wider font-semibold">
                {t("itemsCount", { count: totalItems })}
              </span>
              <span className="font-serif font-bold text-base text-white">
                {totalPrice} MDL
              </span>
            </div>
          </button>

          {/* Partea dreaptă: Buton mare auriu direct la Checkout */}
          <button
            type="button"
            onClick={() => router.push("/checkout")}
            className="flex items-center gap-1.5 bg-[#D4A853] text-[#1A120B] px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#E5BC66] active:scale-95 transition-all shadow-md cursor-pointer shrink-0"
          >
            <span>{t("finalizeOrder")}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

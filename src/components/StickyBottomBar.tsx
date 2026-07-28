"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, ArrowRight, Sparkles } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function StickyBottomBar() {
  const [isVisible, setIsVisible] = useState(false);
  const { totalItems, totalPrice, setIsCartOpen } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      // Show bar after scrolling 400px down (past Hero)
      setIsVisible(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-[500px] md:hidden"
        >
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white rounded-full px-5 py-3.5 shadow-[0_8px_30px_rgba(26,26,26,0.2)] flex items-center justify-between transition-colors duration-300 cursor-pointer"
          >
            {totalItems > 0 ? (
              <>
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-[14px] font-bold">
                  {totalItems}
                </div>
                <span className="font-bold text-[15px] uppercase tracking-wide">
                  Vezi Comanda
                </span>
                <span className="font-bold text-[15px]">
                  {totalPrice} MDL
                </span>
              </>
            ) : (
              <div className="flex items-center justify-center w-full gap-2">
                <ShoppingBag className="w-5 h-5 text-white/70" />
                <span className="font-bold text-[15px] uppercase tracking-wide text-white/90">
                  Deschide Coșul
                </span>
              </div>
            )}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

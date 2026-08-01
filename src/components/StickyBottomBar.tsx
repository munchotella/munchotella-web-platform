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
            className="w-full bg-[#D4A853] hover:bg-[#C09640] text-[#1A120B] rounded-full px-5 py-3 shadow-[0_8px_30px_rgba(212,168,83,0.4)] flex items-center justify-between transition-all duration-300 cursor-pointer active:scale-[0.98]"
          >
            {totalItems > 0 ? (
              <>
                <div className="w-9 h-9 rounded-full bg-[#1A120B] text-[#FFFDF8] flex items-center justify-center text-[15px] font-bold shadow-sm">
                  {totalItems}
                </div>
                <span className="font-bold text-[13px] uppercase tracking-widest flex-1 text-center pl-2">
                  Vezi Comanda
                </span>
                <span className="font-bold text-[15px] bg-[#FFFDF8]/30 px-3.5 py-1.5 rounded-full backdrop-blur-sm">
                  {totalPrice} MDL
                </span>
              </>
            ) : (
              <div className="flex items-center justify-center w-full gap-2">
                <ShoppingBag className="w-5 h-5 text-[#1A120B]/70" />
                <span className="font-bold text-[15px] uppercase tracking-wide text-[#1A120B]">
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

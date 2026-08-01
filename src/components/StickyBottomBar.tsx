"use client";

import React from "react";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function StickyBottomBar() {
  const { totalItems, totalPrice, setIsCartOpen } = useCart();

  return (
    <div className="w-full bg-[#FCF9F4] md:hidden px-4 pb-12 pt-2 flex justify-center -mt-8 relative z-20">
      <button
        onClick={() => setIsCartOpen(true)}
        className="w-[95%] max-w-[500px] bg-[#D4A853] hover:bg-[#C09640] text-[#1A120B] rounded-full px-5 py-3 shadow-[0_8px_30px_rgba(212,168,83,0.4)] flex items-center justify-between transition-all duration-300 cursor-pointer active:scale-[0.98]"
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
          <div className="flex items-center justify-center w-full gap-2 py-1">
            <ShoppingBag className="w-5 h-5 text-[#1A120B]/70" />
            <span className="font-bold text-[15px] uppercase tracking-wide text-[#1A120B]">
              Deschide Coșul
            </span>
          </div>
        )}
      </button>
    </div>
  );
}

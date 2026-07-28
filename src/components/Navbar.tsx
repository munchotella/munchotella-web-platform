"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import LogoIconSVG from "./LogoIconSVG";
import LogoTextSVG from "./LogoTextSVG";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { totalItems, totalPrice, setIsCartOpen } = useCart();
  const pathname = usePathname();

  // On pages other than the home page, we might want the navbar to be solid by default
  const isHome = pathname === "/";
  const effectiveIsScrolled = isHome ? isScrolled : true;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    // Trigger once on mount
    handleScroll();
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${
        effectiveIsScrolled 
          ? "bg-[#FFFCF6]/95 backdrop-blur-md shadow-sm border-[#E8E2D9]" 
          : "bg-gradient-to-b from-[#1A120B]/80 to-transparent border-transparent"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group z-50">
          <LogoIconSVG 
            className="h-10 w-10 md:h-12 md:w-12 transition-all duration-300 group-hover:scale-105 text-[#f3922c]" 
          />
          <LogoTextSVG 
            className={`h-[45px] md:h-[55px] w-auto transition-colors duration-300 ${
              effectiveIsScrolled 
                ? "text-[#1A120B] group-hover:text-[#D4A853]" 
                : "text-white group-hover:text-[#D4A853]"
            }`} 
          />
        </Link>

        {/* Center Nav (Desktop) */}
        <div className="hidden md:flex items-center space-x-8 text-[13px] font-bold uppercase tracking-widest">
          <Link href="/" className={`hover:text-[#D4A853] transition-colors duration-300 active:scale-95 py-1 ${pathname === "/" ? "border-b-2 border-[#D4A853] text-[#D4A853]" : effectiveIsScrolled ? "text-[#736A60]" : "text-white/80"}`}>Home</Link>
          <Link href="/about" className={`hover:text-[#D4A853] transition-colors duration-300 active:scale-95 py-1 ${pathname === "/about" ? "border-b-2 border-[#D4A853] text-[#D4A853]" : effectiveIsScrolled ? "text-[#736A60]" : "text-white/80"}`}>Povestea</Link>
          <Link href="/menu" className={`hover:text-[#D4A853] transition-colors duration-300 active:scale-95 py-1 ${pathname === "/menu" ? "border-b-2 border-[#D4A853] text-[#D4A853]" : effectiveIsScrolled ? "text-[#736A60]" : "text-white/80"}`}>Meniu</Link>
          <Link href="/#testimonials" className={`hover:text-[#D4A853] transition-colors duration-300 active:scale-95 py-1 ${effectiveIsScrolled ? "text-[#736A60]" : "text-white/80"}`}>Recenzii</Link>
          <Link href="/contact" className={`hover:text-[#D4A853] transition-colors duration-300 active:scale-95 py-1 ${pathname === "/contact" ? "border-b-2 border-[#D4A853] text-[#D4A853]" : effectiveIsScrolled ? "text-[#736A60]" : "text-white/80"}`}>Contact</Link>
        </div>

        {/* Trailing Icons */}
        <div className={`flex items-center space-x-4 ${effectiveIsScrolled ? "text-[#1A120B]" : "text-white"}`}>
          <a href="tel:+37379006499" className={`hidden md:flex items-center space-x-2 text-[14px] font-bold hover:text-[#D4A853] transition-colors`}>
            <span className="material-symbols-outlined text-[18px]">call</span>
            <span>079 006 499</span>
          </a>
          {totalItems > 0 ? (
            <button 
              onClick={() => setIsCartOpen(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 active:scale-95 ml-2 shadow-md ${
                effectiveIsScrolled ? "bg-[#1A1A1A] text-white hover:bg-[#2A2A2A]" : "bg-white text-[#1A1A1A] hover:bg-white/90"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
              <span className="font-bold text-[14px]">{totalPrice} MDL</span>
              <span className="flex items-center justify-center bg-[#D4A853] text-white text-[11px] font-bold w-5 h-5 rounded-full ml-1">
                {totalItems}
              </span>
            </button>
          ) : (
            <button 
              onClick={() => setIsCartOpen(true)}
              aria-label="Cart" 
              className="p-2 hover:text-[#D4A853] transition-colors duration-300 active:scale-95 relative ml-2"
            >
              <span className="material-symbols-outlined">shopping_bag</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

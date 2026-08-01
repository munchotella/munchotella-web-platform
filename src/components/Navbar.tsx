"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import LogoIconSVG from "./LogoIconSVG";
import LogoTextSVG from "./LogoTextSVG";
import NotificationsDropdown from "./NotificationsDropdown";
import { User, LogOut, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import NumberTicker from "@/components/ui/NumberTicker";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { totalItems, totalPrice, setIsCartOpen } = useCart();
  const { user, setIsAuthModalOpen, logout } = useAuth();
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

          <Link href="/contact" className={`hover:text-[#D4A853] transition-colors duration-300 active:scale-95 py-1 ${pathname === "/contact" ? "border-b-2 border-[#D4A853] text-[#D4A853]" : effectiveIsScrolled ? "text-[#736A60]" : "text-white/80"}`}>Contact</Link>
        </div>

        {/* Trailing Icons */}
        <div className={`flex items-center space-x-3 md:space-x-4 ${effectiveIsScrolled ? "text-[#1A120B]" : "text-white"}`}>
          <a href="tel:+37379006499" className={`hidden md:flex items-center space-x-2 text-[14px] font-bold hover:text-[#D4A853] transition-colors`}>
            <span className="material-symbols-outlined text-[18px]">call</span>
            <span>079 006 499</span>
          </a>
          <NotificationsDropdown isScrolled={effectiveIsScrolled} />
          {/* Auth Button */}
          {user ? (
            <div className="relative group/user flex items-center">
              <Link 
                href="/profile"
                className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors active:scale-95 ${
                  effectiveIsScrolled ? "bg-[#1A1A1A]/5 hover:bg-[#1A1A1A]/10 text-[#1A1A1A]" : "bg-white/10 hover:bg-white/20 text-white"
                }`}
              >
                <User size={18} />
              </Link>
              <div className="absolute top-12 right-0 bg-[#FFFCF6] border border-[#E8E2D9] rounded-xl shadow-xl w-48 py-2 opacity-0 invisible group-hover/user:opacity-100 group-hover/user:visible transition-all duration-200 transform origin-top-right z-50">
                <div className="px-4 py-2 border-b border-[#E8E2D9]/50 mb-2">
                  <p className="text-[13px] font-bold text-[#1A120B] truncate">{user.name}</p>
                </div>
                <Link href="/profile" className="flex items-center gap-2 px-4 py-2 text-[14px] text-[#1A120B]/80 hover:bg-[#1A120B]/5 hover:text-[#D4A853] transition-colors">
                  <User size={16} /> Profilul meu
                </Link>
                <button 
                  onClick={logout}
                  className="w-full text-left flex items-center gap-2 px-4 py-2 text-[14px] text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} /> Deconectare
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setIsAuthModalOpen(true)}
              className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors active:scale-95 ${
                effectiveIsScrolled ? "bg-[#1A1A1A]/5 hover:bg-[#1A1A1A]/10 text-[#1A1A1A]" : "bg-white/10 hover:bg-white/20 text-white"
              }`}
            >
              <User size={18} />
            </button>
          )}

          {/* Cart Button */}
          {totalItems > 0 ? (
            <button 
              onClick={() => setIsCartOpen(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 active:scale-95 ml-2 shadow-md ${
                effectiveIsScrolled ? "bg-[#1A1A1A] text-white hover:bg-[#2A2A2A]" : "bg-white text-[#1A1A1A] hover:bg-white/90"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
              <span className="font-bold text-[14px] hidden sm:block">{totalPrice} MDL</span>
              <span className="flex items-center justify-center bg-[#D4A853] text-white text-[11px] font-bold w-5 h-5 rounded-full">
                <NumberTicker value={totalItems} />
              </span>
            </button>
          ) : (
            <button 
              onClick={() => setIsCartOpen(true)}
              aria-label="Cart" 
              className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors active:scale-95 ${
                effectiveIsScrolled ? "hover:bg-[#1A1A1A]/5 text-[#1A1A1A]" : "hover:bg-white/10 text-white"
              }`}
            >
              <span className="material-symbols-outlined">shopping_bag</span>
            </button>
          )}

          {/* Hamburger Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className={`md:hidden flex items-center justify-center w-10 h-10 rounded-full transition-colors active:scale-95 ml-1 ${
              effectiveIsScrolled ? "hover:bg-[#1A1A1A]/5 text-[#1A1A1A]" : "hover:bg-white/10 text-white"
            }`}
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-[#FFFCF6] flex flex-col pt-6 px-6"
          >
            <div className="flex justify-between items-center mb-12">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 group">
                <LogoIconSVG className="h-10 w-10 text-[#f3922c]" />
                <LogoTextSVG className="h-[45px] w-auto text-[#1A120B]" />
              </Link>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1A1A1A]/5 hover:bg-[#1A1A1A]/10 text-[#1A1A1A] transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="flex flex-col space-y-6 text-2xl font-serif text-[#1A120B]">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#D4A853] transition-colors">Home</Link>
              <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#D4A853] transition-colors">Povestea</Link>
              <Link href="/menu" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#D4A853] transition-colors">Meniu</Link>
              <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#D4A853] transition-colors">Contact</Link>
            </div>

            <div className="mt-auto mb-10 border-t border-[#E8E2D9] pt-8">
              <a href="tel:+37379006499" className="flex items-center gap-3 text-lg font-bold text-[#1A120B] mb-4">
                <div className="w-10 h-10 rounded-full bg-[#D4A853]/10 flex items-center justify-center text-[#D4A853]">
                  <span className="material-symbols-outlined text-xl">call</span>
                </div>
                079 006 499
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

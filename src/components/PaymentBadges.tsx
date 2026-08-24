"use client";

import React from "react";

interface PaymentBadgesProps {
  className?: string;
  variant?: "footer" | "checkout";
}

export default function PaymentBadges({ className = "", variant = "footer" }: PaymentBadgesProps) {
  const isCheckout = variant === "checkout";

  return (
    <div className={`flex flex-wrap items-center gap-2.5 ${className}`}>
      {/* Visa */}
      <div 
        className={`flex items-center justify-center rounded-lg border transition-all duration-300 ${
          isCheckout 
            ? "h-8 px-2.5 bg-white border-[#E8E2D9] shadow-xs" 
            : "h-8 px-3 bg-white/10 border-white/15 hover:bg-white/20 hover:border-white/30"
        }`}
        title="Visa"
      >
        <svg className="h-4 w-auto" viewBox="0 0 48 16" fill="none">
          <path d="M19.34 0.6L12.7 15.4H8.38L5.14 3.7C4.94 2.94 4.78 2.66 4.18 2.34C3.22 1.82 1.62 1.34 0.22 1.02L0.3 0.6H7.1C8 0.6 8.82 1.2 9.02 2.22L10.74 11.36L15.02 0.6H19.34ZM36.3 10.46C36.34 6.78 31.06 6.58 31.1 4.7C31.12 4.12 31.66 3.52 32.78 3.38C33.34 3.3 34.9 3.24 36.62 4.04L37.38 0.5C36.34 0.12 35 0 33.34 0C29.26 0 26.38 2.16 26.34 5.28C26.3 7.56 28.38 8.84 29.94 9.6C31.54 10.38 32.08 10.88 32.08 11.58C32.06 12.64 30.8 13.12 29.62 13.14C27.56 13.18 26.34 12.6 25.4 12.16L24.62 15.82C25.62 16.28 27.46 16.66 29.38 16.68C33.72 16.68 36.26 14.54 36.3 10.46ZM47.06 15.4H50.86L47.58 0.6H44.06C43.26 0.6 42.6 1.06 42.3 1.78L36.14 15.4H40.54L41.42 12.98H46.78L47.06 15.4ZM42.62 9.74L44.82 3.66L46.08 9.74H42.62ZM25.06 0.6L21.66 15.4H17.54L20.94 0.6H25.06Z" fill={isCheckout ? "#1A1F71" : "#FFFFFF"}/>
        </svg>
      </div>

      {/* Mastercard */}
      <div 
        className={`flex items-center justify-center rounded-lg border transition-all duration-300 ${
          isCheckout 
            ? "h-8 px-2.5 bg-white border-[#E8E2D9] shadow-xs" 
            : "h-8 px-3 bg-white/10 border-white/15 hover:bg-white/20 hover:border-white/30"
        }`}
        title="Mastercard"
      >
        <svg className="h-5 w-auto" viewBox="0 0 32 24" fill="none">
          <circle cx="11" cy="12" r="9" fill="#EB001B"/>
          <circle cx="21" cy="12" r="9" fill="#F79E1B" fillOpacity="0.88"/>
          <path d="M16 5.5C17.7 7.2 18.8 9.5 18.8 12C18.8 14.5 17.7 16.8 16 18.5C14.3 16.8 13.2 14.5 13.2 12C13.2 9.5 14.3 7.2 16 5.5Z" fill="#FF5F00"/>
        </svg>
      </div>

      {/* maib */}
      <div 
        className={`flex items-center justify-center gap-1 rounded-lg border transition-all duration-300 ${
          isCheckout 
            ? "h-8 px-2.5 bg-[#008F79]/10 border-[#008F79]/30" 
            : "h-8 px-3 bg-[#008F79]/20 border-[#008F79]/40 hover:bg-[#008F79]/30"
        }`}
        title="maib e-Commerce Checkout"
      >
        <span className="w-2 h-2 rounded-full bg-[#00B497] animate-pulse" />
        <span className={`text-[11px] font-black tracking-tight ${isCheckout ? "text-[#008F79]" : "text-white"}`}>
          maib
        </span>
      </div>

      {/* Apple Pay */}
      <div 
        className={`flex items-center justify-center rounded-lg border transition-all duration-300 ${
          isCheckout 
            ? "h-8 px-2.5 bg-black text-white border-black" 
            : "h-8 px-3 bg-white/10 border-white/15 hover:bg-white/20 hover:border-white/30"
        }`}
        title="Apple Pay"
      >
        <div className="flex items-center gap-1">
          <svg className="h-3.5 w-auto fill-current" viewBox="0 0 170 170">
            <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.69-7.83-11.98-14.36-5.77-8.81-10.45-18.82-14.04-30.04-3.59-11.22-5.39-21.98-5.39-32.27 0-14.03 3.63-25.59 10.9-34.69 7.27-9.09 16.48-13.75 27.63-13.97 4.58 0 9.77 1.25 15.58 3.75 5.81 2.5 9.8 3.86 11.96 4.08 2.62-.33 6.95-1.8 12.98-4.42 6.03-2.61 11.45-3.8 16.27-3.57 12.2.66 21.93 4.96 29.19 12.91-10.68 6.54-15.91 15.63-15.69 27.27.22 9.15 3.75 16.89 10.59 23.23 6.84 6.34 14.88 9.97 24.12 10.88-2.18 6.54-4.8 12.87-7.84 19-3.05 6.13-6.22 12.01-9.51 17.65zm-33.09-122.95c0 6.64-2.4 12.79-7.2 18.45-5.99 6.86-13.23 10.79-21.72 11.77-.11-1.3-.16-2.39-.16-3.26 0-6.64 2.62-13.12 7.85-19.45 5.23-6.33 11.89-10.14 19.98-11.43.87 1.3 1.25 2.61 1.25 3.92z"/>
          </svg>
          <span className="text-[10px] font-bold tracking-tight">Pay</span>
        </div>
      </div>

      {/* Google Pay */}
      <div 
        className={`flex items-center justify-center rounded-lg border transition-all duration-300 ${
          isCheckout 
            ? "h-8 px-2.5 bg-white border-[#E8E2D9] shadow-xs" 
            : "h-8 px-3 bg-white/10 border-white/15 hover:bg-white/20 hover:border-white/30"
        }`}
        title="Google Pay"
      >
        <div className="flex items-center gap-1">
          <span className="font-bold text-[11px] text-[#4285F4]">G</span>
          <span className={`text-[10px] font-semibold tracking-tight ${isCheckout ? "text-[#5F6368]" : "text-white/90"}`}>
            Pay
          </span>
        </div>
      </div>

      {/* MIA Plati Instant */}
      <div 
        className={`flex items-center justify-center gap-1.5 rounded-lg border transition-all duration-300 ${
          isCheckout 
            ? "h-8 px-2.5 bg-gradient-to-r from-[#D4A853]/15 to-[#F3922C]/15 border-[#D4A853]/40 shadow-xs" 
            : "h-8 px-3 bg-gradient-to-r from-[#D4A853]/20 to-[#F3922C]/20 border-[#D4A853]/40 hover:border-[#D4A853]/70"
        }`}
        title="MIA Plăți Instant — 0% Comision"
      >
        <span className="text-[10px] font-black tracking-widest text-[#D4A853]">MIA</span>
        <span className="text-[9px] font-medium px-1 py-0.5 rounded bg-[#D4A853] text-[#1A120B] leading-none">
          0% comision
        </span>
      </div>
    </div>
  );
}

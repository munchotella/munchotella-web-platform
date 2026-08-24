"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/routing";
import { AlertCircle, RefreshCw, ShoppingBag, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PaymentBadges from "@/components/PaymentBadges";

function FailContent() {
  const searchParams = useSearchParams();
  const checkoutId = searchParams.get("checkoutId");
  const orderId = searchParams.get("orderId");

  return (
    <div className="max-w-xl w-full mx-auto bg-[#FFFCF6] border border-[#E8E2D9] rounded-[32px] p-8 md:p-12 shadow-[0_12px_40px_rgb(0,0,0,0.06)] text-center relative overflow-hidden">
      {/* Decorative Warning Glow */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#E53E3E]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Warning Icon */}
      <div className="w-20 h-20 mx-auto rounded-full bg-[#E53E3E]/15 border border-[#E53E3E]/30 flex items-center justify-center mb-6 shadow-sm">
        <AlertCircle className="w-10 h-10 text-[#E53E3E]" />
      </div>

      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E53E3E]/10 text-[#E53E3E] text-xs font-bold uppercase tracking-wider mb-3">
        Tranzacție Neconfirmată
      </span>

      <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#1A120B] mb-3">
        Plata nu a fost finalizată
      </h1>
      
      <p className="text-[#736A60] text-sm md:text-base mb-8 max-w-md mx-auto leading-relaxed">
        Tranzacția a fost anulată sau nu a putut fi autorizată de către banca emitentă a cardului. Niciun fond nu a fost retras din contul tău.
      </p>

      {/* Order Details */}
      {(orderId || checkoutId) && (
        <div className="bg-white rounded-2xl border border-[#E8E2D9] p-5 mb-8 text-left space-y-3 text-sm shadow-xs">
          {orderId && (
            <div className="flex justify-between items-center py-1 border-b border-[#E8E2D9]/60">
              <span className="text-[#736A60]">Referință Comandă:</span>
              <span className="font-mono font-bold text-[#1A120B]">{orderId}</span>
            </div>
          )}
          {checkoutId && (
            <div className="flex justify-between items-center py-1">
              <span className="text-[#736A60]">ID Sesiune maib:</span>
              <span className="font-mono text-xs text-[#736A60] max-w-[200px] truncate">{checkoutId}</span>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Link
          href="/checkout"
          className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#1A120B] text-white font-bold text-sm hover:bg-[#D4A853] transition-colors flex items-center justify-center gap-2 shadow-lg"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Încearcă din Nou</span>
        </Link>
        <Link
          href="/menu"
          className="w-full sm:w-auto px-6 py-3.5 rounded-full border border-[#E8E2D9] bg-white text-[#1A120B] font-bold text-sm hover:bg-[#FAF7F2] transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4 text-[#736A60]" />
          <span>Înapoi la Meniu</span>
        </Link>
      </div>

      {/* Footer Badges */}
      <div className="mt-10 pt-6 border-t border-[#E8E2D9]/70 flex flex-col items-center gap-3">
        <span className="text-[11px] uppercase tracking-wider text-[#736A60]/80 font-medium">
          Poți achita online cu Card, Apple Pay, Google Pay sau MIA
        </span>
        <PaymentBadges variant="checkout" />
      </div>
    </div>
  );
}

export default function CheckoutFailPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-between">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-24 md:py-32">
        <Suspense fallback={<div className="w-8 h-8 border-3 border-[#D4A853] border-t-transparent rounded-full animate-spin mx-auto" />}>
          <FailContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

"use client";

import React, { useState } from 'react';
import { Calculator, MapPin, Info, ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/routing';

interface DeliveryCalculatorProps {
  dict: {
    title: string;
    subtitle: string;
    distanceLabel: string;
    distancePlaceholder: string;
    calculateBtn: string;
    resultTitle: string;
    autoBadge: string;
    estimatedCost: string;
    disclaimer: string;
    orderCta: string;
  };
}

export default function DeliveryCalculator({ dict }: DeliveryCalculatorProps) {
  const [distanceKm, setDistanceKm] = useState<string>('2.5');
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(46);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const km = parseFloat(distanceKm);
    if (isNaN(km) || km <= 0) return;

    // Formula unica si transparenta: 30 MDL tarif baza + 6.45 MDL/km parcurs
    const cost = Math.round(30 + km * 6.45);
    setCalculatedPrice(cost);
  };

  return (
    <div className="bg-white border border-[#E8E2D9] rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
      {/* Glow discret Warm Luxury */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#D4A853]/10 rounded-full blur-2xl pointer-events-none" />
      
      <div className="flex items-center gap-3.5 mb-6 relative">
        <div className="w-11 h-11 rounded-full bg-[#1A120B] flex items-center justify-center text-[#D4A853] shrink-0 shadow-sm">
          <Calculator className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-serif text-2xl font-bold text-[#1A120B]">{dict.title}</h3>
          <p className="text-[#736A60] text-xs font-sans mt-0.5">{dict.subtitle}</p>
        </div>
      </div>

      <form onSubmit={handleCalculate} className="space-y-5 relative">
        <div>
          <label className="block text-[#1A120B] text-sm font-sans mb-2 font-semibold">
            {dict.distanceLabel}
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.1"
              min="0.1"
              max="20"
              value={distanceKm}
              onChange={(e) => setDistanceKm(e.target.value)}
              placeholder={dict.distancePlaceholder}
              className="w-full bg-[#FAF7F2] border border-[#E8E2D9] focus:border-[#D4A853] focus:bg-white text-[#1A120B] rounded-xl px-4 py-3.5 pl-11 text-base focus:outline-none transition-all placeholder:text-[#A89F91]"
            />
            <MapPin className="w-5 h-5 text-[#9E721D] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#736A60] text-sm font-mono font-medium">
              km
            </span>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-[#1A120B] hover:bg-[#2A1E14] text-[#D4A853] font-sans font-bold py-3.5 rounded-xl transition-all duration-200 text-sm tracking-wide shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
        >
          <span>{dict.calculateBtn}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {calculatedPrice !== null && (
        <div className="mt-6 pt-6 border-t border-[#E8E2D9] animate-fadeIn">
          <span className="text-[#736A60] text-xs font-mono uppercase tracking-widest block mb-1.5 font-semibold">
            {dict.resultTitle}
          </span>
          <div className="flex items-baseline gap-3 mb-3">
            <span className="text-4xl font-serif text-[#1A120B] font-bold">
              ~{calculatedPrice} MDL
            </span>
            <span className="text-xs px-3 py-1 rounded-full font-mono uppercase tracking-wider bg-[#FAF7F2] border border-[#D4A853]/40 text-[#9E721D] font-bold">
              {dict.autoBadge}
            </span>
          </div>
          
          <div className="flex items-start gap-2.5 text-[#736A60] text-xs leading-relaxed bg-[#FAF7F2] p-3.5 rounded-xl border border-[#E8E2D9] mb-4">
            <Info className="w-4 h-4 text-[#9E721D] shrink-0 mt-0.5" />
            <span>{dict.disclaimer}</span>
          </div>

          <Link
            href="/menu"
            className="inline-flex items-center justify-center w-full text-center text-xs font-bold uppercase tracking-wider text-[#9E721D] hover:text-[#7A5816] py-2 transition-colors group"
          >
            <span>{dict.orderCta}</span>
            <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
      )}
    </div>
  );
}

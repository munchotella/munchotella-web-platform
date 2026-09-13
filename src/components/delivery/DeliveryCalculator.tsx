"use client";

import React, { useState } from 'react';
import { Calculator, Navigation, Info, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface DeliveryCalculatorProps {
  dict: {
    title: string;
    subtitle: string;
    distanceLabel: string;
    distancePlaceholder: string;
    calculateBtn: string;
    resultTitle: string;
    pedestrianBadge: string;
    autoBadge: string;
    estimatedCost: string;
    disclaimer: string;
    orderCta: string;
    tier1Name: string;
    tier2Name: string;
  };
}

export default function DeliveryCalculator({ dict }: DeliveryCalculatorProps) {
  const [distanceKm, setDistanceKm] = useState<string>('2.5');
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(46);
  const [isPedestrian, setIsPedestrian] = useState<boolean>(false);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const km = parseFloat(distanceKm);
    if (isNaN(km) || km < 0) return;

    if (km < 1.0) {
      setIsPedestrian(true);
      setCalculatedPrice(20);
    } else {
      setIsPedestrian(false);
      // Formula de tarifare: 30 MDL tarif baza + 6.45 MDL/km parcurs
      const cost = Math.round(30 + km * 6.45);
      setCalculatedPrice(cost);
    }
  };

  return (
    <div className="bg-[#241B13] border border-[#D4A853]/30 rounded-2xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4A853]/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-[#D4A853]/10 border border-[#D4A853]/20 flex items-center justify-center text-[#D4A853]">
          <Calculator className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-serif text-2xl text-white font-normal">{dict.title}</h3>
          <p className="text-white/60 text-xs font-sans">{dict.subtitle}</p>
        </div>
      </div>

      <form onSubmit={handleCalculate} className="space-y-6">
        <div>
          <label className="block text-white/80 text-sm font-sans mb-2 font-medium">
            {dict.distanceLabel}
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.1"
              min="0.1"
              max="15"
              value={distanceKm}
              onChange={(e) => setDistanceKm(e.target.value)}
              placeholder={dict.distancePlaceholder}
              className="w-full bg-[#1A120B] border border-[#3A2C20] focus:border-[#D4A853] text-white rounded-xl px-4 py-3.5 pl-11 text-base focus:outline-none transition-colors"
            />
            <Navigation className="w-5 h-5 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 text-sm font-mono">
              km
            </span>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-[#D4A853] hover:bg-[#E5B963] text-[#1A120B] font-sans font-semibold py-3.5 rounded-xl transition-all duration-200 text-sm tracking-wide shadow-lg shadow-[#D4A853]/10 flex items-center justify-center gap-2 cursor-pointer"
        >
          {dict.calculateBtn}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {calculatedPrice !== null && (
        <div className="mt-8 pt-6 border-t border-[#3A2C20] animate-fadeIn">
          <span className="text-white/50 text-xs uppercase tracking-widest block mb-1">
            {dict.resultTitle}
          </span>
          <div className="flex items-baseline gap-3 mb-2">
            <span className="text-4xl font-serif text-[#D4A853] font-bold">
              {calculatedPrice} MDL
            </span>
            <span className={`text-xs px-2.5 py-1 rounded-full font-mono uppercase tracking-wider ${
              isPedestrian 
                ? 'bg-emerald-950/80 border border-emerald-500/30 text-emerald-400' 
                : 'bg-amber-950/80 border border-amber-500/30 text-amber-300'
            }`}>
              {isPedestrian ? dict.pedestrianBadge : dict.autoBadge}
            </span>
          </div>
          
          <div className="flex items-start gap-2 text-white/60 text-xs leading-relaxed bg-[#1A120B]/60 p-3 rounded-lg border border-[#3A2C20] mb-4">
            <Info className="w-4 h-4 text-[#D4A853] shrink-0 mt-0.5" />
            <span>{dict.disclaimer}</span>
          </div>

          <Link
            href="/menu"
            className="block text-center text-xs font-semibold uppercase tracking-wider text-[#D4A853] hover:text-[#E5B963] transition-colors"
          >
            {dict.orderCta} →
          </Link>
        </div>
      )}
    </div>
  );
}

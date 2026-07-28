"use client";

import React from "react";
import { motion } from "framer-motion";
import { Ticket, Plus, Percent, Copy, Calendar } from "lucide-react";

export default function MarketingPage() {
  const promos = [
    { code: "LUNI20", discount: "20%", type: "Reducere Procentuală", expiry: "Astăzi, 23:59", uses: 45, status: "Activ" },
    { code: "CAFEAGRATIS", discount: "100%", type: "Produs Gratuit (Cafea)", expiry: "31 Aug 2026", uses: 12, status: "Activ" },
    { code: "BUNVENIT", discount: "15%", type: "Reducere Procentuală", expiry: "Nelimitat", uses: 342, status: "Activ" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)] tracking-tight">Marketing & Promoții</h1>
          <p className="text-[var(--foreground)]/60 mt-1">Gestionează codurile de reducere pentru Aplicație, Web și Instagram.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-2.5 rounded-full font-medium bg-[var(--primary)] text-[var(--primary-foreground)] shadow-lg hover:bg-[var(--color-chocolate)] transition-all">
          <Plus className="w-5 h-5" />
          Promoție Nouă
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[var(--primary)] to-[var(--color-chocolate)] p-6 rounded-2xl text-white shadow-lg"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <Percent className="w-6 h-6" />
            </div>
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">Google Ads Sync</span>
          </div>
          <h3 className="text-white/80 font-medium mb-1">Coduri folosite (Luna aceasta)</h3>
          <p className="text-4xl font-bold">399</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-2 bg-[var(--card)] p-6 rounded-2xl border border-[var(--primary)]/10 shadow-sm"
        >
          <h3 className="text-lg font-bold text-[var(--foreground)] mb-6">Promoții Active</h3>
          
          <div className="space-y-4">
            {promos.map((promo, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-[var(--primary)]/10 hover:border-[var(--primary)]/30 transition-colors gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#FCF9F4] text-[#D4A853] flex items-center justify-center border border-[#E8E2D9]">
                    <Ticket className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[var(--foreground)] text-lg flex items-center gap-2">
                      {promo.code}
                      <button className="text-[var(--foreground)]/40 hover:text-[var(--primary)] transition-colors"><Copy className="w-4 h-4" /></button>
                    </h4>
                    <p className="text-sm text-[var(--foreground)]/60">{promo.discount} • {promo.type}</p>
                  </div>
                </div>
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto text-sm text-[var(--foreground)]/60">
                  <div className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Expira: {promo.expiry}</div>
                  <div className="font-bold text-[var(--primary)] mt-1">{promo.uses} utilizări</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

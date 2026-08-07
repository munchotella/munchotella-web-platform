"use client";

import React, { useState, useEffect } from "react";
import LuxuryButton from "@/components/admin/LuxuryButton";
import BentoKpiCard from "@/components/admin/BentoKpiCard";
import StatusBadge from "@/components/admin/StatusBadge";
import { adminFetch } from "@/lib/adminApi";
import { Ticket, Percent, Plus, Share2, AlertCircle } from "lucide-react";

export default function MarketingPage() {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPromos() {
      try {
        setLoading(true);
        const res = await adminFetch("/admin/promoCodes");
        if (res?.success) {
          setPromotions(res.data);
        }
      } catch (err: any) {
        setError(err.message || "Eroare la preluarea promoțiilor");
      } finally {
        setLoading(false);
      }
    }
    loadPromos();
  }, []);

  return (
    <div className="space-y-8 pb-10">
      
      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-warm-border rounded-2xl overflow-hidden border border-warm-border mb-8">
        <BentoKpiCard 
          title="Total Promoții"
          value={promotions.length.toString()}
          trend="Înregistrate în sistem"
          trendPositive={true}
          icon={<Ticket size={24} />}
          className="rounded-none border-0"
        />
        <BentoKpiCard 
          title="Rata de Conversie Promo"
          value="12.4%"
          subtitle="Procentaj comenzi cu cod de reducere (estimat)"
          icon={<Percent size={24} />}
          className="rounded-none border-0"
        />
      </div>

      <div className="flex items-center justify-between">
        <h3 className="font-headline-md text-cacao-dark text-xl">Promoții și Cupoane</h3>
        <LuxuryButton variant="primary" icon={<Plus size={16} />}>Crează Campanie</LuxuryButton>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="w-12 h-12 border-4 border-gold-saffron border-t-transparent rounded-full animate-spin"></div>
          <p className="font-body-md text-cacao-dark/60 animate-pulse">Se preiau campaniile de marketing...</p>
        </div>
      ) : error ? (
        <div className="bg-[#FAF7F2] border border-error/20 p-8 rounded-2xl flex flex-col items-center text-center">
          <AlertCircle size={48} className="text-error mb-4" />
          <h3 className="font-headline-md text-cacao-dark text-xl mb-2">Nu am putut aduce promoțiile</h3>
          <p className="font-body-md text-cacao-dark/70 max-w-md">{error}</p>
        </div>
      ) : (
        <div className="bg-vanilla-porcelain border border-warm-border rounded-2xl overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-6 border-b border-warm-border bg-[#FAF7F2]/50 font-label-caps text-cacao-dark/60 text-xs">
            <div className="col-span-4">Campanie / Cod</div>
            <div className="col-span-3">Ofertă</div>
            <div className="col-span-2 text-center">Utilizări</div>
            <div className="col-span-2 text-center">Status</div>
            <div className="col-span-1 text-right">Acțiuni</div>
          </div>

          <div className="divide-y divide-warm-border/50">
            {promotions.length === 0 ? (
              <div className="p-8 text-center text-cacao-dark/60 font-body-md">Nu există nicio campanie de marketing creată.</div>
            ) : (
              promotions.map((promo) => {
                let statusProps = { status: 'neutral', label: 'Epuizat' };
                if (promo.isActive) statusProps = { status: 'success', label: 'Activ' };
                
                const discountText = promo.discountType === 'percentage' 
                  ? `${promo.discountValue}% Reducere`
                  : `${promo.discountValue} MDL Reducere`;

                return (
                  <div key={promo._id} className="grid grid-cols-12 gap-4 p-6 items-center hover:bg-[#FAF7F2] transition-colors cursor-pointer group">
                    <div className="col-span-4">
                      <div className="font-headline-md text-cacao-dark text-lg">{promo.code}</div>
                      <div className="font-label-caps text-[10px] text-cacao-dark/50 mt-1 uppercase tracking-widest">Creat: {new Date(promo.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div className="col-span-3 font-body-md text-cacao-dark/80">
                      {discountText}
                    </div>
                    <div className="col-span-2 text-center font-body-md text-cacao-dark/70">
                      {promo.usageCount} / {promo.usageLimit || "Nelimitat"}
                    </div>
                    <div className="col-span-2 text-center flex justify-center">
                      <StatusBadge 
                        status={statusProps.status as any} 
                        label={statusProps.label} 
                      />
                    </div>
                    <div className="col-span-1 flex items-center justify-end">
                      <button className="w-8 h-8 rounded-full border border-warm-border flex items-center justify-center text-cacao-dark group-hover:bg-gold-saffron/10 group-hover:border-gold-saffron group-hover:text-gold-saffron transition-colors">
                        <Share2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

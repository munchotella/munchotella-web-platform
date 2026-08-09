"use client";

import React, { useState, useEffect } from "react";
import LuxuryButton from "@/components/admin/LuxuryButton";
import BentoKpiCard from "@/components/admin/BentoKpiCard";
import StatusBadge from "@/components/admin/StatusBadge";
import SlideOver from "@/components/admin/SlideOver";
import { adminFetch } from "@/lib/adminApi";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import { Ticket, Percent, Plus, Share2, AlertCircle } from "lucide-react";

export default function MarketingPage() {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [isSlideOverOpen, setSlideOverOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [usageLimit, setUsageLimit] = useState("");

  const loadPromos = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminFetch("/admin/promoCodes");
      if (res?.success) {
        setPromotions(res.data.promoCodes || res.data || []);
      }
    } catch (err: any) {
      const msg = err.message || "Eroare la preluarea promoțiilor";
      if (msg.includes("autentificat") || msg.includes("401") || msg.includes("Unauthorized")) {
        localStorage.removeItem("munchotella_token");
        localStorage.removeItem("munchotella_user");
        window.dispatchEvent(new Event("storage"));
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPromos();
  }, []);

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !discountValue) {
      alert("Codul și valoarea reducerii sunt obligatorii.");
      return;
    }

    try {
      setSaving(true);
      await adminFetch("/admin/promoCodes", {
        method: "POST",
        body: JSON.stringify({
          code: code.toUpperCase().trim(),
          discountType,
          discountValue: Number(discountValue),
          usageLimit: usageLimit ? Number(usageLimit) : null,
          isActive: true,
        }),
      });

      setSlideOverOpen(false);
      setCode("");
      setDiscountValue("");
      setUsageLimit("");
      await loadPromos();
    } catch (err: any) {
      alert("Eroare la crearea promoției: " + (err.message || "Apel eșuat"));
    } finally {
      setSaving(false);
    }
  };

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
        <LuxuryButton 
          variant="primary" 
          icon={<Plus size={16} />}
          onClick={() => setSlideOverOpen(true)}
        >
          Crează Campanie
        </LuxuryButton>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="w-12 h-12 border-4 border-gold-saffron border-t-transparent rounded-full animate-spin"></div>
          <p className="font-body-md text-cacao-dark/60 animate-pulse">Se preiau campaniile de marketing...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4 bg-vanilla-porcelain border border-warm-border rounded-2xl">
          <AlertCircle size={48} className="text-cacao-dark/20" />
          <h3 className="font-headline-md text-xl text-cacao-dark">Eroare Marketing</h3>
          <p className="font-body-md text-cacao-dark/60">{error}</p>
          <LuxuryButton onClick={loadPromos}>Reîncearcă</LuxuryButton>
        </div>
      ) : (
        <div className="bg-vanilla-porcelain border border-warm-border rounded-2xl overflow-hidden overflow-x-auto">
          <div className="min-w-[800px]">
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
                      {promo.usageCount || 0} / {promo.usageLimit || "Nelimitat"}
                    </div>
                    <div className="col-span-2 text-center flex justify-center">
                      <StatusBadge 
                        status={statusProps.status as any} 
                        label={statusProps.label} 
                      />
                    </div>
                    <div className="col-span-1 flex items-center justify-end">
                      <button 
                        onClick={() => alert(`Cod promoțional: ${promo.code}\nReducere: ${discountText}`)}
                        className="w-8 h-8 rounded-full border border-warm-border flex items-center justify-center text-cacao-dark group-hover:bg-gold-saffron/10 group-hover:border-gold-saffron group-hover:text-gold-saffron transition-colors cursor-pointer"
                      >
                        <Share2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          </div>
        </div>
      )}

      <SlideOver
        isOpen={isSlideOverOpen}
        onClose={() => setSlideOverOpen(false)}
        title="Campanie Promoțională Nouă"
      >
        <form onSubmit={handleCreatePromo} className="space-y-6">
          <div>
            <label className="block font-label-caps text-cacao-dark/60 text-xs mb-2">Cod Promoțional *</label>
            <input 
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full bg-vanilla-porcelain border border-warm-border rounded-lg p-3 font-body-md text-cacao-dark uppercase focus:outline-none focus:border-gold-saffron transition-colors"
              placeholder="Ex: PROMO2026"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-label-caps text-cacao-dark/60 text-xs mb-2">Tip Reducere</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
                className="w-full bg-vanilla-porcelain border border-warm-border rounded-lg p-3 font-body-md text-cacao-dark focus:outline-none focus:border-gold-saffron transition-colors"
              >
                <option value="percentage">Procentuală (%)</option>
                <option value="fixed">Sumă Fixă (MDL)</option>
              </select>
            </div>
            <div>
              <label className="block font-label-caps text-cacao-dark/60 text-xs mb-2">Valoare *</label>
              <input 
                type="number"
                required
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                className="w-full bg-vanilla-porcelain border border-warm-border rounded-lg p-3 font-body-md text-cacao-dark focus:outline-none focus:border-gold-saffron transition-colors"
                placeholder="Ex: 15"
              />
            </div>
          </div>
          <div>
            <label className="block font-label-caps text-cacao-dark/60 text-xs mb-2">Limită Utilizări (Opțional)</label>
            <input 
              type="number"
              value={usageLimit}
              onChange={(e) => setUsageLimit(e.target.value)}
              className="w-full bg-vanilla-porcelain border border-warm-border rounded-lg p-3 font-body-md text-cacao-dark focus:outline-none focus:border-gold-saffron transition-colors"
              placeholder="Lăsați gol pentru nelimitat"
            />
          </div>
          <div className="pt-6 border-t border-warm-border mt-8">
            <LuxuryButton variant="primary" className="w-full" disabled={saving}>
              {saving ? "Se creează..." : "Publică Cuponul"}
            </LuxuryButton>
          </div>
        </form>
      </SlideOver>
    </div>
  );
}

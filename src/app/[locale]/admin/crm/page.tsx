"use client";

import React, { useState, useEffect } from "react";
import LuxuryButton from "@/components/admin/LuxuryButton";
import BentoKpiCard from "@/components/admin/BentoKpiCard";
import StatusBadge from "@/components/admin/StatusBadge";
import { adminFetch } from "@/lib/adminApi";
import { Users, Star, Gift, ChevronRight, Award, AlertCircle } from "lucide-react";

export default function CrmPage() {
  const [guests, setGuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadGuests() {
      try {
        setLoading(true);
        const res = await adminFetch("/admin/users");
        if (res?.success) {
          setGuests(res.data);
        }
      } catch (err: any) {
        setError(err.message || "Eroare la preluarea oaspeților");
      } finally {
        setLoading(false);
      }
    }
    loadGuests();
  }, []);

  return (
    <div className="space-y-8 pb-10">
      
      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px] bg-warm-border rounded-2xl overflow-hidden border border-warm-border mb-8">
        <BentoKpiCard 
          title="Total Oaspeți"
          value={guests.length.toString()}
          trend="Înregistrați în platformă"
          trendPositive={true}
          icon={<Users size={24} />}
          className="rounded-none border-0"
        />
        <BentoKpiCard 
          title="Oaspeți VIP (Recurenți)"
          value="184"
          subtitle="Programe de fidelitate active (estimat)"
          icon={<Award size={24} />}
          className="rounded-none border-0"
        />
        <BentoKpiCard 
          title="Rata de Întoarcere"
          value="68%"
          trend="+5% față de luna trecută"
          trendPositive={true}
          icon={<Star size={24} />}
          className="rounded-none border-0"
        />
      </div>

      <div className="flex items-center justify-between">
        <h3 className="font-headline-md text-cacao-dark text-xl">Oaspeți Recenți</h3>
        <LuxuryButton variant="outline" icon={<Gift size={16} />}>Trimite Surpriză VIP</LuxuryButton>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="w-12 h-12 border-4 border-gold-saffron border-t-transparent rounded-full animate-spin"></div>
          <p className="font-body-md text-cacao-dark/60 animate-pulse">Se preiau profilele oaspeților...</p>
        </div>
      ) : error ? (
        <div className="bg-[#FAF7F2] border border-error/20 p-8 rounded-2xl flex flex-col items-center text-center">
          <AlertCircle size={48} className="text-error mb-4" />
          <h3 className="font-headline-md text-cacao-dark text-xl mb-2">Nu am putut aduce clienții</h3>
          <p className="font-body-md text-cacao-dark/70 max-w-md">{error}</p>
        </div>
      ) : (
        <div className="bg-vanilla-porcelain border border-warm-border rounded-2xl overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-6 border-b border-warm-border bg-[#FAF7F2]/50 font-label-caps text-cacao-dark/60 text-xs">
            <div className="col-span-4">Oaspete</div>
            <div className="col-span-3">Contact</div>
            <div className="col-span-3 text-center">Rol</div>
            <div className="col-span-2 text-right">Acțiuni</div>
          </div>

          <div className="divide-y divide-warm-border/50">
            {guests.length === 0 ? (
              <div className="p-8 text-center text-cacao-dark/60 font-body-md">Nu există niciun client înregistrat.</div>
            ) : (
              guests.map((guest) => {
                const initial = guest.name ? guest.name.charAt(0).toUpperCase() : '?';
                return (
                  <div key={guest._id} className="grid grid-cols-12 gap-4 p-6 items-center hover:bg-[#FAF7F2] transition-colors cursor-pointer group">
                    <div className="col-span-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gold-saffron/10 border border-gold-saffron/30 flex items-center justify-center font-headline-md text-gold-saffron">
                        {initial}
                      </div>
                      <div>
                        <div className="font-body-md font-medium text-cacao-dark">{guest.name || "Anonim"}</div>
                        <div className="font-label-caps text-[10px] text-cacao-dark/50 mt-1">
                          Creat: {new Date(guest.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="col-span-3 font-body-md text-cacao-dark/80">
                      {guest.email}
                    </div>
                    <div className="col-span-3 text-center flex justify-center">
                      <StatusBadge 
                        status={guest.role === 'admin' ? 'warning' : 'success'} 
                        label={guest.role === 'admin' ? 'Administrator' : 'Client'} 
                      />
                    </div>
                    <div className="col-span-2 flex items-center justify-end gap-4">
                      <ChevronRight size={18} className="text-cacao-dark/30 group-hover:text-gold-saffron transition-colors" />
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

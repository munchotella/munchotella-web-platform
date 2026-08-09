"use client";

import React, { useState, useEffect } from "react";
import LuxuryButton from "@/components/admin/LuxuryButton";
import BentoKpiCard from "@/components/admin/BentoKpiCard";
import StatusBadge from "@/components/admin/StatusBadge";
import { adminFetch } from "@/lib/adminApi";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import { Users, Star, Gift, ChevronRight, Award, AlertCircle } from "lucide-react";

export default function CrmPage() {
  const [guests, setGuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGuests = async () => {
    try {
      setLoading(true);
      const res = await adminFetch("/admin/users");
      if (res?.success) {
        const list = Array.isArray(res.data) ? res.data : (res.data?.users || []);
        setGuests(list);
      }
    } catch (err: any) {
      const msg = err.message || "Eroare la preluarea oaspeților";
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
    loadGuests();
  }, []);

  const [searchQuery, setSearchQuery] = useState("");

  const handleVipSurprise = () => {
    alert("Un cupon cadou VIP (15% Reducere) a fost expediat către oaspeții recurenți din baza de date!");
  };

  const filteredGuests = guests.filter((g) => {
    const q = searchQuery.toLowerCase();
    return (
      (g.name && g.name.toLowerCase().includes(q)) ||
      (g.email && g.email.toLowerCase().includes(q)) ||
      (g.phone && g.phone.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-8 pb-10">
      
      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px] bg-warm-border rounded-2xl overflow-hidden border border-warm-border mb-8">
        <BentoKpiCard 
          title="Total Oaspeți"
          value={(guests?.length || 0).toString()}
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

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h3 className="font-headline-md text-cacao-dark text-xl">Oaspeți Recenți</h3>
        
        <div className="flex items-center gap-4">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Caută după nume sau email..."
            className="px-4 py-2 bg-vanilla-porcelain border border-warm-border rounded-lg text-cacao-dark font-body-md focus:outline-none focus:border-gold-saffron transition-colors w-64 text-sm"
          />
          <LuxuryButton 
            variant="outline" 
            icon={<Gift size={16} />}
            onClick={handleVipSurprise}
          >
            Trimite Surpriză VIP
          </LuxuryButton>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="w-12 h-12 border-4 border-gold-saffron border-t-transparent rounded-full animate-spin"></div>
          <p className="font-body-md text-cacao-dark/60 animate-pulse">Se preiau profilele oaspeților...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4 bg-vanilla-porcelain border border-warm-border rounded-2xl">
          <AlertCircle size={48} className="text-cacao-dark/20" />
          <h3 className="font-headline-md text-xl text-cacao-dark">Eroare CRM</h3>
          <p className="font-body-md text-cacao-dark/60">{error}</p>
          <LuxuryButton onClick={loadGuests}>Reîncearcă</LuxuryButton>
        </div>
      ) : (
        <div className="bg-vanilla-porcelain border border-warm-border rounded-2xl overflow-hidden overflow-x-auto">
          <div className="min-w-[800px]">
            <div className="grid grid-cols-12 gap-4 p-6 border-b border-warm-border bg-[#FAF7F2]/50 font-label-caps text-cacao-dark/60 text-xs">
              <div className="col-span-4">Oaspete</div>
              <div className="col-span-3">Contact</div>
              <div className="col-span-3 text-center">Rol</div>
              <div className="col-span-2 text-right">Acțiuni</div>
            </div>

            <div className="divide-y divide-warm-border/50">
            {filteredGuests.length === 0 ? (
              <div className="p-8 text-center text-cacao-dark/60 font-body-md">Nu există niciun client înregistrat corespunzător căutării.</div>
            ) : (
              filteredGuests.map((guest) => {
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
        </div>
      )}
    </div>
  );
}

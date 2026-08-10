"use client";

import React, { useEffect, useState } from "react";
import BentoKpiCard from "@/components/admin/BentoKpiCard";
import StatusBadge from "@/components/admin/StatusBadge";
import LuxuryButton from "@/components/admin/LuxuryButton";
import { adminFetch } from "@/lib/adminApi";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import { TrendingUp, Clock, Store, Wallet, ChefHat, AlertCircle } from "lucide-react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [liveOrders, setLiveOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  if (typeof window !== "undefined") {
    console.log("VERCEL_BUILD_SUCCESS_98765");
  }

  const playOrderChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    } catch (e) {}
  };

  const loadDashboardData = async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      setError(null);
      const [statsRes, ordersRes] = await Promise.all([
        adminFetch("/admin/stats"),
        adminFetch("/orders/admin/live")
      ]);
      
      if (statsRes?.data) setStats(statsRes.data);
      if (ordersRes?.data) {
        const newOrders = ordersRes.data.slice(0, 5);
        setLiveOrders((prevOrders) => {
          if (prevOrders.length > 0 && newOrders.length > 0) {
            const hasNew = newOrders.some((no: any) => !prevOrders.some((po: any) => po._id === no._id));
            if (hasNew) {
              playOrderChime();
            }
          }
          return newOrders;
        });
      }
    } catch (err: any) {
      const msg = err.message || "Eroare la preluarea datelor";
      if (!msg.includes("expirat") && isInitial) {
        setError(msg);
      }
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData(true);
    const interval = setInterval(() => {
      loadDashboardData(false);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="w-12 h-12 border-4 border-gold-saffron border-t-transparent rounded-full animate-spin"></div>
        <p className="font-body-md text-cacao-dark/60 animate-pulse">Se preiau datele sigure...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4 bg-vanilla-porcelain border border-warm-border rounded-2xl">
        <AlertCircle size={48} className="text-cacao-dark/20" />
        <h3 className="font-headline-md text-xl text-cacao-dark">Eroare la preluarea datelor</h3>
        <p className="font-body-md text-cacao-dark/60">{error}</p>
        <LuxuryButton onClick={loadDashboardData}>Reîncearcă</LuxuryButton>
      </div>
    );
  }

  const activeOrdersCount = liveOrders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length;

  return (
    <div className="space-y-8 pb-10">
      
      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-[1px] bg-warm-border rounded-2xl overflow-hidden border border-warm-border">
        
        {/* Large KPI Card */}
        <BentoKpiCard 
          title="Încasări Totale"
          value={`${stats?.totalRevenue || 0} MDL`}
          trend={`${stats?.totalOrders || 0} Comenzi procesate în total`}
          trendPositive={true}
          icon={<Wallet size={24} />}
          className="md:col-span-2 rounded-none border-0"
        />

        <BentoKpiCard 
          title="Clienți / Oaspeți"
          value={stats?.totalUsers || 0}
          subtitle="Înregistrați în platformă"
          icon={<Store size={24} />}
          className="rounded-none border-0"
        />

        <BentoKpiCard 
          title="Promoții Active"
          value={stats?.activePromoCodes || 0}
          trend="Cupoane live"
          trendPositive={true}
          icon={<TrendingUp size={24} />}
          className="rounded-none border-0"
        />
      </div>

      {/* Live Orders Section */}
      <section className="bg-vanilla-porcelain border border-warm-border rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-headline-md text-cacao-dark text-xl">Ultimele Comenzi ({activeOrdersCount} active)</h3>
          <LuxuryButton variant="outline" className="scale-90 origin-right">
            Vezi Tot Istoricul
          </LuxuryButton>
        </div>

        <div className="flex flex-col gap-[1px] bg-warm-border rounded-xl border border-warm-border overflow-hidden">
          
          {liveOrders.length === 0 ? (
            <div className="bg-vanilla-porcelain p-8 text-center">
              <p className="font-body-md text-cacao-dark/60">Nu există comenzi recente în ultimele 24h.</p>
            </div>
          ) : (
            liveOrders.map(order => {
              const orderId = (order._id || "UNKNOWN").substring((order._id || "UNKNOWN").length - 4).toUpperCase();
              const time = order.createdAt ? new Date(order.createdAt).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }) : "Acum";
              
              // Simplify items text
              const itemsText = (order.items || []).map((i: any) => `${i.quantity || 1}x ${i.variantName || i.name || "Preparat"}`).join(', ');
              
              // Map status
              let statusProps = { status: 'neutral', label: order.status };
              if (order.status === 'pending') statusProps = { status: 'warning', label: 'Nouă' };
              if (order.status === 'preparing') statusProps = { status: 'warning', label: 'Pe plită' };
              if (order.status === 'ready') statusProps = { status: 'success', label: 'Gata de Livrare' };
              if (order.status === 'delivering') statusProps = { status: 'success', label: 'Pe drum' };
              if (order.status === 'delivered') statusProps = { status: 'neutral', label: 'Livrată' };
              
              return (
                <div key={order._id} className="bg-vanilla-porcelain p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#FAF7F2] transition-colors cursor-pointer group">
                  <div className="flex items-start md:items-center gap-4 md:gap-6">
                    <div className="text-left md:text-center shrink-0">
                      <div className="font-headline-md text-cacao-dark text-lg md:text-xl">#{orderId}</div>
                      <div className="font-label-caps text-[10px] text-cacao-dark/50">{time}</div>
                    </div>
                    <div>
                      <div className="font-body-md font-medium text-cacao-dark max-w-sm truncate whitespace-normal md:whitespace-nowrap line-clamp-2 md:line-clamp-none">{itemsText}</div>
                      <div className="font-body-md text-sm text-cacao-dark/60 mt-1">
                        {order.deliveryInfo?.name || "Oaspete"} • {order.paymentMethod === 'cash' ? 'Cash' : 'Card'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between md:justify-end gap-4 md:gap-6 w-full md:w-auto pt-4 md:pt-0 border-t md:border-0 border-warm-border">
                    <div className="font-headline-md text-gold-saffron text-lg md:text-xl">{order.totalPrice} MDL</div>
                    <div className="flex items-center gap-4">
                      <StatusBadge status={statusProps.status as any} label={statusProps.label} />
                      <button className="w-8 h-8 rounded-full border border-warm-border flex items-center justify-center text-cacao-dark group-hover:bg-gold-saffron/10 group-hover:border-gold-saffron group-hover:text-gold-saffron transition-colors shrink-0">
                        <ChefHat size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}

        </div>
      </section>

    </div>
  );
}

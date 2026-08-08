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

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsRes, ordersRes] = await Promise.all([
        adminFetch("/admin/stats"),
        adminFetch("/orders/admin/live")
      ]);
      
      if (statsRes?.data) setStats(statsRes.data);
      if (ordersRes?.data) setLiveOrders(ordersRes.data.slice(0, 5));
    } catch (err: any) {
      const msg = err.message || "Eroare de autentificare";
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
    loadDashboardData();
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
    return <AdminLoginForm onSuccess={loadDashboardData} />;
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
              const orderId = order._id.substring(order._id.length - 4).toUpperCase();
              const time = new Date(order.createdAt).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });
              
              // Simplify items text
              const itemsText = order.items.map((i: any) => `${i.quantity}x ${i.variantName}`).join(', ');
              
              // Map status
              let statusProps = { status: 'neutral', label: order.status };
              if (order.status === 'pending') statusProps = { status: 'warning', label: 'Nouă' };
              if (order.status === 'preparing') statusProps = { status: 'warning', label: 'Pe plită' };
              if (order.status === 'ready') statusProps = { status: 'success', label: 'Gata de Livrare' };
              if (order.status === 'delivering') statusProps = { status: 'success', label: 'Pe drum' };
              if (order.status === 'delivered') statusProps = { status: 'neutral', label: 'Livrată' };
              
              return (
                <div key={order._id} className="bg-vanilla-porcelain p-4 flex items-center justify-between hover:bg-[#FAF7F2] transition-colors cursor-pointer group">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="font-headline-md text-cacao-dark text-lg">#{orderId}</div>
                      <div className="font-label-caps text-[10px] text-cacao-dark/50">{time}</div>
                    </div>
                    <div>
                      <div className="font-body-md font-medium text-cacao-dark max-w-sm truncate">{itemsText}</div>
                      <div className="font-body-md text-sm text-cacao-dark/60 mt-1">
                        {order.deliveryInfo?.name || "Oaspete"} • {order.paymentMethod === 'cash' ? 'Cash' : 'Card'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="font-headline-md text-gold-saffron text-lg">{order.totalPrice} MDL</div>
                    <StatusBadge status={statusProps.status as any} label={statusProps.label} />
                    <button className="w-8 h-8 rounded-full border border-warm-border flex items-center justify-center text-cacao-dark group-hover:bg-gold-saffron/10 group-hover:border-gold-saffron group-hover:text-gold-saffron transition-colors">
                      <ChefHat size={14} />
                    </button>
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

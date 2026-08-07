"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  CreditCard,
  ArrowUpRight,
  Loader2,
  RefreshCw,
  Tag,
  Star
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface AdminStats {
  totalOrders: number;
  totalUsers: number;
  activePromoCodes: number;
  revenue: number;
  revenueByDay: Array<{ _id: string; revenue: number }>;
  topProducts: Array<{ _id: string; name: string; sales: number }>;
}

export default function AnalyticsDashboard() {
  const { token, user } = useAuth();
  const [statsData, setStatsData] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = "https://munchotella-api.onrender.com/api";

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/admin/stats`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setStatsData(data.data);
      } else {
        throw new Error(data.message || "Eroare la încărcarea datelor admin.");
      }
    } catch (err: any) {
      console.error("Admin stats fetch error:", err);
      setError(err.message || "Imposibil de conectat la serverul backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchStats();
    } else {
      setLoading(false);
    }
  }, [token]);

  const revenueDisplay = statsData ? `${statsData.revenue.toLocaleString()} MDL` : "0 MDL";
  const ordersDisplay = statsData ? statsData.totalOrders.toString() : "0";
  const usersDisplay = statsData ? statsData.totalUsers.toString() : "0";
  const promoDisplay = statsData ? statsData.activePromoCodes.toString() : "0";

  const stats = [
    { title: "Încasări Livrate", value: revenueDisplay, trend: "Live MongoDB", isPositive: true, icon: CreditCard },
    { title: "Comenzi Totale", value: ordersDisplay, trend: "Real Time", isPositive: true, icon: ShoppingBag },
    { title: "Clienți Înregistrați", value: usersDisplay, trend: "Comunitate", isPositive: true, icon: Users },
    { title: "Cuponuri Active", value: promoDisplay, trend: "Campanii", isPositive: true, icon: Tag },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-[var(--foreground)] tracking-tight">Analytics & Vânzări Real Time</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-500/10 text-green-600 border border-green-500/20">MongoDB Live</span>
          </div>
          <p className="text-[var(--foreground)]/60 mt-1">Sincronizare directă cu ecosistemul Munchotella Web & Mobile App.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchStats}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-[var(--card)] border border-[var(--primary)]/10 text-[var(--foreground)] hover:bg-[var(--primary)]/5 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizează Datele
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm">
          {error} (Verifică dacă ești autentificat cu un cont de administrator).
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[var(--card)] p-6 rounded-2xl border border-[var(--primary)]/10 shadow-sm relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#D4A853]/10 text-[#D4A853] flex items-center justify-center">
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-[#D4A853] bg-[#D4A853]/10 px-2.5 py-1 rounded-full">
                {stat.trend}
              </div>
            </div>
            <h3 className="text-[var(--foreground)]/60 font-medium text-sm mb-1">{stat.title}</h3>
            {loading ? (
              <div className="h-9 flex items-center">
                <Loader2 className="w-5 h-5 animate-spin text-[#D4A853]" />
              </div>
            ) : (
              <p className="text-3xl font-bold text-[var(--foreground)] tracking-tight">{stat.value}</p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Real Charts & Analytics Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue by Day Breakdown */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-[var(--card)] p-6 rounded-2xl border border-[var(--primary)]/10 shadow-sm min-h-[350px] flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-[var(--foreground)]">Vânzări per Zi (Ultimele Zile)</h3>
              <p className="text-xs text-[var(--foreground)]/60">Extrase din comenzile livrate în MongoDB</p>
            </div>
            <TrendingUp className="w-5 h-5 text-[#D4A853]" />
          </div>
          
          <div className="flex-1 flex items-end gap-3 pt-8 pb-4 border-b border-[var(--primary)]/10">
            {statsData?.revenueByDay && statsData.revenueByDay.length > 0 ? (
              statsData.revenueByDay.map((day, idx) => {
                const maxRev = Math.max(...statsData.revenueByDay.map(d => d.revenue), 1);
                const heightPercent = Math.max(15, Math.round((day.revenue / maxRev) * 100));
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className="text-[11px] font-bold text-[#D4A853] opacity-0 group-hover:opacity-100 transition-opacity">
                      {day.revenue} MDL
                    </span>
                    <div 
                      style={{ height: `${heightPercent}%` }} 
                      className="w-full bg-[#1A120B] group-hover:bg-[#D4A853] rounded-t-lg transition-all duration-300 min-h-[20px]"
                    />
                    <span className="text-[10px] text-[var(--foreground)]/60 font-mono truncate max-w-full">
                      {day._id.split('-').slice(1).join('/')}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="w-full text-center py-12 text-[var(--foreground)]/40 text-sm">
                Nu există date de vânzări recente înregistrate.
              </div>
            )}
          </div>
        </motion.div>

        {/* Top Selling Products */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-[var(--card)] p-6 rounded-2xl border border-[var(--primary)]/10 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-[var(--foreground)]">Top Produse Vandute</h3>
            <Star className="w-5 h-5 text-[#D4A853]" />
          </div>
          
          <div className="space-y-4">
            {statsData?.topProducts && statsData.topProducts.length > 0 ? (
              statsData.topProducts.map((prod, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[var(--background)]/50 border border-[var(--primary)]/10">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#D4A853]/20 text-[#D4A853] font-bold text-xs flex items-center justify-center">
                      #{i + 1}
                    </span>
                    <p className="font-bold text-[var(--foreground)] text-sm">{prod.name || "Produs Munchotella"}</p>
                  </div>
                  <span className="font-bold text-[#D4A853] text-sm bg-[#D4A853]/10 px-2.5 py-1 rounded-full">
                    {prod.sales} buc
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-[var(--foreground)]/40 text-sm">
                Produsele cele mai vândute vor apărea aici.
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

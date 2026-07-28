"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  CreditCard,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

export default function AnalyticsDashboard() {
  const stats = [
    { title: "Încasări Azi", value: "4,250 MDL", trend: "+12%", isPositive: true, icon: CreditCard },
    { title: "Comenzi (Web+App+IG)", value: "124", trend: "+5%", isPositive: true, icon: ShoppingBag },
    { title: "Clienți Noi", value: "18", trend: "-2%", isPositive: false, icon: Users },
    { title: "Ticket Mediu", value: "135 MDL", trend: "+8%", isPositive: true, icon: TrendingUp },
  ];

  const recentOrders = [
    { id: "#1024", customer: "Andrei Popa", source: "Instagram AI", amount: "250 MDL", status: "Livrat", time: "Acum 5 min" },
    { id: "#1023", customer: "Maria Ionescu", source: "Aplicație Nativă", amount: "120 MDL", status: "În preparare", time: "Acum 12 min" },
    { id: "#1022", customer: "Masa 5", source: "Meniu QR", amount: "340 MDL", status: "Finalizat", time: "Acum 45 min" },
    { id: "#1021", customer: "Ion Vasile", source: "Aplicație Nativă", amount: "85 MDL", status: "Livrat", time: "Acum 1 oră" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)] tracking-tight">Analytics & Vânzări</h1>
          <p className="text-[var(--foreground)]/60 mt-1">O privire de ansamblu asupra ecosistemului Munchotella.</p>
        </div>
        <div className="flex bg-[var(--card)] p-1 rounded-lg border border-[var(--primary)]/10">
          <button className="px-4 py-1.5 rounded-md text-sm font-medium bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm">Azi</button>
          <button className="px-4 py-1.5 rounded-md text-sm font-medium text-[var(--foreground)]/60 hover:text-[var(--foreground)]">7 Zile</button>
          <button className="px-4 py-1.5 rounded-md text-sm font-medium text-[var(--foreground)]/60 hover:text-[var(--foreground)]">30 Zile</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[var(--card)] p-6 rounded-2xl border border-[var(--primary)]/10 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center">
                <stat.icon className="w-6 h-6" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-bold ${stat.isPositive ? 'text-[#D4A853]' : 'text-red-500'}`}>
                {stat.trend}
                {stat.isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              </div>
            </div>
            <h3 className="text-[var(--foreground)]/60 font-medium mb-1">{stat.title}</h3>
            <p className="text-3xl font-bold text-[var(--foreground)]">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Charts Area & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fake Chart Area */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-[var(--card)] p-6 rounded-2xl border border-[var(--primary)]/10 shadow-sm min-h-[400px] flex flex-col"
        >
          <h3 className="text-lg font-bold text-[var(--foreground)] mb-6">Evoluție Vânzări</h3>
          <div className="flex-1 border-2 border-dashed border-[var(--primary)]/10 rounded-xl flex items-center justify-center bg-[var(--background)]/50">
            <span className="text-[var(--foreground)]/40 font-medium">Grafic Interactiv (Recharts/Chart.js)</span>
          </div>
        </motion.div>

        {/* Recent Orders List */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-[var(--card)] p-6 rounded-2xl border border-[var(--primary)]/10 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-[var(--foreground)]">Ultimele Comenzi</h3>
            <button className="text-[var(--primary)] text-sm font-medium hover:underline">Vezi tot</button>
          </div>
          
          <div className="space-y-4">
            {recentOrders.map((order, i) => (
              <div key={i} className="flex items-start justify-between p-3 rounded-xl hover:bg-[var(--primary)]/5 transition-colors cursor-pointer border border-transparent hover:border-[var(--primary)]/10">
                <div>
                  <p className="font-bold text-[var(--foreground)] text-sm">{order.customer}</p>
                  <p className="text-xs text-[var(--foreground)]/50 flex items-center gap-1 mt-0.5">
                    {order.id} <span className="w-1 h-1 rounded-full bg-[var(--primary)]"></span> {order.source}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[var(--primary)] text-sm">{order.amount}</p>
                  <p className="text-xs text-[var(--foreground)]/50 mt-0.5">{order.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

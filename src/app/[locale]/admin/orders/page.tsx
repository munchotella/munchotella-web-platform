"use client";

import React, { useState, useEffect } from "react";
import LuxuryButton from "@/components/admin/LuxuryButton";
import StatusBadge from "@/components/admin/StatusBadge";
import { adminFetch } from "@/lib/adminApi";
import { Filter, Search, ChevronRight, AlertCircle } from "lucide-react";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);
        const res = await adminFetch("/orders/admin/all?period=month"); // fetch latest month
        if (res?.success) {
          setOrders(res.data);
        }
      } catch (err: any) {
        setError(err.message || "Eroare la preluarea comenzilor");
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  return (
    <div className="space-y-8 pb-10">
      
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-cacao-dark/40" size={18} />
          <input 
            type="text" 
            placeholder="Caută comandă sau oaspete..." 
            className="pl-12 pr-6 py-3 bg-vanilla-porcelain border border-warm-border rounded-lg text-cacao-dark font-body-md focus:outline-none focus:border-gold-saffron transition-colors w-80"
          />
        </div>
        <div className="flex items-center gap-4">
          <LuxuryButton variant="outline" icon={<Filter size={16} />}>Filtrează</LuxuryButton>
          <LuxuryButton variant="primary">Comandă Nouă Manuală</LuxuryButton>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="w-12 h-12 border-4 border-gold-saffron border-t-transparent rounded-full animate-spin"></div>
          <p className="font-body-md text-cacao-dark/60 animate-pulse">Se preiau arhivele cu comenzi...</p>
        </div>
      ) : error ? (
        <div className="bg-[#FAF7F2] border border-error/20 p-8 rounded-2xl flex flex-col items-center text-center">
          <AlertCircle size={48} className="text-error mb-4" />
          <h3 className="font-headline-md text-cacao-dark text-xl mb-2">Nu am putut aduce comenzile</h3>
          <p className="font-body-md text-cacao-dark/70 max-w-md">{error}</p>
        </div>
      ) : (
        <div className="bg-vanilla-porcelain border border-warm-border rounded-2xl overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 p-6 border-b border-warm-border bg-[#FAF7F2]/50 font-label-caps text-cacao-dark/60 text-xs">
            <div className="col-span-2">Comandă</div>
            <div className="col-span-4">Detalii Produse</div>
            <div className="col-span-2">Oaspete</div>
            <div className="col-span-2 text-right">Total</div>
            <div className="col-span-2 text-right">Status</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-warm-border/50">
            {orders.length === 0 ? (
              <div className="p-8 text-center text-cacao-dark/60 font-body-md">Nu există comenzi.</div>
            ) : (
              orders.map((order) => {
                const orderId = order._id.substring(order._id.length - 4).toUpperCase();
                const time = new Date(order.createdAt).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' });
                const itemsText = order.items.map((i: any) => `${i.quantity || 1}x ${i.name || i.variantName || i.title || "Preparat"}`).join(', ');
                const guestName = order.customer?.name || order.deliveryInfo?.name || order.user?.name || "Oaspete";
                
                let statusProps = { status: 'neutral', label: order.status };
                if (order.status === 'pending') statusProps = { status: 'warning', label: 'Nouă' };
                if (order.status === 'preparing') statusProps = { status: 'warning', label: 'Pe plită' };
                if (order.status === 'ready') statusProps = { status: 'success', label: 'Gata de Livrare' };
                if (order.status === 'delivering') statusProps = { status: 'success', label: 'Pe drum' };
                if (order.status === 'delivered') statusProps = { status: 'neutral', label: 'Livrată' };
                
                return (
                  <div key={order._id} className="grid grid-cols-12 gap-4 p-6 items-center hover:bg-[#FAF7F2] transition-colors cursor-pointer group">
                    <div className="col-span-2">
                      <div className="font-headline-md text-cacao-dark text-lg">#{orderId}</div>
                      <div className="font-label-caps text-[10px] text-cacao-dark/50 mt-1">{time}</div>
                    </div>
                    <div className="col-span-4 font-body-md text-cacao-dark font-medium pr-4 truncate">
                      {itemsText}
                    </div>
                    <div className="col-span-2 font-body-md text-cacao-dark/70">
                      {guestName}
                      <div className="text-xs text-cacao-dark/40 mt-1">{order.paymentMethod === 'cash' ? 'Cash' : 'Card'}</div>
                    </div>
                    <div className="col-span-2 text-right font-headline-md text-cacao-dark text-lg">
                      {order.totalPrice} MDL
                    </div>
                    <div className="col-span-2 flex items-center justify-end gap-4">
                      <StatusBadge status={statusProps.status as any} label={statusProps.label} />
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

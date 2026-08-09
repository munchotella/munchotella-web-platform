"use client";

import React, { useState, useEffect } from "react";
import LuxuryButton from "@/components/admin/LuxuryButton";
import StatusBadge from "@/components/admin/StatusBadge";
import { adminFetch } from "@/lib/adminApi";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import { Filter, Search, ChevronRight, AlertCircle, RefreshCw } from "lucide-react";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await adminFetch("/orders/admin/all?period=month");
      if (res?.success) {
        setOrders(res.data);
      }
    } catch (err: any) {
      const msg = err.message || "Eroare la preluarea comenzilor";
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
    loadOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, currentStatus: string) => {
    const nextStatusMap: Record<string, string> = {
      pending: "preparing",
      preparing: "ready",
      ready: "delivering",
      delivering: "delivered",
      delivered: "pending",
    };
    const nextStatus = nextStatusMap[currentStatus] || "preparing";

    try {
      setUpdatingId(orderId);
      await adminFetch(`/orders/${orderId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: nextStatus }),
      });
      await loadOrders();
    } catch (err: any) {
      alert("Nu s-a putut schimba statusul: " + (err.message || "Apel eșuat"));
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const guestName = (order.customer?.name || order.deliveryInfo?.name || order.user?.name || "").toLowerCase();
    const itemsText = (order.items || []).map((i: any) => i.name || i.variantName || "").join(" ").toLowerCase();
    const orderId = (order._id || "").toLowerCase();
    const q = searchQuery.toLowerCase();

    const matchesSearch = guestName.includes(q) || itemsText.includes(q) || orderId.includes(q);
    const matchesStatus = selectedStatusFilter === "all" || order.status === selectedStatusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 pb-10">
      
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-cacao-dark/40" size={18} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Caută comandă sau oaspete..." 
            className="pl-12 pr-6 py-3 bg-vanilla-porcelain border border-warm-border rounded-lg text-cacao-dark font-body-md focus:outline-none focus:border-gold-saffron transition-colors w-full md:w-80"
          />
        </div>

        {/* Status Quick Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {["all", "pending", "preparing", "ready", "delivered"].map((statusKey) => (
            <button
              key={statusKey}
              onClick={() => setSelectedStatusFilter(statusKey)}
              className={`px-3 py-1.5 rounded-lg font-label-caps text-xs transition-colors cursor-pointer ${
                selectedStatusFilter === statusKey
                  ? "bg-gold-saffron text-cacao-dark font-bold"
                  : "bg-vanilla-porcelain border border-warm-border text-cacao-dark/70 hover:bg-[#FAF7F2]"
              }`}
            >
              {statusKey === "all" ? "Toate" : statusKey === "pending" ? "Noi" : statusKey === "preparing" ? "Pe plită" : statusKey === "ready" ? "Gata" : "Livrate"}
            </button>
          ))}
          <LuxuryButton variant="outline" icon={<RefreshCw size={14} />} onClick={loadOrders}>
            Reîmprospătează
          </LuxuryButton>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="w-12 h-12 border-4 border-gold-saffron border-t-transparent rounded-full animate-spin"></div>
          <p className="font-body-md text-cacao-dark/60 animate-pulse">Se preiau arhivele cu comenzi...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4 bg-vanilla-porcelain border border-warm-border rounded-2xl">
          <AlertCircle size={48} className="text-cacao-dark/20" />
          <h3 className="font-headline-md text-xl text-cacao-dark">Eroare la preluarea comenzilor</h3>
          <p className="font-body-md text-cacao-dark/60">{error}</p>
          <LuxuryButton onClick={loadOrders}>Reîncearcă</LuxuryButton>
        </div>
      ) : (
        <div className="bg-vanilla-porcelain border border-warm-border rounded-2xl overflow-hidden overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 p-6 border-b border-warm-border bg-[#FAF7F2]/50 font-label-caps text-cacao-dark/60 text-xs">
              <div className="col-span-2">Comandă</div>
              <div className="col-span-4">Detalii Produse</div>
              <div className="col-span-2">Oaspete</div>
              <div className="col-span-2 text-right">Total</div>
              <div className="col-span-2 text-right">Acțiune / Status</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-warm-border/50">
            {filteredOrders.length === 0 ? (
              <div className="p-8 text-center text-cacao-dark/60 font-body-md">Nu s-a găsit nicio comandă.</div>
            ) : (
              filteredOrders.map((order) => {
                const orderId = (order._id || "UNKNOWN").substring((order._id || "UNKNOWN").length - 4).toUpperCase();
                const time = order.createdAt ? new Date(order.createdAt).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' }) : "Acum";
                const itemsText = (order.items || []).map((i: any) => `${i.quantity || 1}x ${i.name || i.variantName || i.title || "Preparat"}`).join(', ');
                const guestName = order.customer?.name || order.deliveryInfo?.name || order.user?.name || "Oaspete";
                
                let statusProps = { status: 'neutral', label: order.status };
                if (order.status === 'pending') statusProps = { status: 'warning', label: 'Nouă (Apasă schimbi)' };
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
                    <div className="col-span-2 flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleUpdateStatus(order._id, order.status)}
                        title="Apasă pentru a schimba statusul"
                        disabled={updatingId === order._id}
                        className="cursor-pointer hover:scale-105 transition-transform"
                      >
                        <StatusBadge status={statusProps.status as any} label={updatingId === order._id ? "Se schimbă..." : statusProps.label} />
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
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  Truck, 
  XCircle, 
  RefreshCw, 
  Phone, 
  MapPin, 
  User, 
  ChevronRight,
  Filter,
  Loader2
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface OrderItem {
  name: string;
  variantName?: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  customer: {
    name: string;
    phone: string;
    address?: {
      street: string;
      house?: string;
      apartment?: string;
      notes?: string;
    };
  };
  items: OrderItem[];
  totalPrice: number;
  status: "pending" | "preparing" | "delivering" | "delivered" | "cancelled";
  paymentMethod: string;
  deliveryType?: string;
  createdAt: string;
}

export default function AdminOrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);

  const API_URL = "https://munchotella-api.onrender.com/api";

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/admin/orders`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setOrders(data.data);
      } else {
        throw new Error(data.message || "Nu s-au putut încărca comenzile.");
      }
    } catch (err: any) {
      console.error("Admin fetch orders error:", err);
      setError(err.message || "Eroare la conectarea cu serverul.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
      // Auto refresh per minute
      const interval = setInterval(fetchOrders, 60000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [token]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`${API_URL}/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus as any } : o));
      } else {
        alert(data.message || "Eroare la schimbarea statusului.");
      }
    } catch (err) {
      alert("Nu s-a putut conecta la server.");
    } finally {
      setUpdatingId(null);
    }
  };

  const statusBadges: Record<string, { label: string; bg: string; text: string; icon: any }> = {
    pending: { label: "Comandă Nouă", bg: "bg-amber-500/10", text: "text-amber-600", icon: Clock },
    preparing: { label: "În Preparare", bg: "bg-blue-500/10", text: "text-blue-600", icon: RefreshCw },
    delivering: { label: "În Livrare", bg: "bg-purple-500/10", text: "text-purple-600", icon: Truck },
    delivered: { label: "Livrată", bg: "bg-green-500/10", text: "text-green-600", icon: CheckCircle2 },
    cancelled: { label: "Anulată", bg: "bg-red-500/10", text: "text-red-600", icon: XCircle },
  };

  const filteredOrders = filterStatus === "all" 
    ? orders 
    : orders.filter(o => o.status === filterStatus);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-[var(--foreground)] tracking-tight">Gestionare Comenzi Live</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-500/10 text-green-600 border border-green-500/20">
              Web & App Sync
            </span>
          </div>
          <p className="text-[var(--foreground)]/60 mt-1">
            Gestionează statusul comenzilor primite pe Munchotella în timp real.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={fetchOrders}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-[var(--card)] border border-[var(--primary)]/10 text-[var(--foreground)] hover:bg-[var(--primary)]/5 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Reîmprospătează
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm">
          {error} (Autentifică-te ca administrator pentru a gestiona comenzile).
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[var(--primary)]/10 no-scrollbar">
        {[
          { key: "all", label: "Toate Comenzile" },
          { key: "pending", label: "Noi" },
          { key: "preparing", label: "În Preparare" },
          { key: "delivering", label: "În Livrare" },
          { key: "delivered", label: "Livrate" },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilterStatus(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterStatus === tab.key 
                ? "bg-[#1A120B] text-[#D4A853] shadow-sm" 
                : "bg-[var(--card)] text-[var(--foreground)]/70 hover:bg-[var(--primary)]/5 border border-[var(--primary)]/10"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#D4A853]" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-20 bg-[var(--card)] rounded-2xl border border-[var(--primary)]/10">
          <ShoppingBag className="w-12 h-12 text-[var(--foreground)]/20 mx-auto mb-3" />
          <p className="text-[var(--foreground)]/60 font-medium">Nu există comenzi de afișat în această categorie.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredOrders.map(order => {
            const badge = statusBadges[order.status] || statusBadges.pending;
            const Icon = badge.icon;
            const formattedDate = new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[var(--card)] p-6 rounded-2xl border border-[var(--primary)]/10 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                {/* Order Details & Customer */}
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-sm font-bold text-[#D4A853]">
                      #{order._id.substring(order._id.length - 6).toUpperCase()}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${badge.bg} ${badge.text}`}>
                      <Icon className="w-3.5 h-3.5" />
                      {badge.label}
                    </span>
                    <span className="text-xs text-[var(--foreground)]/50 font-medium">
                      Ora {formattedDate}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm font-medium text-[var(--foreground)] flex-wrap">
                    <span className="flex items-center gap-1.5 font-bold">
                      <User className="w-4 h-4 text-[#D4A853]" />
                      {order.customer?.name || "Client Munchotella"}
                    </span>
                    <span className="flex items-center gap-1.5 text-[var(--foreground)]/70">
                      <Phone className="w-4 h-4 text-[#D4A853]" />
                      {order.customer?.phone || "-"}
                    </span>
                    {order.customer?.address?.street && (
                      <span className="flex items-center gap-1.5 text-[var(--foreground)]/70">
                        <MapPin className="w-4 h-4 text-[#D4A853]" />
                        {order.customer.address.street} {order.customer.address.house ? `nr. ${order.customer.address.house}` : ''}
                      </span>
                    )}
                  </div>

                  {/* Items List */}
                  <div className="bg-[var(--background)]/50 p-3 rounded-xl border border-[var(--primary)]/10 text-xs font-medium space-y-1">
                    {order.items?.map((it, idx) => (
                      <div key={idx} className="flex justify-between text-[var(--foreground)]">
                        <span>{it.quantity}x {it.variantName || it.name}</span>
                        <span className="font-mono">{it.price * it.quantity} MDL</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total & Action Controls */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-end justify-between gap-4 border-t lg:border-t-0 border-[var(--primary)]/10 pt-4 lg:pt-0">
                  <div className="text-right">
                    <span className="text-xs text-[var(--foreground)]/50 block font-medium">Total Comandă</span>
                    <span className="text-2xl font-bold text-[#D4A853]">{order.totalPrice} MDL</span>
                  </div>

                  {/* Status Action Buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {order.status === "pending" && (
                      <button
                        disabled={updatingId === order._id}
                        onClick={() => updateOrderStatus(order._id, "preparing")}
                        className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                      >
                        Treci la: În Preparare
                      </button>
                    )}
                    {order.status === "preparing" && (
                      <button
                        disabled={updatingId === order._id}
                        onClick={() => updateOrderStatus(order._id, "delivering")}
                        className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                      >
                        Treci la: În Livrare
                      </button>
                    )}
                    {order.status === "delivering" && (
                      <button
                        disabled={updatingId === order._id}
                        onClick={() => updateOrderStatus(order._id, "delivered")}
                        className="px-3.5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                      >
                        Finalizează (Livrată)
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

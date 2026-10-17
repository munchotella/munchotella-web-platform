"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { adminFetch } from "@/lib/adminApi";
import {
  Search,
  Trash2,
  X,
  ArrowRight,
  Phone,
  MapPin,
  ExternalLink,
  Clock,
  AlertTriangle,
  CreditCard,
  Banknote,
  Utensils,
  Home,
  Bell,
  RotateCcw
} from "lucide-react";

// Statusuri Kanban (Aliniere 100% cu fluxul nativ al restaurantului)
interface StatusConfig {
  key: string;
  label: string;
  shortLabel: string;
  color: string;
  bgLight: string;
  borderColor: string;
  textColor: string;
}

const STATUS_FLOW: StatusConfig[] = [
  { key: "pending",    label: "Noi",           shortLabel: "Noi",          color: "#FF9800", bgLight: "bg-amber-500/15",   borderColor: "border-amber-500",   textColor: "text-amber-600" },
  { key: "confirmed",  label: "Confirmate",    shortLabel: "Confirmate",   color: "#2196F3", bgLight: "bg-sky-500/15",     borderColor: "border-sky-500",     textColor: "text-sky-600" },
  { key: "preparing",  label: "În preparare",  shortLabel: "În preparare", color: "#9C27B0", bgLight: "bg-purple-500/15",  borderColor: "border-purple-500",  textColor: "text-purple-600" },
  { key: "delivering", label: "La livrare",    shortLabel: "La livrare",   color: "#FF5722", bgLight: "bg-orange-500/15",  borderColor: "border-orange-500",  textColor: "text-orange-600" },
  { key: "delivered",  label: "Livrate",       shortLabel: "Livrate",      color: "#4CAF50", bgLight: "bg-emerald-500/15", borderColor: "border-emerald-500", textColor: "text-emerald-600" },
  { key: "cancelled",  label: "Anulate",       shortLabel: "Anulate",      color: "#F44336", bgLight: "bg-red-500/15",     borderColor: "border-red-500",     textColor: "text-red-600" },
];

const NEXT_STATUS: Record<string, string> = {
  pending: "confirmed",
  confirmed: "preparing",
  preparing: "delivering",
  delivering: "delivered",
};

const NEXT_ACTION_KEY: Record<string, { label: string; btnColor: string }> = {
  pending: { label: "Confirmă", btnColor: "bg-[#2196F3] hover:bg-[#1E88E5] text-white" },
  confirmed: { label: "Începe prepararea", btnColor: "bg-[#9C27B0] hover:bg-[#8E24AA] text-white" },
  preparing: { label: "Trimite la livrare", btnColor: "bg-[#FF5722] hover:bg-[#F4511E] text-white" },
  delivering: { label: "Livrată", btnColor: "bg-[#4CAF50] hover:bg-[#43A047] text-white" },
};

const DATE_FILTERS = [
  { key: "today", label: "Azi" },
  { key: "yesterday", label: "Ieri" },
  { key: "week", label: "Săpt." },
  { key: "month", label: "Luna" },
  { key: "quarter", label: "3 Luni" },
];

const MONTH_NAMES = ["Ian", "Feb", "Mar", "Apr", "Mai", "Iun", "Iul", "Aug", "Sep", "Oct", "Noi", "Dec"];

function formatOrderDateTime(dateStr?: string | Date): string {
  if (!dateStr) return "--:--";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "--:--";
  const day = d.getDate();
  const month = MONTH_NAMES[d.getMonth()] || "";
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const time = `${hours}:${minutes}`;
  const currentYear = new Date().getFullYear();
  if (d.getFullYear() !== currentYear) {
    return `${day} ${month} ${d.getFullYear()} · ${time}`;
  }
  return `${day} ${month} · ${time}`;
}

export default function RestaurantOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("today");
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Banner comandă nouă
  const [bannerOrder, setBannerOrder] = useState<any | null>(null);
  const bannerTimeout = useRef<NodeJS.Timeout | null>(null);
  const prevPendingCount = useRef<number>(0);

  const showBanner = useCallback((orderData: any) => {
    setBannerOrder(orderData || {});
    if (bannerTimeout.current) clearTimeout(bannerTimeout.current);
    bannerTimeout.current = setTimeout(() => {
      setBannerOrder(null);
    }, 6000);
  }, []);

  const hideBanner = () => {
    setBannerOrder(null);
    if (bannerTimeout.current) clearTimeout(bannerTimeout.current);
  };

  // Preluare comenzi sincronizată automat (Live)
  const fetchOrders = useCallback(async (silent = false) => {
    try {
      if (!silent) setRefreshing(true);
      setError(null);
      const endpoint = dateFilter === "today"
        ? "/orders/admin/live"
        : `/orders/admin/all?period=${dateFilter}`;

      const res = await adminFetch(endpoint);
      if (res?.success && Array.isArray(res.data)) {
        const newOrders = res.data;

        if (dateFilter === "today") {
          const newPendingCount = newOrders.filter((o: any) => o.status === "pending").length;
          if (newPendingCount > prevPendingCount.current && prevPendingCount.current !== 0) {
            const latestPending = newOrders.find((o: any) => o.status === "pending");
            if (latestPending) showBanner(latestPending);
          }
          prevPendingCount.current = newPendingCount;
        }

        setOrders(newOrders);
      }
    } catch (err: any) {
      if (!silent) {
        setError(err.message || "Eroare la preluarea comenzilor");
      }
    } finally {
      if (!silent) setRefreshing(false);
    }
  }, [dateFilter, showBanner]);

  // Polling automat la 8 secunde
  useEffect(() => {
    fetchOrders(false);

    const interval = setInterval(() => {
      fetchOrders(true);
    }, 8000);

    return () => {
      clearInterval(interval);
      if (bannerTimeout.current) clearTimeout(bannerTimeout.current);
    };
  }, [fetchOrders]);

  // Schimbare status
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingId(orderId);
      await adminFetch(`/orders/${orderId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
    } catch (err: any) {
      alert("Nu s-a putut actualiza comanda: " + (err.message || "Eroare rețea"));
    } finally {
      setUpdatingId(null);
    }
  };

  // Anulare comandă
  const handleCancelOrder = (orderId: string) => {
    if (confirm("Sigur dorești să anulezi această comandă?")) {
      handleStatusChange(orderId, "cancelled");
    }
  };

  // Reactivare comandă închisă / anulată -> trece automat în "pending" (Noi)
  const handleReactivateOrder = async (orderId: string) => {
    if (!confirm("Sigur dorești să reactivezi această comandă? Va trece automat în rubrica 'Noi' pentru a fi preluată de bucătărie.")) return;
    try {
      setUpdatingId(orderId);
      await adminFetch(`/orders/${orderId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: "pending" }),
      });
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: "pending" } : o));
      setActiveTab("pending");
    } catch (err: any) {
      alert("Nu s-a putut reactiva comanda: " + (err.message || "Eroare rețea"));
    } finally {
      setUpdatingId(null);
    }
  };

  // Ștergere comandă
  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("Ești sigur că vrei să ștergi această comandă definitiv din baza de date?")) return;
    try {
      setUpdatingId(orderId);
      await adminFetch(`/orders/${orderId}`, { method: "DELETE" });
      setOrders(prev => prev.filter(o => o._id !== orderId));
    } catch (err: any) {
      alert("Eroare la ștergerea comenzii: " + (err.message || "Eroare"));
    } finally {
      setUpdatingId(null);
    }
  };

  // Deschidere Navigare Google Maps
  const openMaps = (address: string) => {
    if (!address) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Apelare directă telefon client
  const callClient = (phone: string) => {
    if (!phone) return;
    window.location.href = `tel:${phone}`;
  };

  // Statistici active (excludem comenzile anulate și coșurile abandonate nefinalizate)
  const activeOrders = orders.filter(o => o.status !== "cancelled" && o.status !== "abandoned_draft");
  const totalRevenue = activeOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const pendingCount = orders.filter(o => o.status === "pending").length;
  const allTabOrders = orders.filter(o => o.status === "pending" || o.status === "abandoned_draft");

  // Filtrare comenzi: rubrica "Toate" afișează DOAR comenzile noi ("pending") și coșurile abandonate ("abandoned_draft")
  const filteredOrders = orders.filter((order) => {
    const matchesTab = activeTab === "all"
      ? (order.status === "pending" || order.status === "abandoned_draft")
      : order.status === activeTab;
    if (!matchesTab) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const guestName = (order.customer?.name || order.deliveryInfo?.name || order.user?.name || "").toLowerCase();
    const phone = (order.customer?.phone || order.deliveryInfo?.phone || "").toLowerCase();
    const itemsText = (order.items || []).map((i: any) => i.name || i.variantName || "").join(" ").toLowerCase();
    const orderId = (order._id || "").toLowerCase();

    return guestName.includes(q) || phone.includes(q) || itemsText.includes(q) || orderId.includes(q);
  });

  return (
    <div className="space-y-3 pb-16 relative">

      {/* ── BANNER COMANDĂ NOUĂ (Alertă discretă de sus) ───────────────────── */}
      {bannerOrder && (
        <div className="fixed top-3 left-4 right-4 md:left-auto md:right-8 md:w-96 z-50 animate-bounce transition-all">
          <div className="bg-[#E8A020] text-[#1D1D1D] p-3 rounded-2xl shadow-2xl flex items-center justify-between border border-[#C4851A]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center shrink-0">
                <Bell size={18} className="text-[#1D1D1D]" />
              </div>
              <div>
                <p className="font-bold text-xs leading-tight">🔔 Comandă nouă primită!</p>
                <p className="text-[11px] opacity-90 mt-0.5 line-clamp-1">
                  {bannerOrder.customer?.name ? `${bannerOrder.customer.name} · ` : ""}
                  {bannerOrder.totalPrice} MDL
                </p>
              </div>
            </div>
            <button
              onClick={hideBanner}
              className="p-1 hover:bg-black/10 rounded-full cursor-pointer transition-colors"
              title="Închide"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── HEADER MINIMAL & REZUMAT COMPACT ─────────────────────────────────── */}
      <div className="flex items-center justify-between gap-2 px-1">
        <h1 className="text-base sm:text-lg font-bold text-[#1D1D1D] flex items-center gap-1.5 tracking-tight">
          🏪 Restaurant
        </h1>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#6B6B6B]">
          <span className="bg-[#FFFFFF] px-2.5 py-1 rounded-full border border-[#EBEBEB] text-[#1D1D1D] shadow-2xs">
            {activeOrders.length} active · <strong className="text-[#E8A020]">{totalRevenue} MDL</strong>
          </span>
          {pendingCount > 0 && (
            <span className="bg-amber-500/15 border border-amber-500/30 text-amber-700 px-2 py-0.5 rounded-full text-[11px] font-bold animate-pulse">
              {pendingCount} noi
            </span>
          )}
        </div>
      </div>

      {/* ── BARA FILTRU PERIOADĂ (Compact Segmented Row - Zero Scroll) ───────── */}
      <div className="grid grid-cols-5 gap-1.5 p-1 bg-[#FFFFFF] rounded-xl border border-[#EBEBEB] shadow-2xs">
        {DATE_FILTERS.map((f) => {
          const isActive = dateFilter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setDateFilter(f.key)}
              className={`py-1.5 text-center rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? "bg-[#E8A020] text-[#1D1D1D] font-bold shadow-2xs"
                  : "text-[#6B6B6B] hover:text-[#1D1D1D] hover:bg-gray-50"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* ── MATRICEA COMPACTĂ DE STATUSURI (Zero Horizontal Scroll!) ─────────── */}
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
        {/* Buton Toate */}
        <button
          onClick={() => setActiveTab("all")}
          className={`col-span-2 sm:col-span-1 flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer ${
            activeTab === "all"
              ? "bg-[#1D1D1D] text-white border-[#1D1D1D] shadow-xs"
              : "bg-[#FFFFFF] border-[#EBEBEB] text-[#6B6B6B] hover:border-gray-300"
          }`}
        >
          <span className="text-[11px] font-bold leading-tight truncate">Toate</span>
          <span className={`text-[10px] mt-0.5 px-1.5 py-0.1 rounded-full font-bold ${
            activeTab === "all" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
          }`}>
            {allTabOrders.length}
          </span>
        </button>

        {/* 6 Butoane de Status Kanban (1:1 cu aplicația mobilă) */}
        {STATUS_FLOW.map((s) => {
          const count = orders.filter((o) => o.status === s.key).length;
          const isActive = activeTab === s.key;
          return (
            <button
              key={s.key}
              onClick={() => setActiveTab(s.key)}
              style={{
                backgroundColor: isActive ? `${s.color}15` : "#FFFFFF",
                borderColor: isActive ? s.color : "#EBEBEB",
              }}
              className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer ${
                isActive ? "shadow-2xs font-bold" : "text-[#6B6B6B] hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: s.color }}></span>
                <span
                  style={{ color: isActive ? s.color : undefined }}
                  className="text-[10px] sm:text-[11px] font-semibold leading-tight truncate"
                >
                  {s.shortLabel}
                </span>
              </div>
              <span
                style={{
                  backgroundColor: count > 0 ? (isActive ? s.color : `${s.color}20`) : "rgba(0,0,0,0.04)",
                  color: count > 0 ? (isActive ? "#FFFFFF" : s.color) : "#A0A0A0",
                }}
                className="text-[10px] mt-0.5 px-1.5 py-0.1 rounded-full font-bold"
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── CĂUTARE RAPIDĂ COMPACTĂ ────────────────────────────────────────── */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A0A0]" size={15} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Caută comandă, oaspete sau telefon..."
          className="w-full pl-9 pr-8 py-2 bg-[#FFFFFF] border border-[#EBEBEB] rounded-xl text-xs text-[#1D1D1D] placeholder:text-[#A0A0A0] focus:outline-none focus:border-[#E8A020] transition-colors shadow-2xs"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* ── STARE ÎNCĂRCARE / EROARE / GOL ──────────────────────────────────── */}
      {refreshing && orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 space-y-2">
          <div className="w-8 h-8 border-3 border-[#E8A020] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-[#6B6B6B]">Sincronizare comenzi...</p>
        </div>
      ) : error ? (
        <div className="p-4 text-center bg-red-50 border border-red-200 rounded-xl space-y-2">
          <AlertTriangle className="mx-auto text-red-500" size={24} />
          <p className="text-xs font-semibold text-red-700">{error}</p>
          <button
            onClick={() => fetchOrders(false)}
            className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700"
          >
            Reîncearcă
          </button>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-8 text-center bg-[#FFFFFF] border border-[#EBEBEB] rounded-2xl space-y-1.5">
          <p className="text-xs font-bold text-[#1D1D1D]">Nicio comandă în această secțiune</p>
          <p className="text-[11px] text-[#A0A0A0]">Comenzile noi sau cele din perioada selectată vor apărea aici automat.</p>
        </div>
      ) : (
        /* ── LISTA DE CARDURI COMPACTE (Mobile-First High Density) ───────────── */
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2.5">
          {filteredOrders.map((order) => {
            const orderShortId = (order._id || "UNKNOWN").substring((order._id || "UNKNOWN").length - 4).toUpperCase();
            const timeString = formatOrderDateTime(order.createdAt);

            const statusObj = STATUS_FLOW.find((s) => s.key === order.status) || {
              key: order.status,
              label: order.status === "abandoned_draft" ? "Abandonată" : order.status,
              shortLabel: order.status === "abandoned_draft" ? "Abandonată" : order.status,
              color: "#8C7B70",
              bgLight: "bg-stone-500/15",
              borderColor: "border-stone-400",
              textColor: "text-stone-700",
            };

            const nextStep = NEXT_STATUS[order.status];
            const nextAction = nextStep ? NEXT_ACTION_KEY[order.status] : null;

            return (
              <div
                key={order._id}
                className="bg-[#FFFFFF] rounded-2xl p-3 sm:p-3.5 border border-[#EBEBEB] shadow-2xs flex flex-col justify-between gap-2.5 transition-all hover:shadow-xs"
              >
                {/* 1. Header Card: Status Badge + ID + Timp (Compact) */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      style={{
                        backgroundColor: `${statusObj.color}15`,
                        color: statusObj.color,
                        borderColor: `${statusObj.color}35`,
                      }}
                      className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border"
                    >
                      {statusObj.label}
                    </span>
                    <span className="text-xs font-bold text-[#1D1D1D]">
                      #{orderShortId}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-[#6B6B6B] font-medium bg-[#FAFAFA] px-2 py-0.5 rounded border border-[#EBEBEB]">
                    <Clock size={11} className="text-[#A0A0A0]" />
                    <span>{timeString}</span>
                  </div>
                </div>

                {/* 2. Client & Buton Verde Apel Direct */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-semibold text-xs text-[#1D1D1D] truncate">
                    <span className="text-xs">👤</span>
                    <span className="truncate">{order.customer?.name || "Oaspete Munchotella"}</span>
                  </div>

                  {order.customer?.phone ? (
                    <button
                      onClick={() => callClient(order.customer.phone)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold hover:bg-emerald-100 transition-colors shrink-0 cursor-pointer"
                      title="Apelează clientul"
                    >
                      <Phone size={11} className="text-emerald-600" />
                      <span>{order.customer.phone}</span>
                    </button>
                  ) : null}
                </div>

                {/* 3. Adresă / Preluare Boutique */}
                {order.customer?.address && (
                  <div
                    onClick={() => openMaps(order.customer.address)}
                    className="flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#E8A020]/10 border border-[#E8A020]/20 text-[#1D1D1D] text-[11px] cursor-pointer hover:bg-[#E8A020]/15 transition-colors group"
                    title="Deschide în Google Maps"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin size={12} className="text-[#E8A020] shrink-0" />
                      <span className="truncate font-medium">{order.customer.address}</span>
                    </div>
                    <ExternalLink size={11} className="text-[#E8A020] shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                )}

                {/* 4. Produse Comandate (Itemized list compact) */}
                <div className="border-t border-b border-[#EBEBEB]/80 py-1.5 space-y-1">
                  {(order.items || []).map((item: any, idx: number) => {
                    const quantity = item.quantity || 1;
                    const itemName = item.name || item.variantName || "Produs Gourmet";
                    const variant = item.variantName && item.variantName !== item.name ? ` (${item.variantName})` : "";
                    const modifiersText = Array.isArray(item.modifiers)
                      ? item.modifiers
                          .map((m: any) => {
                            const cleanName = (m.optionName || m.name || "").replace(/^(Extra|Доп\.)\s+/i, "").trim();
                            if (!cleanName) return "";
                            return m.price ? `+ ${cleanName} (+${m.price} MDL)` : `+ ${cleanName}`;
                          })
                          .filter(Boolean)
                          .join(", ")
                      : "";

                    return (
                      <div key={idx} className="flex items-start justify-between gap-2 text-[11px]">
                        <div className="flex items-start gap-1.5 min-w-0 flex-1">
                          <span className="font-bold text-[#E8A020] shrink-0">{quantity}x</span>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-[#1D1D1D] leading-snug">
                              {itemName}{variant}
                            </div>
                            {modifiersText && (
                              <div className="text-[10.5px] font-semibold text-[#C4851A] mt-0.5 leading-tight">
                                {modifiersText}
                              </div>
                            )}
                          </div>
                        </div>
                        <span className="font-semibold text-[#1D1D1D] shrink-0 text-right">
                          {item.itemTotal ? `${item.itemTotal} MDL` : ""}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* 5. Ecusoane Detalii (Plată, Livrare la ușă, Tacâmuri) */}
                <div className="flex flex-wrap items-center gap-1">
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#FAFAFA] border border-[#EBEBEB] text-[#6B6B6B]">
                    {order.paymentMethod === "cash" ? (
                      <>
                        <Banknote size={10} className="text-emerald-600" />
                        <span>Numerar</span>
                      </>
                    ) : (
                      <>
                        <CreditCard size={10} className="text-sky-600" />
                        <span>Card</span>
                      </>
                    )}
                  </span>

                  {order.doorDelivery && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-sky-50 border border-sky-200 text-sky-700">
                      <Home size={10} />
                      <span>La ușă</span>
                    </span>
                  )}

                  {order.needsCutlery && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-50 border border-amber-200 text-amber-700">
                      <Utensils size={10} />
                      <span>Tacâmuri</span>
                    </span>
                  )}
                </div>

                {/* 6. Notițe Speciale Oaspete (Alertă Chihlimbar compactă) */}
                {order.customer?.notes && (
                  <div className="flex items-start gap-1.5 p-2 rounded-lg bg-amber-50/80 border border-amber-200/80 text-amber-900 text-[11px]">
                    <span className="shrink-0 text-amber-600 font-bold">📝</span>
                    <p className="leading-snug font-medium line-clamp-2">{order.customer.notes}</p>
                  </div>
                )}

                {/* 7. Total + Bară Acțiuni Rapide (Compact Footer) */}
                <div className="flex items-center justify-between pt-1 border-t border-[#EBEBEB]/80 gap-2">
                  <div>
                    <span className="text-base font-bold text-[#E8A020] leading-none block">
                      {order.totalPrice} MDL
                    </span>
                    <span className="text-[10px] text-[#A0A0A0] leading-none mt-0.5 block">
                      {order.deliveryFee ? `Livrare: ${order.deliveryFee} MDL` : "Preluare local"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Buton Anulare (X roșu discret - doar pentru comenzi active, nu livrate/anulate) */}
                    {order.status !== "delivered" && order.status !== "cancelled" && (
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        disabled={updatingId === order._id}
                        className="w-8 h-8 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                        title="Anulează comanda"
                      >
                        <X size={15} />
                      </button>
                    )}

                    {/* Buton Ștergere (Gunoi) */}
                    <button
                      onClick={() => handleDeleteOrder(order._id)}
                      disabled={updatingId === order._id}
                      className="w-8 h-8 rounded-lg border border-gray-200 text-gray-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                      title="Șterge definitiv comanda"
                    >
                      <Trash2 size={13} />
                    </button>

                    {/* Buton Avansare Status / Reactivare Comandă */}
                    {nextStep && nextAction ? (
                      <button
                        onClick={() => handleStatusChange(order._id, nextStep)}
                        disabled={updatingId === order._id}
                        className={`h-8 px-3 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 shadow-2xs transition-all active:scale-[0.98] cursor-pointer ${nextAction.btnColor}`}
                      >
                        <span>{updatingId === order._id ? "..." : nextAction.label}</span>
                        <ArrowRight size={12} />
                      </button>
                    ) : order.status === "delivered" ? (
                      <span className="h-8 px-2.5 rounded-lg text-[10px] font-semibold flex items-center justify-center bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Finalizată
                      </span>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className="h-8 px-2 rounded-lg text-[10px] font-semibold flex items-center justify-center bg-gray-100 text-gray-500 border border-gray-200">
                          {order.status === "abandoned_draft" ? "Abandonată" : "Închisă"}
                        </span>
                        <button
                          onClick={() => handleReactivateOrder(order._id)}
                          disabled={updatingId === order._id}
                          className="h-8 px-2.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 bg-[#E8A020] hover:bg-[#D48F18] text-[#1D1D1D] shadow-2xs transition-all active:scale-[0.98] cursor-pointer"
                          title="Reactivează comanda și trimite-o în rubrica 'Noi'"
                        >
                          <RotateCcw size={12} className={updatingId === order._id ? "animate-spin" : ""} />
                          <span>{updatingId === order._id ? "..." : "Reactivează"}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

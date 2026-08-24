"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart, CartItem } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { MapPin, Package, Settings, LogOut, ChevronRight, Clock, Map, Phone, Globe, Star, MessageSquare } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AddressManager from "@/components/profile/AddressManager";
import AccountSettings from "@/components/profile/AccountSettings";
import { useTranslations } from 'next-intl';

export default function ProfilePage() {
  const t = useTranslations('Profile');
  const { user, token, isLoading, logout } = useAuth();
  const { replaceCart } = useCart();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("istoric");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Review Modal State
  const [reviewOrder, setReviewOrder] = useState<any | null>(null);
  const [selectedRating, setSelectedRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const API_URL = "https://munchotella-api.onrender.com/api";
        const headers: any = {};
        
        let currentToken = token;
        if (!currentToken && typeof window !== "undefined") {
          currentToken = localStorage.getItem("munchotella_token");
        }
        
        if (currentToken) headers["Authorization"] = `Bearer ${currentToken}`;
        
        const res = await fetch(`${API_URL}/orders/myorders`, {
          credentials: "include",
          headers
        });
        const data = await res.json();
        if (data.success) {
          setOrders(data.data);
        }
      } catch (err) {
        console.error("Eroare fetch comenzi:", err);
      } finally {
        setLoadingOrders(false);
      }
    };
    
    if (user) {
      fetchOrders();
    } else if (!isLoading && !user) {
      setLoadingOrders(false);
    }
  }, [user, token, isLoading]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#FFFCF6] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#D4A853] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleReorder = (order: any) => {
    const DRINK_MAPPING: Record<string, string> = {
      'Ice Lemonade': 'ice_lemonade',
      'Ceai': 'ceai',
      'Coca-Cola': 'cola',
      'Fanta': 'fanta',
      'Apă Dorna': 'apa_dorna',
    };

    const newItems: CartItem[] = order.items.map((item: any, idx: number) => {
      const isDrink = !item.menuItem || DRINK_MAPPING[item.name];
      
      let itemId;
      if (isDrink) {
        const drinkId = DRINK_MAPPING[item.name] || item.name.replace(/\s+/g, '_').toLowerCase();
        itemId = `drink_${drinkId}`;
      } else {
        itemId = (item.menuItem?._id || item.menuItem || item._id || `item_${idx}`);
      }

      const toppings = item.modifiers ? item.modifiers.map((m: any) => ({
        groupName: m.title || m.groupTitle || 'Topping',
        name: m.optionName,
        price: m.price || 0
      })) : [];
      
      const toppingsKey = toppings.map((t: any) => t.name).sort().join("-");
      const cartItemId = `${itemId}-${toppingsKey || 'default'}`;
      
      const unitPrice = item.price + toppings.reduce((sum: number, t: any) => sum + t.price, 0);

      return {
        cartItemId,
        id: itemId,
        name: item.name || item.menuItem?.name || "Produs",
        basePrice: item.price,
        price: unitPrice,
        image: item.menuItem?.image || "",
        quantity: item.quantity,
        selectedVariant: item.variantName,
        selectedToppings: toppings
      };
    });
    
    replaceCart(newItems);
    router.push("/checkout");
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewOrder) return;

    try {
      setSubmittingReview(true);
      const API_URL = "https://munchotella-api.onrender.com/api";
      const headers: any = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/orders/${reviewOrder._id}/review`, {
        credentials: "include",
        method: "POST",
        headers,
        body: JSON.stringify({
          rating: selectedRating,
          reviewText: reviewComment
        })
      });
      const data = await res.json();
      if (data.success) {
        setOrders(orders.map(o => o._id === reviewOrder._id ? { ...o, rating: selectedRating, reviewText: reviewComment } : o));
        setReviewOrder(null);
        alert(t('reviewSaved'));
      } else {
        alert(data.message || t('reviewError'));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FFFCF6]">
      <Navbar />
      
      <div className="pt-32 pb-24 max-w-[1200px] mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-serif text-[#1A120B] mb-2">{t('hello')}, {user.name.split(" ")[0]}!</h1>
            <p className="text-[#1A120B]/60 font-medium">{t('welcomeBack')}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-full font-bold hover:bg-red-100 transition-colors self-start md:self-auto"
          >
            <LogOut size={18} />
            <span>{t('logout')}</span>
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-8 rounded-[32px] border border-[#E8E2D9] shadow-sm"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-[#1A120B] text-[#D4A853] rounded-full flex items-center justify-center text-2xl font-serif">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-[#1A120B] text-lg">{user.name}</h3>
                  <p className="text-[#1A120B]/60 text-sm">{user.email}</p>
                </div>
              </div>

              <nav className="space-y-2 relative">
                {[{ id: "istoric", label: t('orderHistory'), icon: Package }, 
                  { id: "adrese", label: t('deliveryAddresses'), icon: MapPin }, 
                  { id: "setari", label: t('accountSettings'), icon: Settings }].map((item) => {
                  const isActive = activeTab === item.id;
                  const Icon = item.icon;
                  return (
                    <button 
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl font-bold group transition-colors relative z-10 ${
                        isActive ? "text-[#1A120B]" : "text-[#1A120B]/60 hover:text-[#1A120B]"
                      }`}
                    >
                      {isActive && (
                        <motion.div 
                          layoutId="activeTabIndicator"
                          className="absolute inset-0 bg-[#1A120B]/5 rounded-2xl -z-10"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                      <div className="flex items-center gap-3">
                        <Icon size={20} className={isActive ? "text-[#D4A853]" : "text-[#1A120B]/40 group-hover:text-[#D4A853] transition-colors"} />
                        {item.label}
                      </div>
                      <ChevronRight size={18} className={isActive ? "text-[#1A120B]" : "text-[#1A120B]/40 group-hover:text-[#1A120B] transition-colors"} />
                    </button>
                  );
                })}
              </nav>
            </motion.div>

            {/* Info Contact */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-8 rounded-[32px] border border-[#E8E2D9] shadow-sm"
            >
              <h3 className="font-bold text-[#1A120B] text-lg mb-6">{t('contactSchedule')}</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#1A120B]/5 flex items-center justify-center shrink-0">
                    <Clock size={18} className="text-[#D4A853]" />
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-[#1A120B]/50 font-bold mb-1">{t('scheduleTitle')}</p>
                    <p className="text-sm font-bold text-[#1A120B]">{t('scheduleMonSun')}</p>
                    <p className="text-sm font-bold text-red-600 mt-1">{t('scheduleWed')}</p>
                  </div>
                </div>

                <a href="tel:+37360912289" className="flex items-start gap-4 group">
                  <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0 group-hover:bg-green-100 transition-colors">
                    <Phone size={18} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-[#1A120B]/50 font-bold mb-1">{t('phone')}</p>
                    <p className="text-sm font-bold text-[#1A120B] group-hover:text-green-600 transition-colors">060 912 289</p>
                  </div>
                </a>

                <a href="https://instagram.com/munchotella" target="_blank" rel="noreferrer" className="flex items-start gap-4 group">
                  <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center shrink-0 group-hover:bg-pink-100 transition-colors">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-pink-600"
                    >
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-[#1A120B]/50 font-bold mb-1">{t('instagram')}</p>
                    <p className="text-sm font-bold text-[#1A120B] group-hover:text-pink-600 transition-colors">@munchotella</p>
                  </div>
                </a>
              </div>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Active Order Banner (If any) */}
            {(() => {
              const activeOrder = orders.find(o => {
                const isActiveStatus = ['pending', 'preparing', 'ready', 'on_the_way'].includes(o.status);
                const orderDate = new Date(o.createdAt).getTime();
                const now = new Date().getTime();
                const isRecent = (now - orderDate) < 12 * 60 * 60 * 1000; // within 12 hours
                return isActiveStatus && isRecent;
              });
              if (!activeOrder) return null;

              const activeItemNames = activeOrder.items.slice(0, 2).map((i: any) => i.name || i.menuItem?.name).join(", ");

              return (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-[#1A120B] p-8 rounded-[32px] text-white flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden"
                >
                  <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
                  <div className="relative z-10 flex-1">
                    <div className="flex items-center gap-2 text-[#D4A853] text-sm font-bold uppercase tracking-widest mb-2">
                      <Clock size={16} />
                      <span>{t('activeOrder')}</span>
                    </div>
                    <h3 className="text-2xl font-serif text-[#FDF9F1] mb-2">
                      {activeOrder.status === 'pending' ? t('orderReceived') || 'Comanda a fost primită' :
                       activeOrder.status === 'preparing' ? t('orderPreparing') || 'Comanda se prepară' :
                       activeOrder.status === 'ready' ? t('orderReady') || 'Comanda este gata' :
                       t('orderOnTheWay') || 'Comanda este pe drum'}
                    </h3>
                    <p className="text-white/70 text-sm">{activeItemNames} {t('orderReadyIn')}</p>
                  </div>
                  <button 
                    onClick={() => router.push(`/order-tracking/${activeOrder._id}`)}
                    className="relative z-10 px-6 py-3 bg-[#D4A853] text-white rounded-full font-bold hover:bg-[#C29641] transition-colors w-full md:w-auto text-center"
                  >
                    {t('trackLive')}
                  </button>
                </motion.div>
              );
            })()}

            {/* Conținut Tab-uri */}
            <AnimatePresence mode="wait">
              {activeTab === "istoric" && (
                <motion.div 
                  key="istoric"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white p-8 rounded-[32px] border border-[#E8E2D9] shadow-sm"
                >
                  <h2 className="text-2xl font-serif text-[#1A120B] mb-8">{t('recentOrders')}</h2>
              
              <motion.div 
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: { staggerChildren: 0.1 }
                  }
                }}
                initial="hidden"
                animate="show"
                className="space-y-6"
              >
                {loadingOrders ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse flex items-center justify-between p-6 rounded-2xl border border-[#E8E2D9] bg-[#FFFCF6]/50">
                        <div className="space-y-3 w-1/2">
                          <div className="h-4 bg-[#E8E2D9] rounded w-1/3"></div>
                          <div className="h-3 bg-[#E8E2D9] rounded w-1/2"></div>
                        </div>
                        <div className="space-y-3 w-1/4 flex flex-col items-end">
                          <div className="h-3 bg-[#E8E2D9] rounded w-1/2"></div>
                          <div className="h-4 bg-[#E8E2D9] rounded w-3/4"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : orders.length === 0 ? (
                  <p className="text-[#1A120B]/60 text-center py-10">{t('noOrders')}</p>
                ) : (
                  orders.map((order, index) => {
                    const isExpanded = expandedOrderId === order._id;
                    const orderDate = new Date(order.createdAt).toLocaleDateString("ro-RO", { day: "numeric", month: "short", year: "numeric" });
                    
                    // Afișăm un rezumat din primele 2 produse pentru titlu
                    const orderSummary = order.items.slice(0, 2).map((i: any) => `${i.name || i.menuItem?.name} x${i.quantity}`).join(", ") + (order.items.length > 2 ? ` + ${order.items.length - 2} ${t('others')}` : "");
                    
                    return (
                      <motion.div 
                        key={order._id || index}
                        variants={{
                          hidden: { opacity: 0, y: 20 },
                          show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
                        }}
                        className="rounded-2xl border border-[#E8E2D9] bg-[#FFFCF6]/50 overflow-hidden group hover:border-[#D4A853]/30 transition-colors"
                      >
                        <div 
                          onClick={() => setExpandedOrderId(isExpanded ? null : order._id)}
                          className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-4 cursor-pointer"
                        >
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-bold text-[#1A120B]">#{order._id.slice(-6).toUpperCase()}</span>
                              <span className="text-[12px] px-3 py-1 bg-[#1A120B]/5 text-[#1A120B]/60 rounded-full font-medium capitalize">
                                {orderDate}
                              </span>
                            </div>
                            <p className="text-[#1A120B]/60 text-sm">{orderSummary}</p>
                          </div>
                          <div className="flex items-center justify-between md:justify-end gap-6 md:w-1/3">
                            <div className="text-right">
                              <p className="text-[#1A120B]/60 text-[12px] uppercase tracking-widest mb-1">{t('total')}</p>
                              <p className="font-bold text-[#1A120B]">{order.totalPrice} MDL</p>
                            </div>
                            <button className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                              isExpanded 
                                ? "bg-[#1A120B] text-white border border-[#1A120B]" 
                                : "bg-white border border-[#E8E2D9] text-[#1A120B] group-hover:bg-[#1A120B] group-hover:text-white group-hover:border-[#1A120B]"
                            }`}>
                              <motion.div animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
                                <ChevronRight size={20} />
                              </motion.div>
                            </button>
                          </div>
                        </div>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="border-t border-[#E8E2D9]/50 px-6 overflow-hidden"
                            >
                              <div className="py-6 flex flex-col md:flex-row gap-6 justify-between items-start">
                                <div className="space-y-4 w-full md:w-2/3">
                                  <p className="text-sm font-bold text-[#1A120B] uppercase tracking-wider">{t('orderDetails')}</p>
                                  <ul className="text-sm text-[#1A120B]/80 space-y-3">
                                    {order.items.map((item: any, idx: number) => (
                                      <li key={idx} className="flex flex-col border-b border-[#E8E2D9]/50 pb-2 last:border-0 last:pb-0">
                                        <div className="flex justify-between font-medium">
                                          <span>{item.quantity}x {item.name || item.menuItem?.name}</span>
                                          <span>{item.itemTotal} MDL</span>
                                        </div>
                                        {item.modifiers && item.modifiers.length > 0 && (
                                          <div className="text-[13px] text-[#1A120B]/50 mt-1 pl-4 flex flex-col">
                                            {item.modifiers.map((mod: any, mIdx: number) => (
                                              <span key={mIdx}>+ {mod.title}: {mod.optionName}</span>
                                            ))}
                                          </div>
                                        )}
                                      </li>
                                    ))}
                                  </ul>
                                  <div className="pt-2 mt-2 flex justify-between md:max-w-[300px]">
                                    <span className="font-bold text-[#1A120B]">{t('delivery')}</span>
                                    <span className="font-bold text-[#1A120B]/70">{order.deliveryFee > 0 ? `${order.deliveryFee} MDL` : t('free')}</span>
                                  </div>
                                  <div className="pt-2 border-t border-[#E8E2D9]/50 flex justify-between md:max-w-[300px]">
                                    <span className="font-bold text-[#1A120B]">{t('totalCost')}</span>
                                    <span className="font-bold text-[#D4A853] text-lg">{order.totalPrice} MDL</span>
                                  </div>
                                </div>
                                
                                <div className="flex flex-col gap-3 w-full md:w-1/3">
                                  <button 
                                    onClick={() => handleReorder(order)}
                                    className="w-full px-6 py-3 bg-[#1A120B] text-white rounded-full font-bold hover:bg-[#D4A853] transition-colors flex items-center justify-center gap-2"
                                  >
                                    <span>{t('orderAgain')}</span>
                                    <Package size={16} />
                                  </button>

                                  {order.rating ? (
                                    <div className="w-full px-6 py-2.5 bg-[#D4A853]/10 border border-[#D4A853]/30 rounded-full flex items-center justify-center gap-1.5 text-[#D4A853] font-bold text-sm">
                                      <Star size={16} className="fill-[#D4A853]" />
                                      <span>{t('youGaveStars', { rating: order.rating })}</span>
                                    </div>
                                  ) : (
                                    <button 
                                      onClick={() => {
                                        setReviewOrder(order);
                                        setSelectedRating(5);
                                        setReviewComment("");
                                      }}
                                      className="w-full px-6 py-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-full font-bold hover:bg-amber-100 transition-colors flex items-center justify-center gap-2"
                                    >
                                      <Star size={16} className="text-amber-600" />
                                      <span>{t('leaveReview')}</span>
                                    </button>
                                  )}


                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })
                )}
              </motion.div>
            </motion.div>
              )}

              {activeTab === "adrese" && (
                <motion.div
                  key="adrese"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <AddressManager />
                </motion.div>
              )}

              {activeTab === "setari" && (
                <motion.div
                  key="setari"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <AccountSettings />
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </div>
      
      {/* Modal Evaluare Comandă */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {reviewOrder && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ position: 'fixed' }}>
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setReviewOrder(null)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-[32px] p-8 w-full max-w-md relative z-10 shadow-2xl border border-[#E8E2D9]"
              >
                <h3 className="text-2xl font-serif text-[#1A120B] mb-2 text-center">Cum a fost comanda ta?</h3>
                <p className="text-xs text-[#1A120B]/60 text-center mb-6">
                  Comanda #{reviewOrder._id.slice(-6).toUpperCase()}
                </p>

                <form onSubmit={handleReviewSubmit} className="space-y-6">
                  {/* Stele */}
                  <div className="flex justify-center items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setSelectedRating(star)}
                        className="p-1 hover:scale-125 transition-transform"
                      >
                        <Star 
                          size={32} 
                          className={star <= selectedRating ? "text-[#D4A853] fill-[#D4A853]" : "text-[#E8E2D9]"} 
                        />
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1A120B]/70 mb-2">Comentariul tău (opțional)</label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Spune-ne cum a fost gustul, livrarea etc..."
                      className="w-full bg-[#FFFCF6] border border-[#E8E2D9] rounded-2xl p-4 text-sm text-[#1A120B] focus:outline-none focus:border-[#D4A853] min-h-[90px] resize-none"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setReviewOrder(null)}
                      className="flex-1 py-3.5 bg-gray-100 text-[#1A120B]/70 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                    >
                      Anulează
                    </button>
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="flex-1 py-3.5 bg-[#1A120B] text-white rounded-xl font-bold hover:bg-[#D4A853] transition-colors disabled:opacity-50"
                    >
                      {submittingReview ? "Se trimite..." : "Trimite Recenzia"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      <Footer />
    </main>
  );
}

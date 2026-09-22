"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  CheckCircle2, 
  Clock, 
  ChefHat, 
  Truck, 
  MapPin, 
  PackageOpen, 
  XCircle, 
  Bell, 
  Phone, 
  RotateCcw, 
  X, 
  AlertCircle,
  Copy,
  Check
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useTranslations } from 'next-intl';

export default function OrderTrackingPage() {
  const t = useTranslations('OrderTracking');
  
  const STEPS = [
    { id: "pending", label: t('orderPlaced'), icon: Clock },
    { id: "preparing", label: t('preparing'), icon: ChefHat },
    { id: "delivering", label: t('delivering'), icon: Truck },
    { id: "completed", label: t('delivered'), icon: PackageOpen }
  ];
  
  const params = useParams();
  const router = useRouter();
  const [orderData, setOrderData] = useState<any>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Web Push Notification State
  const [notifPermission, setNotifPermission] = useState<string>("default");
  const [isDismissedBanner, setIsDismissedBanner] = useState<boolean>(false);
  const prevStatusRef = useRef<string | null>(null);

  // Floating Support Toast & Copy State (Varianta 3 pentru toate dispozitivele)
  const [showSupportToast, setShowSupportToast] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const copyPhoneNumber = async () => {
    const phone = "+37379006499";
    let copied = false;
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(phone);
        copied = true;
      }
    } catch (_) {}

    if (!copied && typeof document !== "undefined") {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = phone;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        copied = true;
      } catch (e) {
        console.warn("Could not copy phone fallback:", e);
      }
    }
    return copied;
  };

  const handleSupportClick = async (e: React.MouseEvent) => {
    e.preventDefault();

    // 1. Copiere imediată în clipboard pe orice dispozitiv
    await copyPhoneNumber();
    setIsCopied(true);
    setShowSupportToast(true);

    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = setTimeout(() => {
      setShowSupportToast(false);
      setIsCopied(false);
    }, 4500);

    // 2. Pe dispozitive mobile / tactile se lansează direct apelul nativ
    const isMobile = typeof window !== "undefined" && (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      window.innerWidth < 768 ||
      (window.matchMedia && window.matchMedia("(pointer: coarse)").matches)
    );

    if (isMobile) {
      setTimeout(() => {
        window.location.href = "tel:+37379006499";
      }, 150);
    }
  };

  const orderId = typeof params?.id === 'string' ? params.id : '...';

  // Verificare suport și permisiune nativă de notificări browser
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotifPermission(window.Notification.permission);
      const isDismissed = localStorage.getItem(`notif_dismissed_${orderId}`);
      if (isDismissed) setIsDismissedBanner(true);
    } else {
      setNotifPermission("unsupported");
    }
  }, [orderId]);

  const handleRequestNotificationPermission = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      try {
        const permission = await window.Notification.requestPermission();
        setNotifPermission(permission);
        if (permission === "granted") {
          new window.Notification(t('notifWelcomeTitle') || "Munchotella", {
            body: t('notifWelcomeBody') || "Te vom anunța la fiecare pas al comenzii!",
            icon: "/icon.png"
          });
        }
      } catch (err) {
        console.warn("Notification permission request error:", err);
      }
    }
  };

  const handleDismissBanner = () => {
    setIsDismissedBanner(true);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`notif_dismissed_${orderId}`, "true");
      } catch (_) {}
    }
  };

  const getStepIndex = (status: string) => {
    switch (status) {
      case "pending":
      case "confirmed":
        return 0;
      case "preparing":
      case "ready":
        return 1;
      case "delivering":
        return 2;
      case "delivered":
      case "completed":
        return 3;
      case "cancelled":
        return -1; // Status dedicat anulare
      default:
        return 0;
    }
  };

  // Trimitere notificare browser la schimbarea de status
  const triggerStatusChangeNotification = (newStatus: string) => {
    if (typeof window === "undefined" || !("Notification" in window) || window.Notification.permission !== "granted") {
      return;
    }

    let body = "";
    if (newStatus === "preparing") body = t('notifPreparingBody');
    else if (newStatus === "delivering") body = t('notifDeliveringBody');
    else if (newStatus === "delivered" || newStatus === "completed") body = t('notifDeliveredBody');
    else if (newStatus === "cancelled") body = t('notifCancelledBody');

    if (body) {
      try {
        new window.Notification("Munchotella", {
          body,
          icon: "/icon.png"
        });
      } catch (e) {
        console.warn("Could not dispatch browser notification:", e);
      }
    }
  };

  useEffect(() => {
    if (!orderId || orderId === '...') return;

    let isMounted = true;
    let pollInterval: NodeJS.Timeout | null = null;

    const fetchOrder = async (isFirstLoad: boolean = false) => {
      try {
        const API_URL = "https://munchotella-api.onrender.com/api";
        const res = await fetch(`${API_URL}/orders/track/${orderId}`, {
          credentials: "include"
        });
        const data = await res.json();

        if (!isMounted) return;

        if (data.success && data.data) {
          const freshOrder = data.data;
          setOrderData(freshOrder);
          const currentStatus = freshOrder.status || "pending";
          setCurrentStepIndex(getStepIndex(currentStatus));
          setError(null);

          // Declanșare notificare push la schimbarea statusului
          if (prevStatusRef.current && prevStatusRef.current !== currentStatus) {
            triggerStatusChangeNotification(currentStatus);
          }
          prevStatusRef.current = currentStatus;

          // Dacă statusul a ajuns la stare finală (anulată sau livrată), oprim polling-ul inutil
          if (currentStatus === "cancelled" || currentStatus === "delivered" || currentStatus === "completed") {
            if (pollInterval) {
              clearInterval(pollInterval);
              pollInterval = null;
            }
          }
        } else {
          if (isFirstLoad) {
            setError(data.message || "Comanda nu a fost găsită.");
          }
        }
      } catch (err: any) {
        console.error("Eroare la preluarea comenzii:", err);
        if (isFirstLoad && !orderData) {
          setError("Eroare la încărcarea comenzii.");
        }
      } finally {
        if (isMounted && isFirstLoad) {
          setLoading(false);
        }
      }
    };

    fetchOrder(true);

    // Polling la fiecare 5 secunde cât timp comanda este activă
    pollInterval = setInterval(() => {
      fetchOrder(false);
    }, 5000);

    return () => {
      isMounted = false;
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFCF6] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#D4A853] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <main className="min-h-screen bg-[#FFFCF6] flex flex-col">
        <Navbar />
        <div className="flex-1 pt-32 pb-24 max-w-[800px] mx-auto px-6 w-full flex flex-col items-center justify-center text-center">
          <h1 className="text-3xl font-serif text-[#1A120B] mb-4">Ups!</h1>
          <p className="text-[#1A120B]/60 mb-8">{error || "Comanda nu a fost găsită"}</p>
          <button onClick={() => router.push('/menu')} className="bg-[#1A120B] text-white px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#D4A853] hover:text-[#1A120B] transition-colors cursor-pointer">
            Mergi la Meniu
          </button>
        </div>
        <Footer />
      </main>
    );
  }

  const isCancelled = orderData.status === "cancelled";
  const displayOrderNumber = orderData?._id 
    ? String(orderData._id).slice(-6).toUpperCase()
    : String(orderId).replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase();

  return (
    <main className="min-h-screen bg-[#FFFCF6] flex flex-col selection:bg-[#D4A853] selection:text-white">
      <Navbar />
      
      <div className="flex-1 pt-32 pb-24 max-w-[800px] mx-auto px-6 w-full">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#1A120B]/60 hover:text-[#D4A853] transition-colors cursor-pointer"
          >
            <ChevronLeft size={20} />
            <span className="font-medium">{t('back')}</span>
          </button>

          {/* Status Badge */}
          {isCancelled ? (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              {t('orderCancelledTitle')}
            </span>
          ) : notifPermission === "granted" ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {t('notifBannerActive')}
            </span>
          ) : null}
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-serif text-[#1A120B] mb-3">{t('orderTracking')}</h1>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#E8E2D9] shadow-[0_2px_10px_rgba(26,18,11,0.03)]">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#736A60]">{t('orderLabel')}</span>
            <span className="font-mono font-bold text-sm text-[#1A120B] tracking-wider">#{displayOrderNumber}</span>
          </div>
        </div>

        {/* ═══ BANNER NOTIFICĂRI PUSH (WARM LUXURY & EDITORIAL) ═══ */}
        <AnimatePresence>
          {!isCancelled && notifPermission === "default" && !isDismissedBanner && (
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="bg-white rounded-3xl border border-[#E8E2D9] p-5 md:p-6 mb-8 shadow-[0_10px_30px_rgba(26,18,11,0.04)] relative overflow-hidden"
            >
              <button 
                onClick={handleDismissBanner}
                aria-label="Închide banner notificări"
                className="absolute top-4 right-4 text-[#736A60] hover:text-[#1A120B] p-1.5 rounded-full hover:bg-[#FAF7F2] transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pr-6">
                <div className="w-12 h-12 rounded-2xl bg-[#D4A853]/15 border border-[#D4A853]/30 flex items-center justify-center text-[#D4A853] shrink-0">
                  <Bell className="w-6 h-6 animate-bounce" />
                </div>
                <div className="flex-1">
                  <h4 className="font-serif text-base md:text-lg font-bold text-[#1A120B]">
                    {t('notifBannerTitle')}
                  </h4>
                  <p className="text-xs md:text-sm text-[#736A60] mt-1 leading-relaxed">
                    {t('notifBannerDesc')}
                  </p>
                </div>
                <button
                  onClick={handleRequestNotificationPermission}
                  className="w-full sm:w-auto bg-[#1A120B] hover:bg-[#D4A853] hover:text-[#1A120B] text-white px-5 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-md shrink-0 cursor-pointer"
                >
                  {t('notifBannerBtn')}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══ CAZUL 1: COMANDĂ ANULATĂ ═══ */}
        {isCancelled ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-white p-8 md:p-12 rounded-[32px] border border-red-200 shadow-sm mb-8 text-center"
          >
            <div className="w-20 h-20 bg-red-50 text-red-600 border border-red-200/80 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <XCircle className="w-10 h-10" />
            </div>

            <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#1A120B] mb-3">
              {t('orderCancelledTitle')}
            </h2>

            <p className="text-[#736A60] text-sm md:text-base max-w-lg mx-auto leading-relaxed mb-8">
              {t('orderCancelledDesc')}
            </p>

            {/* Butoane Acțiune Comandă Anulată */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => router.push('/menu')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#1A120B] hover:bg-[#D4A853] hover:text-[#1A120B] text-white px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-md cursor-pointer"
              >
                <RotateCcw size={16} />
                <span>{t('orderAgain')}</span>
              </button>

              <button 
                type="button"
                onClick={handleSupportClick}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 border px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-sm cursor-pointer ${
                  isCopied
                    ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                    : "border-[#E8E2D9] hover:bg-[#FAF7F2] text-[#1A120B]"
                }`}
              >
                {isCopied ? (
                  <>
                    <Check size={16} className="text-emerald-600" />
                    <span>{t('phoneCopied')}</span>
                  </>
                ) : (
                  <>
                    <Phone size={16} className="text-[#D4A853]" />
                    <span>{t('callRestaurant')}</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        ) : (
          /* ═══ CAZUL 2: COMANDĂ ACTIVĂ (STATUS TRACKER) ═══ */
          <div className="bg-white p-8 md:p-12 rounded-[32px] border border-[#E8E2D9] shadow-sm mb-8">
            <div className="relative">
              {/* Background Line */}
              <div className="absolute top-8 left-[10%] right-[10%] h-1 bg-[#E8E2D9] rounded-full hidden md:block"></div>
              
              {/* Active Line */}
              <div 
                className="absolute top-8 left-[10%] h-1 bg-[#D4A853] rounded-full hidden md:block transition-all duration-1000 ease-in-out overflow-hidden"
                style={{ width: `${(Math.max(0, currentStepIndex) / (STEPS.length - 1)) * 80}%` }}
              >
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-full"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                />
              </div>

              <div className="flex flex-col md:flex-row justify-between relative z-10 gap-8 md:gap-0">
                {STEPS.map((step, index) => {
                  const isCompleted = index <= currentStepIndex;
                  const isActive = index === currentStepIndex;
                  const Icon = step.icon;

                  return (
                    <div key={step.id} className="flex md:flex-col items-center gap-4 md:gap-2 relative group">
                      {/* Vertical Line for Mobile */}
                      {index !== STEPS.length - 1 && (
                        <div className={`absolute left-8 top-16 bottom-[-32px] w-0.5 md:hidden ${index < currentStepIndex ? 'bg-[#D4A853]' : 'bg-[#E8E2D9]'}`}></div>
                      )}
                      
                      <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className={`w-16 h-16 rounded-full flex items-center justify-center border-4 transition-colors duration-500 z-10 relative bg-white ${
                          isActive 
                            ? "border-[#D4A853] text-[#D4A853]" 
                            : isCompleted 
                              ? "border-[#D4A853] bg-[#D4A853] text-white" 
                              : "border-[#E8E2D9] text-[#1A120B]/30"
                        }`}
                      >
                        {isCompleted && !isActive ? <CheckCircle2 size={28} /> : <Icon size={28} />}
                        
                        {isActive && (
                          <div className="absolute inset-0 rounded-full border-4 border-[#D4A853] animate-ping opacity-20"></div>
                        )}
                      </motion.div>
                      
                      <div className="md:text-center">
                        <p className={`font-bold transition-colors duration-500 ${isCompleted ? "text-[#1A120B]" : "text-[#1A120B]/40"}`}>
                          {step.label}
                        </p>
                        {isActive && (
                          <p className="text-[12px] text-[#D4A853] mt-1 hidden md:block">{t('inProgress')}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ═══ DETALII LIVRARE & SUPORT ═══ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Adresă Destinație */}
          <div className="bg-[#1A120B] p-8 rounded-[32px] text-white shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <MapPin size={24} className="text-[#D4A853]" />
                <h3 className="font-bold text-lg">{t('deliveryAddress')}</h3>
              </div>
              {orderData.deliveryType === "pickup" ? (
                <>
                  <p className="text-white/90 font-medium">Nicolae Testemițanu 21/1</p>
                  <p className="text-[#D4A853] text-sm mt-1">Preluare Gratuită din Boutique</p>
                </>
              ) : (
                <>
                  <p className="text-white/90 font-medium">{orderData.customer?.address || "Chișinău, Moldova"}</p>
                  {orderData.customer?.notes && (
                    <p className="text-white/60 text-sm mt-2 italic bg-white/5 p-3 rounded-xl border border-white/10">
                      „{orderData.customer.notes}”
                    </p>
                  )}
                </>
              )}
            </div>

            {!isCancelled && (
              <div className="mt-8 pt-6 border-t border-white/10">
                <p className="text-white/40 text-xs uppercase tracking-wider mb-1.5">{t('estimatedTime')}</p>
                <p className="text-3xl font-serif text-[#FDF9F1]">
                  {orderData.deliveryType === "pickup" ? "15 - 20" : "30 - 45"} {t('min')}
                </p>
              </div>
            )}
          </div>
          
          {/* Card Curier & Asistență Directă prin Telefon */}
          <div className="bg-white p-8 rounded-[32px] border border-[#E8E2D9] flex flex-col justify-center items-center text-center shadow-sm">
            <motion.div 
              animate={!isCancelled ? { y: [0, -8, 0] } : undefined}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="w-16 h-16 bg-[#1A120B]/5 rounded-2xl flex items-center justify-center text-[#1A120B] mb-4 shadow-[0_10px_30px_rgba(26,18,11,0.04)]"
            >
              <Truck size={28} className="text-[#D4A853]" />
            </motion.div>
            
            <h3 className="font-bold text-[#1A120B] mb-2 text-lg">
              {isCancelled 
                ? "Ai nevoie de ajutor cu această comandă?" 
                : orderData.deliveryType === "pickup" 
                  ? "Preluare din Boutique" 
                  : t('ownCourier')}
            </h3>

            <p className="text-[#736A60] text-sm mb-6 leading-relaxed max-w-xs">
              {isCancelled
                ? "Dispeceratul nostru este la dispoziția ta pentru orice clarificare legată de comanda anulată."
                : orderData.deliveryType === "pickup" 
                  ? "Te așteptăm cu drag în boutique-ul nostru din Str. Nicolae Testemițanu 21/1!" 
                  : t('courierAssigned')}
            </p>

            {/* BUTON DE SUPORT (ONE-CLICK COPY & TOAST DISCRET PENTRU TOATE DISPOZITIVELE) */}
            <button 
              type="button"
              onClick={handleSupportClick}
              className={`inline-flex items-center justify-center gap-2.5 px-7 py-3.5 border-2 rounded-full font-bold text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer group ${
                isCopied 
                  ? "border-emerald-500 bg-emerald-50 text-emerald-800" 
                  : "border-[#E8E2D9] hover:border-[#1A120B] hover:bg-[#1A120B] hover:text-white text-[#1A120B]"
              }`}
            >
              {isCopied ? (
                <>
                  <Check size={15} className="text-emerald-600 animate-in fade-in" />
                  <span>{t('phoneCopied')}</span>
                </>
              ) : (
                <>
                  <Phone size={15} className="text-[#D4A853] group-hover:scale-110 transition-transform" />
                  <span>{t('contactSupport')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ═══ AIRBNB-STYLE DISCREET LUXURY TOAST (FIX ÎN FIX DLS) ═══ */}
      <AnimatePresence>
        {showSupportToast && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] max-w-[94vw] sm:max-w-max pointer-events-auto"
            role="status"
            aria-live="polite"
          >
            <div className="bg-[#222222] text-white px-4 sm:px-5 py-3 rounded-full shadow-[0_8px_28px_rgba(0,0,0,0.28)] border border-white/10 flex items-center gap-3 sm:gap-4 text-sm font-medium">
              {/* Checkmark Icon Circle */}
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Check size={14} className="stroke-[2.5]" />
              </div>

              {/* Message & Phone Number */}
              <div className="flex items-center gap-1.5 text-[13px] sm:text-[14px] whitespace-nowrap">
                <span className="text-white/80">{t('copiedToClipboard')}</span>
                <span className="font-semibold text-white font-mono tracking-wide">+373 79 006 499</span>
              </div>

              {/* Subtle Vertical Hairline Divider */}
              <div className="h-4 w-px bg-white/20 hidden sm:block shrink-0" />

              {/* Action Call Link */}
              <a
                href="tel:+37379006499"
                className="text-xs font-bold text-[#D4A853] hover:text-white uppercase tracking-wider px-2 py-1 rounded transition-colors whitespace-nowrap shrink-0 hover:underline cursor-pointer"
              >
                {t('callNow')}
              </a>

              {/* Dismiss Button */}
              <button
                type="button"
                onClick={() => setShowSupportToast(false)}
                className="text-white/40 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10 shrink-0 cursor-pointer -mr-1"
                aria-label="Închide"
              >
                <X size={15} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <Footer />
    </main>
  );
}

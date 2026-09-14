"use client";

import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link } from "@/i18n/routing";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  MapPin,
  ShoppingBag,
  Truck,
  Store,
  Clock,
  Car,
  CreditCard,
  Banknote,
  Tag,
  CheckCircle2,
  AlertCircle,
  User,
  FileText,
  ChevronDown,
  Smartphone,
  X,
  Loader2
} from "lucide-react";
import { auth } from "@/lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import LiveStoreStatus from "@/components/LiveStoreStatus";
import MapAutocomplete from "@/components/ui/MapAutocomplete";
import MapPickerModal from "@/components/profile/MapPickerModal";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { translateTopping } from "@/utils/toppingTranslations";
import CountrySelector from "@/components/ui/CountrySelector";
import { ALL_COUNTRIES, Country } from "@/data/countries";
import PaymentBadges from "@/components/PaymentBadges";

// GPS Coordonate Restaurant Munchotella — Nicolae Testemițanu 21/1, Chișinău
const RESTAURANT_LOCATION = {
  lat: 46.996452,
  lng: 28.834809,
};

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function CheckoutPage() {
  const t = useTranslations("Checkout");
  const locale = useLocale();
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [activeStep, setActiveStep] = useState<number>(1);
  const [selectedCountry, setSelectedCountry] = useState<Country>(ALL_COUNTRIES[0]);
  const [deliveryType, setDeliveryType] = useState<"delivery" | "pickup">("delivery");
  const [doorDelivery, setDoorDelivery] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "pos" | "online">("cash");
  const [timing, setTiming] = useState<"asap" | "scheduled">("asap");
  const [scheduledTime, setScheduledTime] = useState("18:00");

  const [couponCode, setCouponCode] = useState("");
  const [activePromo, setActivePromo] = useState<{
    code: string;
    type: string;
    value: number;
    maxDiscountAmount: number;
    display: string;
  } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    street: "",
    house: "",
    apartment: "",
    intercom: "",
    notes: "",
    estimatedKm: 0,
    lat: 46.996452,
    lng: 28.834809,
  });

  const { user, token, updateUser, login } = useAuth();

  // Pre-fill user data if available
  React.useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [termsError, setTermsError] = useState(false);

  // OTP states for guest cash orders
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isDevMockOtp, setIsDevMockOtp] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [smsDispatchError, setSmsDispatchError] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendCount, setResendCount] = useState(0);

  // Stare program magazin dinamic
  const [storeStatus, setStoreStatus] = useState<{
    isOpen: boolean;
    isEmergencyClosed?: boolean;
    reason?: string;
    nextOpening?: { label: string; time: string; date: string } | null;
  }>({ isOpen: true });

  const [draftOrderId, setDraftOrderId] = useState<string | null>(null);

  // Verificare status magazin la inițializare
  React.useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("https://munchotella-api.onrender.com/api/settings/store-status");
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            setStoreStatus(data.data);
            // Dacă magazinul este închis, forțăm comanda pe 'scheduled' și setăm ora de deschidere
            if (!data.data.isOpen) {
              setTiming("scheduled");
              if (data.data.nextOpening?.time) {
                setScheduledTime(data.data.nextOpening.time);
              }
            }
          }
        }
      } catch (err) {
        console.error("Store status check failed:", err);
      }
    };
    fetchStatus();
  }, []);

  // ═══ LEAD CAPTURE: Salvare automată a coșului abandonat (Draft Order) ═══
  // Când clientul a introdus un număr de telefon valid (>=6 cifre) și are produse în coș,
  // salvăm silențios în fundal datele pentru ca echipa să îl poată contacta dacă abandonează.
  React.useEffect(() => {
    const cleanPhone = formData.phone.replace(/[^\d+]/g, '');
    if (cleanPhone.length < 6 || items.length === 0) return;

    const timer = setTimeout(async () => {
      try {
        const res = await fetch("https://munchotella-api.onrender.com/api/orders/draft", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            draftOrderId,
            customer: {
              name: formData.name || "Oaspete",
              phone: `${selectedCountry.dialCode}${cleanPhone.startsWith('+') ? cleanPhone.slice(selectedCountry.dialCode.length) : cleanPhone}`,
              address: formData.street,
              notes: formData.notes,
              coordinates: { lat: formData.lat, lng: formData.lng },
            },
            items: items.map(i => ({
              menuItemId: i.id || i.cartItemId,
              name: i.name,
              price: i.price,
              quantity: i.quantity,
              variantName: (i as any).selectedVariant,
              modifiers: i.selectedToppings?.map((t: any) => ({
                title: t.groupName || 'Topping',
                optionName: t.name,
                price: t.price,
              })),
            })),
            deliveryType,
            doorDelivery,
          }),
        });

        const data = await res.json();
        if (data.success && data.draftOrderId) {
          setDraftOrderId(data.draftOrderId);
        }
      } catch (err) {
        // Ignorăm erorile de fundal pentru a nu deranja clientul
      }
    }, 1800); // 1.8 secunde debounce după tastare

    return () => clearTimeout(timer);
  }, [formData.phone, formData.name, formData.street, items, deliveryType, doorDelivery, selectedCountry.dialCode]);

  React.useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(prev => prev - 1), 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [resendCooldown]);


  // Exact Munchotella Backend Delivery Calculation Engine
  const hasAddress = !!formData.street.trim();

  const deliveryCalc = useMemo(() => {
    if (deliveryType === "pickup") {
      return {
        fee: 0,
        isDeliverable: true,
        isPedestrian: false,
        distanceKm: 0,
        hasAddress: true,
        typeLabel: "Preluare Gratuită din Boutique",
      };
    }

    if (!formData.street.trim()) {
      return {
        fee: 0,
        isDeliverable: true,
        isPedestrian: false,
        distanceKm: 0,
        hasAddress: false,
        typeLabel: "Introduceți adresa de livrare",
      };
    }

    const roadDistance = formData.estimatedKm;

    if (roadDistance > 10.0) {
      return {
        fee: 0,
        isDeliverable: false,
        isPedestrian: false,
        distanceKm: roadDistance,
        hasAddress: true,
        typeLabel: "În Afara Ariei de Livrare (max 10 km)",
      };
    }

    if (roadDistance < 1.0) {
      let fee = 20;
      if (roadDistance >= 0.2 && roadDistance < 0.55) fee = 30;
      else if (roadDistance >= 0.55) fee = 40;
      if (doorDelivery) fee += 20;
      return {
        fee,
        isDeliverable: true,
        isPedestrian: true,
        distanceKm: Math.round(roadDistance * 10) / 10,
        hasAddress: true,
        typeLabel: doorDelivery ? "Livrare Pietonală la Ușă" : "Livrare Pietonală la Scară",
      };
    }

    // Letz Taxi Formula: 30 MDL pornire + 6.45 MDL/km
    const startPrice = 30;
    const perKmPrice = 6.45;
    const fee = Math.ceil(startPrice + (roadDistance * perKmPrice));

    return {
      fee,
      isDeliverable: true,
      isPedestrian: false,
      distanceKm: Math.round(roadDistance * 10) / 10,
      hasAddress: true,
      typeLabel: "Livrare prin Taxi",
    };
  }, [deliveryType, doorDelivery, formData.street, formData.estimatedKm]);

  let discountAmount = 0;
  if (activePromo) {
    if (activePromo.type === 'percentage') {
      discountAmount = Math.round((totalPrice * activePromo.value) / 100);
    } else if (activePromo.type === 'fixed') {
      discountAmount = activePromo.value;
    }
    
    if (activePromo.maxDiscountAmount && activePromo.maxDiscountAmount > 0) {
      if (discountAmount > activePromo.maxDiscountAmount) {
        discountAmount = activePromo.maxDiscountAmount;
      }
    }
  }

  if (discountAmount > totalPrice) {
    discountAmount = totalPrice;
  }

  let deliveryFee = (deliveryType === 'delivery' && !hasAddress) ? 0 : deliveryCalc.fee;
  
  if (activePromo) {
    if (activePromo.type === 'free_shipping') {
      deliveryFee = 0;
    } else if (activePromo.type === 'delivery_percentage') {
      let deliveryDiscount = Math.round((deliveryFee * activePromo.value) / 100);
      if (activePromo.maxDiscountAmount && activePromo.maxDiscountAmount > 0) {
        if (deliveryDiscount > activePromo.maxDiscountAmount) {
          deliveryDiscount = activePromo.maxDiscountAmount;
        }
      }
      deliveryFee = Math.max(0, deliveryFee - deliveryDiscount);
    }
  }

  const grandTotal = Math.max(0, totalPrice - discountAmount + deliveryFee);

  React.useEffect(() => {
    if (!deliveryCalc.isPedestrian && doorDelivery) {
      setDoorDelivery(false);
    }
  }, [deliveryCalc.isPedestrian, doorDelivery]);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    try {
      const res = await fetch("https://munchotella-api.onrender.com/api/promo/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ code })
      });
      const data = await res.json();
      
      if (data.success) {
        setActivePromo({
          code: data.data.code,
          type: data.data.discountType,
          value: data.data.discountValue,
          maxDiscountAmount: data.data.maxDiscountAmount,
          display: data.data.discountDisplay
        });
      } else {
        setCouponError(data.message || t('promoInvalid'));
        setActivePromo(null);
      }
    } catch (err) {
      setCouponError(t('promoError'));
      setActivePromo(null);
    }
  };

  const setupRecaptcha = () => {
    try {
      if ((window as any).recaptchaVerifierCheckout) {
        try {
          (window as any).recaptchaVerifierCheckout.clear();
        } catch (_) {}
        (window as any).recaptchaVerifierCheckout = null;
      }
      (window as any).recaptchaVerifierCheckout = new RecaptchaVerifier(auth, "recaptcha-container-checkout", {
        size: "invisible",
      });
    } catch (e) {
      console.error("Recaptcha setup error:", e);
    }
  };

  const triggerOtpSms = async () => {
    const cleanDigits = formData.phone.replace(/[^\d]/g, '').replace(/^0+/, '');
    if (!cleanDigits || cleanDigits.length < 6) {
      setSmsDispatchError(t('otpPhoneMissing') || "Te rugăm să introduci un număr de telefon valid.");
      return false;
    }

    setIsSendingOtp(true);
    setOtpError("");
    setSmsDispatchError("");
    setIsDevMockOtp(false);
    
    try {
      if (typeof window !== "undefined" && auth) {
        setupRecaptcha();
        const appVerifier = (window as any).recaptchaVerifierCheckout;
        const phoneFormatted = formData.phone.trim().startsWith('+')
          ? `+${formData.phone.replace(/[^\d]/g, '')}`
          : `${selectedCountry.dialCode}${cleanDigits}`;

        const confirmation = await signInWithPhoneNumber(auth, phoneFormatted, appVerifier);
        setConfirmationResult(confirmation);
        setOtpCode("");
        setIsDevMockOtp(false);
        setIsOtpModalOpen(true);
        setResendCooldown(60);
        setResendCount(prev => prev + 1);
        return true;
      } else {
        throw new Error("Firebase Auth not initialized");
      }
    } catch (err: any) {
      console.error("SMS Trigger Error:", err);
      if ((window as any).recaptchaVerifierCheckout) {
        try { (window as any).recaptchaVerifierCheckout.clear(); } catch (_) {}
        (window as any).recaptchaVerifierCheckout = null;
      }

      // Verificăm dacă eroarea este cauzată de restricțiile HTTP Referrer pe localhost
      const isRefererBlocked = err.code?.includes('requests-from-referer') || 
                               err.message?.includes('requests-from-referer') ||
                               err.message?.includes('referer');
      const isLocalhost = typeof window !== 'undefined' && 
                          (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

      if (isRefererBlocked && isLocalhost) {
        console.warn("Google API Key blochează referer-ul de localhost. Se activează modul de testare locală OTP.");
        setIsDevMockOtp(true);
        setOtpCode("");
        setIsOtpModalOpen(true);
        setResendCooldown(60);
        return true;
      }

      const userFriendlyMsg = err.code === 'auth/quota-exceeded'
        ? "Limita de SMS-uri zilnice a fost atinsă. Poți plasa comanda cu confirmare prin apel telefonic sau alege plata online cu cardul."
        : (err.message || "Eroare la trimiterea codului SMS. Verifică numărul și încearcă din nou.");
      setSmsDispatchError(userFriendlyMsg);
      setOtpError(userFriendlyMsg);
      return false;
    } finally {
      setIsSendingOtp(false);
    }
  };

  const executePlaceOrder = async (overrideToken?: string, unverifiedPhone: boolean = false) => {
    setIsSubmitting(true);
    const activeAuthToken = overrideToken || token;

    try {
      const menuItems = items.filter(i => !String(i.cartItemId).startsWith('drink_'));
      const drinkItems = items.filter(i => String(i.cartItemId).startsWith('drink_'));

      // Pregătește adresa completă (pentru preluare se folosește adresa boutique-ului)
      let fullAddress = deliveryType === 'pickup'
        ? "Preluare din Boutique (Nicolae Testemițanu 21/1)"
        : formData.street;
      const extras = [];
      if (deliveryType === 'delivery' && formData.house) extras.push(`Bloc/Scară: ${formData.house}`);
      if (extras.length > 0) {
        fullAddress += ` (${extras.join(', ')})`;
      }

      const aggregatedNotes = [
        formData.notes,
        ...items.filter(i => (i as any).customization).map(i => `Notă ${i.name}: ${(i as any).customization}`)
      ].filter(Boolean).join(" | ");

      const orderCoordinates = deliveryType === 'pickup'
        ? { lat: RESTAURANT_LOCATION.lat, lng: RESTAURANT_LOCATION.lng }
        : { lat: formData.lat, lng: formData.lng };

      const orderPayload = {
        customer: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: fullAddress,
          notes: aggregatedNotes,
          coordinates: orderCoordinates
        },
        items: menuItems.map(i => ({
          menuItemId: i.id || i.cartItemId,
          quantity: i.quantity,
          variantName: (i as any).selectedVariant,
          modifiers: [
            ...(i.selectedToppings?.map((t: any) => ({
              title: t.groupName || 'Topping',
              optionName: t.name
            })) || []),
            ...((i as any).customization ? [{ title: 'Preferință', optionName: (i as any).customization }] : [])
          ]
        })),
        drinks: drinkItems.map(i => ({
          name: i.name,
          quantity: i.quantity
        })),
        paymentMethod: paymentMethod === "online" ? "card" : paymentMethod,
        doorDelivery,
        deliveryType,
        needsCutlery: false,
        promoCode: activePromo ? activePromo.code : undefined,
        timing,
        scheduledTime: timing === "scheduled" ? scheduledTime : null,
        draftOrderId: draftOrderId || undefined,
        unverifiedPhone,
      };

      const API_URL = "https://munchotella-api.onrender.com/api";
      
      const res = await fetch(`${API_URL}/orders`, {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(activeAuthToken ? { "Authorization": `Bearer ${activeAuthToken}` } : {})
        },
        body: JSON.stringify(orderPayload)
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Eroare la plasarea comenzii");
      }

      // Auto-autentificare dacă s-a creat cont la comanda cu cardul
      if (data.autoAuth && data.autoAuth.user && data.autoAuth.token) {
        try {
          login(data.autoAuth.user, data.autoAuth.token);
        } catch (authE) {
          console.error("Auto login error:", authE);
        }
      } else if (user || activeAuthToken) {
         try {
           const profileRes = await fetch(`${API_URL}/auth/me`, {
             credentials: "include",
             headers: { "Authorization": `Bearer ${activeAuthToken || token}` }
           });
           const profileData = await profileRes.json();
           if (profileData.success) {
             updateUser(profileData.data);
           }
         } catch(e) { console.error(e); }
      }

      clearCart();
      const trackingTarget = data.data?.trackingCode || data.data?._id;
      router.push(`/order-tracking/${trackingTarget}`);
      
    } catch (err: any) {
      console.error(err);
      alert(err.message || "A apărut o problemă la trimiterea comenzii. Vă rugăm să încercați din nou.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePlaceOrderWithCallConfirmation = async () => {
    setIsOtpModalOpen(false);
    await executePlaceOrder(token || undefined, true);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeStep < 4) return;
    if (!deliveryCalc.isDeliverable) return;
    if (!acceptedTerms) {
      setTermsError(true);
      return;
    }
    setTermsError(false);

    // Cerință: La comanda CASH a unui client GUEST (nelogat), validăm numărul prin SMS OTP
    const isGuestCashOrder = !user && paymentMethod === "cash";
    if (isGuestCashOrder) {
      const sent = await triggerOtpSms();
      if (!sent) return;
      return;
    }

    await executePlaceOrder();
  };

  const handleVerifyOtpAndPlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) return;
    if (!confirmationResult && !isDevMockOtp) return;
    setIsVerifyingOtp(true);
    setOtpError("");

    try {
      let authToken: string | undefined = undefined;

      if (isDevMockOtp) {
        if (otpCode !== "123456") {
          throw new Error("Cod de testare invalid! Pentru test pe localhost introduceți codul: 123456");
        }
      } else if (confirmationResult) {
        // 1. Confirmare Firebase Phone Auth
        const userCredential = await confirmationResult.confirm(otpCode);
        const firebaseUser = userCredential.user;
        const idToken = await firebaseUser.getIdToken();

        // 2. Creare / conectare cont pe Backend Munchotella
        try {
          const API_URL = "https://munchotella-api.onrender.com/api";
          const authRes = await fetch(`${API_URL}/auth/social-login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              idToken,
              provider: "phone",
              name: formData.name,
              email: formData.email,
              address: formData.street,
              coordinates: { lat: formData.lat, lng: formData.lng }
            })
          });
          const authData = await authRes.json();
          if (authData.success && authData.data && authData.token) {
            authToken = authData.token;
            login(authData.data, authData.token);
          }
        } catch (backendAuthErr) {
          console.warn("Backend phone registration warn:", backendAuthErr);
        }
      }

      setIsOtpModalOpen(false);
      // 3. Plasare comandă având numărul validat (unverifiedPhone: false)
      await executePlaceOrder(authToken, false);
    } catch (error: any) {
      console.error("OTP verification error:", error);
      setOtpError(error.message || t("otpInvalid") || "Codul de verificare introdus este incorect sau a expirat.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleNextStep = (step: number) => {
    setActiveStep(step);
    // Smooth scroll to step on mobile if needed
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] text-[#1A120B] font-sans flex items-center justify-center pt-28 pb-20 px-6">
        <div className="max-w-md w-full bg-white p-10 rounded-3xl border border-[#E8E2D9] shadow-lg text-center space-y-6">
          <div className="w-20 h-20 bg-[#D4A853]/10 text-[#D4A853] rounded-full flex items-center justify-center mx-auto">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h2 className="font-serif text-3xl font-bold">{t('emptyCartTitle')}</h2>
          <p className="text-[#736A60] font-light text-sm">
            {t('emptyCartDesc')}
          </p>
          <Link
            href="/menu"
            className="inline-block w-full bg-[#1A120B] hover:bg-[#3D3028] text-white py-4 rounded-full font-bold text-xs uppercase tracking-widest transition-colors shadow-md"
          >
            {t('discoverMenu')}
          </Link>
        </div>
      </div>
    );
  }

  const accordionVariants: Variants = {
    hidden: { height: 0, opacity: 0, marginTop: 0 },
    visible: { height: "auto", opacity: 1, marginTop: 24, transition: { duration: 0.3, ease: "easeInOut" } }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1A120B] font-sans selection:bg-[#D4A853] selection:text-white pt-28 pb-32">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        {/* Header navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-5">
            <Link
              href="/menu"
              className="w-12 h-12 rounded-full border border-[#E8E2D9] bg-white flex items-center justify-center text-[#736A60] hover:border-[#D4A853] hover:text-[#1A120B] hover:shadow-md transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight">
                {t('title1')} <span className="text-[#D4A853] italic font-normal">{t('title2')}</span>
              </h1>
            </div>
          </div>
          <LiveStoreStatus isDarkBackground={false} />
        </div>

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Accordion Flow */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Step 1: Delivery Mode */}
            <div className="bg-white rounded-3xl border border-[#E8E2D9] shadow-sm overflow-hidden transition-all duration-300">
              <button 
                type="button" 
                onClick={() => setActiveStep(1)}
                className="w-full flex items-center justify-between p-6 md:p-8 bg-white cursor-pointer hover:bg-[#FFFCF6] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeStep >= 1 ? 'bg-[#1A120B] text-white' : 'bg-[#E8E2D9] text-[#736A60]'}`}>
                    1
                  </div>
                  <div className="text-left">
                    <h3 className="font-serif text-xl font-bold text-[#1A120B]">{t('step1Title')}</h3>
                    {activeStep !== 1 && (
                      <p className="text-xs text-[#736A60] font-medium mt-1">
                        {deliveryType === 'delivery' ? t('step1Courier') : t('step1Boutique')}
                      </p>
                    )}
                  </div>
                </div>
                {activeStep === 1 ? <ChevronDown className="w-6 h-6 text-[#1A120B]" /> : <CheckCircle2 className="w-6 h-6 text-[#D4A853]" />}
              </button>
              
              <AnimatePresence>
                {activeStep === 1 && (
                  <motion.div 
                    initial="hidden" 
                    animate="visible" 
                    exit="hidden" 
                    variants={accordionVariants}
                    className="px-6 md:px-8 pb-8"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setDeliveryType("delivery")}
                        className={`p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between h-32 relative overflow-hidden ${
                          deliveryType === "delivery"
                            ? "bg-[#FFFCF6] border-[#D4A853] shadow-[0_0_0_1px_#D4A853]"
                            : "bg-white border-[#E8E2D9] hover:border-[#D4A853]/50"
                        }`}
                      >
                        {deliveryType === "delivery" && <div className="absolute top-0 left-0 w-full h-1 bg-[#D4A853]" />}
                        <div className="flex justify-between items-start">
                          <Truck className={`w-7 h-7 ${deliveryType === "delivery" ? "text-[#D4A853]" : "text-[#736A60]"}`} />
                          <span className="text-[10px] font-bold uppercase tracking-widest bg-[#1A120B] text-white px-2.5 py-1 rounded-full">
                            {t('courier')}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-[#1A120B]">{t('deliveryTitle')}</h4>
                          <p className="text-[11px] text-[#736A60] mt-0.5">{t('deliveryDesc')}</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeliveryType("pickup")}
                        className={`p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between h-32 relative overflow-hidden ${
                          deliveryType === "pickup"
                            ? "bg-[#FFFCF6] border-[#D4A853] shadow-[0_0_0_1px_#D4A853]"
                            : "bg-white border-[#E8E2D9] hover:border-[#D4A853]/50"
                        }`}
                      >
                        {deliveryType === "pickup" && <div className="absolute top-0 left-0 w-full h-1 bg-[#D4A853]" />}
                        <div className="flex justify-between items-start">
                          <Store className={`w-7 h-7 ${deliveryType === "pickup" ? "text-[#D4A853]" : "text-[#736A60]"}`} />
                          <span className="text-[10px] font-bold uppercase tracking-widest bg-[#D4A853] text-[#1A120B] px-2.5 py-1 rounded-full">
                            {t('free')} (0 MDL)
                          </span>
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-[#1A120B]">{t('pickupTitle')}</h4>
                          <p className="text-[11px] text-[#736A60] mt-0.5">Nicolae Testemițanu 21/1</p>
                        </div>
                      </button>
                    </div>
                    <div className="mt-6 flex justify-end">
                      <button type="button" onClick={() => handleNextStep(2)} className="bg-[#1A120B] text-white px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#D4A853] hover:text-[#1A120B] transition-colors">
                        {t('continueBtn')}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Step 2: Date de Contact & Adresă */}
            <div className={`bg-white rounded-3xl border shadow-sm overflow-hidden transition-all duration-300 ${activeStep === 2 ? 'border-[#1A120B]' : 'border-[#E8E2D9]'}`}>
              <button 
                type="button" 
                onClick={() => { if (activeStep > 2 || activeStep < 2) setActiveStep(2) }}
                className="w-full flex items-center justify-between p-6 md:p-8 bg-white cursor-pointer hover:bg-[#FFFCF6] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeStep >= 2 ? 'bg-[#1A120B] text-white' : 'bg-[#E8E2D9] text-[#736A60]'}`}>
                    2
                  </div>
                  <div className="text-left">
                    <h3 className="font-serif text-xl font-bold text-[#1A120B]">{t('step2Title')}</h3>
                    {activeStep > 2 && formData.name && (
                      <p className="text-xs text-[#736A60] font-medium mt-1 truncate max-w-[200px] md:max-w-[300px]">
                        {formData.name} • {deliveryType === 'delivery' ? formData.street : 'Te așteptăm la noi'}
                      </p>
                    )}
                  </div>
                </div>
                {activeStep === 2 ? <ChevronDown className="w-6 h-6 text-[#1A120B]" /> : activeStep > 2 ? <CheckCircle2 className="w-6 h-6 text-[#D4A853]" /> : null}
              </button>

              <AnimatePresence>
                {activeStep === 2 && (
                  <motion.div 
                    initial="hidden" 
                    animate="visible" 
                    exit="hidden" 
                    variants={accordionVariants}
                    className="px-6 md:px-8 pb-8 space-y-6"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#736A60] mb-2">{t('nameLabel')}</label>
                        <input
                          type="text"
                          required
                          placeholder={t('placeholderName')}
                          className="w-full bg-[#FFFCF6] border border-[#E8E2D9] rounded-2xl px-5 py-3.5 text-sm outline-none focus:border-[#D4A853] focus:ring-1 focus:ring-[#D4A853] transition-all"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#736A60] mb-2">{t('phoneLabel')}</label>
                        <div className="relative flex items-center bg-[#FFFCF6] border border-[#E8E2D9] rounded-2xl shadow-sm focus-within:border-[#D4A853] focus-within:ring-1 focus-within:ring-[#D4A853] transition-all">
                          <CountrySelector
                            selectedCountry={selectedCountry}
                            onSelect={(country) => setSelectedCountry(country)}
                          />
                          <input
                            type="tel"
                            required
                            placeholder={t('placeholderPhone') || "79 000 000"}
                            className="w-full bg-transparent border-none px-4 py-3.5 outline-none text-[#1A120B] text-sm shadow-none"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="sm:col-span-2">
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#736A60]">
                            {t('emailLabel')} {paymentMethod === 'online' && <span className="text-red-500">*</span>}
                          </label>
                        </div>
                        <input
                          type="email"
                          required={paymentMethod === 'online'}
                          placeholder="client@email.com"
                          className="w-full bg-[#FFFCF6] border border-[#E8E2D9] rounded-2xl px-5 py-3.5 text-sm outline-none focus:border-[#D4A853] focus:ring-1 focus:ring-[#D4A853] transition-all"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                        <p className="text-[11px] text-[#736A60] mt-1.5 flex items-center gap-1 font-normal">
                          <span className="text-[#D4A853]">ℹ️</span> {t('emailNote')}
                        </p>
                      </div>
                    </div>

                    {deliveryType === "delivery" && (
                      <div className="space-y-6 pt-4 border-t border-[#E8E2D9]">
                        {/* Saved Addresses (Optional) */}
                        {user && user.addresses && user.addresses.length > 0 && (
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#736A60] mb-3">{t('savedAddresses')}</label>
                            <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar">
                              {user.addresses.map((addr: any) => {
                                const isSelected = formData.street === addr.street;
                                const iconName = addr.label === 'Acasă' ? '🏠' : addr.label === 'Birou' ? '💼' : addr.label === 'Prieten' ? '👥' : '📌';
                                return (
                                  <button
                                    key={addr._id}
                                    type="button"
                                    onClick={() => {
                                      const dist = getDistanceFromLatLonInKm(RESTAURANT_LOCATION.lat, RESTAURANT_LOCATION.lng, addr.lat, addr.lng);
                                      setFormData(prev => ({
                                        ...prev, street: addr.street, lat: addr.lat, lng: addr.lng, estimatedKm: dist * 1.3
                                      }));
                                    }}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs transition-all shrink-0 ${
                                      isSelected 
                                        ? 'bg-[#1A120B] border-[#1A120B] text-white font-bold shadow-md' 
                                        : 'bg-[#FFFCF6] border-[#E8E2D9] text-[#736A60] hover:border-[#D4A853]'
                                    }`}
                                  >
                                    <span>{iconName}</span>
                                    {addr.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Search Address Input & Map Button */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#736A60]">{t('deliveryAddressLabel')}</label>
                            <button
                              type="button"
                              onClick={() => setIsMapModalOpen(true)}
                              className="text-xs font-bold text-[#D4A853] hover:text-[#1A120B] flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-[#FFFCF6] transition-colors"
                            >
                              <MapPin size={14} />
                              <span>{t('selectOnMap')}</span>
                            </button>
                          </div>
                          
                          <MapAutocomplete
                            value={formData.street}
                            onChange={(val) => setFormData({ ...formData, street: val })}
                            onPlaceSelected={(lat, lng, address) => {
                              const straightDist = getDistanceFromLatLonInKm(RESTAURANT_LOCATION.lat, RESTAURANT_LOCATION.lng, lat, lng);
                              const roadDist = straightDist * 1.3;
                              setFormData(prev => ({ ...prev, street: address, estimatedKm: roadDist, lat, lng }));
                            }}
                            placeholder={t('placeholderAddress')}
                            className="w-full bg-[#FFFCF6] border border-[#E8E2D9] rounded-2xl pl-12 pr-5 py-4 text-sm outline-none focus:border-[#D4A853] focus:ring-1 focus:ring-[#D4A853] transition-all"
                            required={true}
                          />
                        </div>

                        {/* Additional Address Info & Order Notes */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="sm:col-span-1">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#736A60] mb-2">{t('buildingDetails')}</label>
                            <input
                              type="text"
                              placeholder={t('placeholderBuilding')}
                              className="w-full bg-[#FFFCF6] border border-[#E8E2D9] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#D4A853] focus:ring-1 focus:ring-[#D4A853] transition-all"
                              value={formData.house}
                              onChange={(e) => setFormData({ ...formData, house: e.target.value })}
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#736A60] mb-2">{t('orderNotes')}</label>
                            <input
                              type="text"
                              placeholder={t('placeholderNotes')}
                              className="w-full bg-[#FFFCF6] border border-[#E8E2D9] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#D4A853] focus:ring-1 focus:ring-[#D4A853] transition-all"
                              value={formData.notes}
                              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            />
                          </div>
                        </div>

                        {/* Door Delivery Upsell (Only for Pedestrian) */}
                        {deliveryCalc.isPedestrian && (
                          <label className="flex items-start gap-4 p-4 rounded-2xl border border-[#E8E2D9] bg-[#FFFCF6] cursor-pointer hover:border-[#D4A853]/50 transition-all mt-2 group">
                            <div className="pt-1">
                              <input
                                type="checkbox"
                                checked={doorDelivery}
                                onChange={(e) => setDoorDelivery(e.target.checked)}
                                className="w-5 h-5 accent-[#D4A853] cursor-pointer"
                              />
                            </div>
                            <div>
                              <h4 className="font-bold text-[#1A120B] text-sm group-hover:text-[#D4A853] transition-colors">{t('doorDeliveryTitle')}</h4>
                              <p className="text-xs text-[#736A60] mt-1 leading-relaxed">{t('doorDeliveryDesc')}</p>
                            </div>
                          </label>
                        )}
                      </div>
                    )}
                    
                    <div className="mt-6 flex justify-end pt-4 border-t border-[#E8E2D9]">
                      <button type="button" onClick={() => handleNextStep(3)} className="bg-[#1A120B] text-white px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#D4A853] hover:text-[#1A120B] transition-colors">
                        {t('continueBtn')}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Step 3: Timpul Comenzii & Detalii */}
            <div className={`bg-white rounded-3xl border shadow-sm overflow-hidden transition-all duration-300 ${activeStep === 3 ? 'border-[#1A120B]' : 'border-[#E8E2D9]'}`}>
              <button 
                type="button" 
                onClick={() => { if (activeStep > 3 || activeStep < 3) setActiveStep(3) }}
                className="w-full flex items-center justify-between p-6 md:p-8 bg-white cursor-pointer hover:bg-[#FFFCF6] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeStep >= 3 ? 'bg-[#1A120B] text-white' : 'bg-[#E8E2D9] text-[#736A60]'}`}>
                    3
                  </div>
                  <div className="text-left">
                    <h3 className="font-serif text-xl font-bold text-[#1A120B]">{t('step3Title')}</h3>
                    {activeStep > 3 && (
                      <p className="text-xs text-[#736A60] font-medium mt-1 truncate">
                        {timing === 'asap' ? t('asapDesc') : `${t('scheduledDesc')} ${scheduledTime}`}
                      </p>
                    )}
                  </div>
                </div>
                {activeStep === 3 ? <ChevronDown className="w-6 h-6 text-[#1A120B]" /> : activeStep > 3 ? <CheckCircle2 className="w-6 h-6 text-[#D4A853]" /> : null}
              </button>

              <AnimatePresence>
                {activeStep === 3 && (
                  <motion.div 
                    initial="hidden" 
                    animate="visible" 
                    exit="hidden" 
                    variants={accordionVariants}
                    className="px-6 md:px-8 pb-8 space-y-6"
                  >
                    {!storeStatus.isOpen && (
                      <div className="p-4 rounded-2xl bg-[#D4A853]/10 border border-[#D4A853]/30 text-xs text-[#1A120B] flex flex-col gap-1.5 leading-relaxed">
                        <div className="font-bold flex items-center gap-2 text-[#8C6B1B]">
                          <Clock className="w-4 h-4 text-[#8C6B1B] shrink-0" />
                          <span>{t('storeClosedBanner')} {storeStatus.nextOpening?.label ? `(${storeStatus.nextOpening.label})` : ''}</span>
                        </div>
                        <p className="text-[#736A60]">
                          {t('preOrderOnlyNotice')}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button
                        type="button"
                        disabled={!storeStatus.isOpen}
                        onClick={() => {
                          if (storeStatus.isOpen) setTiming("asap");
                        }}
                        className={`p-4 rounded-2xl border text-sm font-bold uppercase tracking-wider transition-all text-center ${
                          !storeStatus.isOpen
                            ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-60"
                            : timing === "asap"
                            ? "bg-[#D4A853] border-[#D4A853] text-[#1A120B] shadow-md cursor-pointer"
                            : "bg-[#FFFCF6] border-[#E8E2D9] text-[#736A60] hover:border-[#D4A853]/50 cursor-pointer"
                        }`}
                      >
                        {t('btnAsap')}
                        {!storeStatus.isOpen && <span className="block text-[10px] font-normal lowercase tracking-normal mt-0.5">(indisponibil acum)</span>}
                      </button>
                      <button
                        type="button"
                        onClick={() => setTiming("scheduled")}
                        className={`p-4 rounded-2xl border text-sm font-bold uppercase tracking-wider transition-all cursor-pointer text-center ${
                          timing === "scheduled"
                            ? "bg-[#D4A853] border-[#D4A853] text-[#1A120B] shadow-md"
                            : "bg-[#FFFCF6] border-[#E8E2D9] text-[#736A60] hover:border-[#D4A853]/50"
                        }`}
                      >
                        {t('btnSchedule')}
                      </button>
                    </div>

                    {timing === "scheduled" && (
                      <div className="flex flex-col items-start gap-2">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#736A60]">
                          {t('desiredTime')} {storeStatus.nextOpening?.label ? `(${storeStatus.nextOpening.label})` : ''}
                        </label>
                        <input
                          type="time"
                          value={scheduledTime}
                          onChange={(e) => setScheduledTime(e.target.value)}
                          className="bg-[#FFFCF6] border border-[#E8E2D9] rounded-xl px-5 py-3 text-base font-bold outline-none focus:border-[#D4A853] focus:ring-1 focus:ring-[#D4A853] text-[#1A120B] min-w-[150px]"
                        />
                      </div>
                    )}


                    <div className="mt-6 flex justify-end">
                      <button type="button" onClick={() => handleNextStep(4)} className="bg-[#1A120B] text-white px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#D4A853] hover:text-[#1A120B] transition-colors">
                        {t('continueBtn')}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Step 4: Metoda de Plata */}
            <div className={`bg-white rounded-3xl border shadow-sm overflow-hidden transition-all duration-300 ${activeStep === 4 ? 'border-[#1A120B]' : 'border-[#E8E2D9]'}`}>
              <button 
                type="button" 
                onClick={() => setActiveStep(4)}
                className="w-full flex items-center justify-between p-6 md:p-8 bg-white cursor-pointer hover:bg-[#FFFCF6] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeStep >= 4 ? 'bg-[#1A120B] text-white' : 'bg-[#E8E2D9] text-[#736A60]'}`}>
                    4
                  </div>
                  <div className="text-left">
                    <h3 className="font-serif text-xl font-bold text-[#1A120B]">{t('step4Title')}</h3>
                  </div>
                </div>
                {activeStep === 4 ? <ChevronDown className="w-6 h-6 text-[#1A120B]" /> : null}
              </button>

              <AnimatePresence>
                {activeStep === 4 && (
                  <motion.div 
                    initial="hidden" 
                    animate="visible" 
                    exit="hidden" 
                    variants={accordionVariants}
                    className="px-6 md:px-8 pb-8 space-y-4"
                  >
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("cash")}
                      className={`w-full p-5 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                        paymentMethod === "cash"
                          ? "bg-[#FFFCF6] border-[#D4A853] shadow-[0_0_0_1px_#D4A853]"
                          : "bg-white border-[#E8E2D9] hover:border-[#D4A853]/50"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${paymentMethod === 'cash' ? 'bg-[#D4A853]/20' : 'bg-[#FAF7F2]'}`}>
                          <Banknote className={`w-6 h-6 ${paymentMethod === 'cash' ? 'text-[#D4A853]' : 'text-[#736A60]'}`} />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-[#1A120B]">{t('cashTitle', { type: deliveryType === 'delivery' ? t('cashDelivery') : t('cashPickup') })}</h4>
                          <p className="text-[11px] text-[#736A60] mt-0.5">{t('cashDesc')}</p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cash' ? 'border-[#D4A853]' : 'border-[#E8E2D9]'}`}>
                        {paymentMethod === 'cash' && <div className="w-2.5 h-2.5 bg-[#D4A853] rounded-full" />}
                      </div>
                    </button>


                    {/* Online Payment — maib Checkout (Card, Apple Pay, Google Pay, MIA) */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("online")}
                      className={`w-full p-5 rounded-2xl border text-left transition-all duration-300 flex flex-col gap-3 ${
                        paymentMethod === "online"
                          ? "bg-[#FFFCF6] border-[#D4A853] shadow-[0_0_0_1px_#D4A853]"
                          : "bg-white border-[#E8E2D9] hover:border-[#D4A853]/50"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${paymentMethod === 'online' ? 'bg-[#D4A853]/20' : 'bg-[#FAF7F2]'}`}>
                            <CreditCard className={`w-6 h-6 ${paymentMethod === 'online' ? 'text-[#D4A853]' : 'text-[#736A60]'}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm text-[#1A120B]">{t('onlineTitle')}</h4>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#008F79]/15 text-[#008F79]">
                                maib
                              </span>
                            </div>
                            <p className="text-[11px] text-[#736A60] mt-0.5">{t('onlineDesc')}</p>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === 'online' ? 'border-[#D4A853]' : 'border-[#E8E2D9]'}`}>
                          {paymentMethod === 'online' && <div className="w-2.5 h-2.5 bg-[#D4A853] rounded-full" />}
                        </div>
                      </div>

                      {/* Payment Badges & MIA Notice */}
                      <div className="pt-2 border-t border-[#E8E2D9]/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <PaymentBadges variant="checkout" />
                        <span className="text-[11px] font-bold text-[#008F79] bg-[#008F79]/10 px-2.5 py-1 rounded-md">
                          MIA: 0% comision
                        </span>
                      </div>
                    </button>

                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

          {/* Right Column: Sticky Summary Panel */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24 h-fit max-h-[calc(100dvh-6.5rem)] lg:overflow-y-auto no-scrollbar">
            <div className="bg-[#FFFCF6] p-5 sm:p-7 md:p-8 rounded-[28px] md:rounded-[32px] border border-[#E8E2D9] shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
              {/* Decorative background circle */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#D4A853]/5 rounded-full blur-2xl pointer-events-none" />
              
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1A120B] pb-5 sm:pb-6 flex items-center gap-2 relative z-10">
                {t('orderSummary')}
              </h3>

              {/* Items List */}
              <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 no-scrollbar relative z-10 mb-6 border-b border-[#E8E2D9] pb-6">
                {items.map((item) => (
                  <div key={item.cartItemId} className="flex justify-between items-start gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-[#1A120B] text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-md">
                        {item.quantity}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[#1A120B] leading-tight">{item.name}</h4>
                        {item.selectedToppings && item.selectedToppings.length > 0 && (
                          <p className="text-[11px] text-[#736A60] mt-1 leading-relaxed">
                            {item.selectedToppings.map((t) => translateTopping(t.name, locale)).join(" • ")}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="font-bold text-[#1A120B] text-sm shrink-0">{item.price * item.quantity} MDL</span>
                  </div>
                ))}
              </div>

              {/* Promo Code Input */}
              <div className="relative z-10 mb-6">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <Tag className="w-3.5 h-3.5 text-[#D4A853]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#736A60]">
                    {t('promoCode')}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={t('enterPromoCode')}
                      className="flex-1 bg-white border border-[#E8E2D9] rounded-xl px-4 py-3 text-xs outline-none uppercase font-bold text-[#1A120B] focus:border-[#D4A853]"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="bg-[#1A120B] hover:bg-[#D4A853] hover:text-[#1A120B] text-white px-5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer"
                    >
                      {t('applyBtn')}
                    </button>
                  </div>
                  {activePromo && (
                    <div className="flex items-center gap-1.5 text-xs text-[#D4A853] font-bold bg-[#D4A853]/10 px-3 py-2 rounded-lg">
                      <CheckCircle2 className="w-4 h-4" /> {t('couponActive', { discountDisplay: activePromo.display })}
                    </div>
                  )}
                  {couponError && <p className="text-[11px] text-red-500 font-medium ml-1">{couponError}</p>}
                </div>
              </div>

              {/* Price Calculation Breakdown */}
              <div className="relative z-10 space-y-3 text-sm pt-2">
                <div className="flex justify-between text-[#736A60] font-medium">
                  <span>{t('subtotal')}</span>
                  <span className="text-[#1A120B]">{totalPrice} MDL</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#D4A853] font-bold">
                    <span>{t('promoDiscount')}</span>
                    <span>-{discountAmount} MDL</span>
                  </div>
                )}

                <div className="flex justify-between text-[#736A60] font-medium items-end">
                  <div className="flex flex-col">
                    <span>
                      {t('delivery')}{' '}
                      {deliveryType === 'delivery'
                        ? !hasAddress
                          ? ''
                          : doorDelivery
                          ? t('door')
                          : t('entrance')
                        : t('pickupMethod')}
                    </span>
                    {deliveryType === 'delivery' && (
                      <span className="text-[10px] mt-0.5 text-[#736A60]">
                        {!hasAddress ? (
                          <span className="text-[#D4A853] font-medium">{t('calculatedAtStep2')}</span>
                        ) : (
                          `~${deliveryCalc.distanceKm} km (${deliveryCalc.isPedestrian ? t('pedestrianDelivery') : t('taxiDelivery')})`
                        )}
                      </span>
                    )}
                  </div>
                  <span className="text-[#1A120B]">
                    {deliveryType === 'delivery' && !hasAddress ? (
                      <span className="text-[#736A60] text-xs font-normal italic">{t('calculatedAtStep2')}</span>
                    ) : deliveryFee === 0 ? (
                      <span className="text-[#D4A853] font-bold">{t('free')}</span>
                    ) : (
                      `${deliveryFee} MDL`
                    )}
                  </span>
                </div>

                {!deliveryCalc.isDeliverable && (
                  <div className="bg-red-50/80 border border-red-200 text-red-700 p-3 rounded-xl text-xs mt-4 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{t('outOfRange')}</span>
                  </div>
                )}
              </div>

              {/* Grand Total & Final Button */}
              <div className="relative z-10 mt-8 pt-6 border-t border-[#E8E2D9]">
                <div className="flex justify-between items-end mb-6">
                  <span className="font-bold text-[#1A120B] uppercase tracking-wider text-xs">{t('totalToPay')}</span>
                  <span className="font-serif text-3xl md:text-4xl font-bold text-[#D4A853] leading-none">{grandTotal} MDL</span>
                </div>

                {/* Notice Timp Execuție & Livrare Taxi (Conform aplicației mobile: 1h - 1h 30min) */}
                <div className="mb-5 bg-[#FAF7F2] border border-[#E8E2D9] rounded-2xl p-4 space-y-2.5 text-xs text-[#736A60]">
                  <div className="flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-[#9E721D] shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      {t('orderTimeNoticePre')}
                      <strong className="text-[#1A120B] font-bold">{t('orderTimeNoticeBold')}</strong>
                    </p>
                  </div>
                  {deliveryType === 'delivery' && (
                    <div className="flex items-start gap-2.5 pt-2 border-t border-[#E8E2D9]/70">
                      <Car className="w-4 h-4 text-[#9E721D] shrink-0 mt-0.5" />
                      <p className="leading-relaxed">{t('taxiNotice')}</p>
                    </div>
                  )}
                </div>

                {/* Terms and Conditions Acceptance Checkbox (MAIB Requirement) */}
                <div className="mb-5">
                  <label className="flex items-start gap-3 cursor-pointer select-none group">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => {
                        setAcceptedTerms(e.target.checked);
                        if (e.target.checked) setTermsError(false);
                      }}
                      className="mt-1 w-4 h-4 rounded border-[#E8E2D9] text-[#D4A853] focus:ring-[#D4A853] cursor-pointer accent-[#D4A853]"
                    />
                    <span className="text-[12px] text-[#4A4238] leading-relaxed">
                      {t.rich('termsCheckbox', {
                        terms: (chunks) => (
                          <Link href="/legal#terms" target="_blank" className="font-bold text-[#1A120B] underline hover:text-[#D4A853] transition-colors">
                            {chunks}
                          </Link>
                        ),
                        privacy: (chunks) => (
                          <Link href="/legal#privacy" target="_blank" className="font-bold text-[#1A120B] underline hover:text-[#D4A853] transition-colors">
                            {chunks}
                          </Link>
                        ),
                      })}
                    </span>
                  </label>
                  {termsError && (
                    <p className="text-[11px] text-red-600 font-semibold mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {t('termsRequired')}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || isSendingOtp || !deliveryCalc.isDeliverable || activeStep < 4}
                  className={`w-full py-4.5 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all duration-300 shadow-xl min-h-[56px] flex items-center justify-center gap-2 cursor-pointer ${
                    isSubmitting || isSendingOtp || !deliveryCalc.isDeliverable || activeStep < 4
                      ? "bg-[#E8E2D9] text-[#736A60] shadow-none cursor-not-allowed opacity-80"
                      : "bg-[#1A120B] hover:bg-[#D4A853] text-white hover:text-[#1A120B] shadow-[#1A120B]/10 hover:shadow-[#D4A853]/20"
                  }`}
                >
                  {isSubmitting ? (
                    <span>{t('sendingOrder')}</span>
                  ) : isSendingOtp ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t('otpSending') || "Se trimite codul SMS..."}</span>
                    </>
                  ) : (
                    <>
                      {activeStep < 4 ? t('completeSteps') : t('placeOrderBtn')}
                    </>
                  )}
                </button>
                {smsDispatchError && (
                  <div className="mt-3.5 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col gap-2.5">
                    <div className="flex items-start gap-2.5 font-medium leading-relaxed">
                      <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                      <span>{smsDispatchError}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handlePlaceOrderWithCallConfirmation}
                      className="self-start text-xs font-bold text-[#1A120B] underline hover:text-[#D4A853] transition-colors cursor-pointer"
                    >
                      📞 Trimite comanda cu confirmare prin apel telefonic
                    </button>
                  </div>
                )}
                {activeStep < 4 && deliveryCalc.isDeliverable && (
                  <p className="text-center text-[10px] text-[#736A60] font-medium mt-3 uppercase tracking-wider">
                    {t('missingInfo')}
                  </p>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
      
      <MapPickerModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        initialLat={formData.lat}
        initialLng={formData.lng}
        initialAddress={formData.street || undefined}
        onSelectLocation={({ address, lat, lng }) => {
          const straightDist = getDistanceFromLatLonInKm(RESTAURANT_LOCATION.lat, RESTAURANT_LOCATION.lng, lat, lng);
          const roadDist = straightDist * 1.3;
          setFormData(prev => ({ ...prev, street: address, estimatedKm: roadDist, lat, lng }));
        }}
      />

      {/* OTP Verification Modal for Guest Cash Orders */}
      {isMounted && typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {isOtpModalOpen && (
            <div className="fixed inset-0 z-[100] overflow-y-auto">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => !isVerifyingOtp && setIsOtpModalOpen(false)}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]"
              />

              {/* Centering wrapper that never clips top on short laptop viewports */}
              <div className="flex min-h-full items-center justify-center p-3 sm:p-4 py-6 sm:py-8 text-center relative z-[101]">
                {/* Modal Dialog */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  className="relative w-full max-w-md bg-[#FCF9F4] rounded-[24px] sm:rounded-[28px] border border-[#E8E2D9] p-5 sm:p-7 shadow-2xl text-left"
                >
                  {/* Close Button */}
                  <button
                    type="button"
                    onClick={() => !isVerifyingOtp && setIsOtpModalOpen(false)}
                    aria-label="Închide verificarea SMS"
                    className="absolute top-3 right-3 sm:top-4 sm:right-4 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-[#E8E2D9] flex items-center justify-center text-[#736A60] hover:text-[#1A120B] hover:bg-[#F5F2EC] transition-colors cursor-pointer shadow-sm z-10"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* Icon & Title */}
                  <div className="flex flex-col items-center text-center mb-4 sm:mb-5">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#D4A853]/15 border border-[#D4A853]/30 flex items-center justify-center mb-2.5 sm:mb-3 text-[#D4A853]">
                      <Smartphone className="w-6 h-6 sm:w-7 sm:h-7" />
                    </div>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1A120B]">
                      {t('otpTitle')}
                    </h3>
                    <p className="text-xs text-[#736A60] mt-1.5 leading-relaxed max-w-xs">
                      {t('otpSubtitle')}{" "}
                      <span className="font-bold text-[#1A120B]">
                        {selectedCountry.dialCode} {formData.phone}
                      </span>
                    </p>
                    {isDevMockOtp && (
                      <div className="mt-2.5 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] text-center font-medium leading-relaxed">
                        🔧 <strong>Mod Testare Localhost:</strong> Restricțiile Google API Key blochează SMS pe localhost. Introduceți codul de test: <strong>123456</strong>.
                      </div>
                    )}
                  </div>

                  {/* Error Message */}
                  {otpError && (
                    <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200/80 text-red-600 text-xs text-center flex items-center justify-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{otpError}</span>
                    </div>
                  )}

                  {/* OTP Form */}
                  <form onSubmit={handleVerifyOtpAndPlaceOrder} className="space-y-3.5 sm:space-y-4">
                    <div>
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        autoFocus
                        maxLength={6}
                        placeholder={t('otpPlaceholder') || "000000"}
                        value={otpCode}
                        onChange={(e) => {
                          setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                          if (otpError) setOtpError("");
                        }}
                        className="w-full bg-white border-2 border-[#E8E2D9] focus:border-[#D4A853] focus:ring-2 focus:ring-[#D4A853]/20 rounded-xl sm:rounded-2xl py-3 sm:py-3.5 text-center text-xl sm:text-2xl font-mono font-bold tracking-[0.5em] text-[#1A120B] outline-none transition-all placeholder:tracking-widest placeholder:text-[#C5BCB1]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isVerifyingOtp || otpCode.length < 6}
                      className="w-full py-3.5 rounded-full bg-[#1A120B] text-white font-bold text-sm hover:bg-[#D4A853] hover:text-[#1A120B] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isVerifyingOtp ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{t('otpVerifying')}</span>
                        </>
                      ) : (
                        <span>{t('otpVerifyBtn')}</span>
                      )}
                    </button>

                    <div className="text-center pt-1 flex flex-col items-center gap-2">
                      <button
                        type="button"
                        disabled={resendCooldown > 0 || isSendingOtp}
                        onClick={triggerOtpSms}
                        className="text-xs text-[#736A60] hover:text-[#D4A853] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium cursor-pointer"
                      >
                        {isSendingOtp ? t('otpSending') : resendCooldown > 0 ? t('otpResendIn', { seconds: resendCooldown }) : t('otpResend')}
                      </button>

                      <button
                        type="button"
                        onClick={handlePlaceOrderWithCallConfirmation}
                        className="text-[11px] text-[#736A60] hover:text-[#1A120B] underline transition-colors cursor-pointer"
                      >
                        Nu primești SMS-ul? Confirmă comanda prin apel telefonic
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
      <div id="recaptcha-container-checkout"></div>
    </div>
  );
}

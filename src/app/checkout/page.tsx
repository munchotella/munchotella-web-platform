"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  MapPin,
  ShoppingBag,
  Truck,
  Store,
  Clock,
  CreditCard,
  Banknote,
  Tag,
  CheckCircle2,
  AlertCircle,
  User,
  FileText,
  ChevronDown
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import LiveStoreStatus from "@/components/LiveStoreStatus";
import MapAutocomplete from "@/components/ui/MapAutocomplete";
import MapPickerModal from "@/components/profile/MapPickerModal";
import { motion, AnimatePresence } from "framer-motion";

// GPS Coordonate Restaurant Munchotella — Nicolae Testemițeanu 21/1, Chișinău
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
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();

  const [activeStep, setActiveStep] = useState<number>(1);
  const [deliveryType, setDeliveryType] = useState<"delivery" | "pickup">("delivery");
  const [doorDelivery, setDoorDelivery] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "pos" | "online">("cash");
  const [timing, setTiming] = useState<"asap" | "scheduled">("asap");
  const [scheduledTime, setScheduledTime] = useState("18:00");

  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    street: "",
    house: "",
    apartment: "",
    intercom: "",
    notes: "",
    estimatedKm: 3.5, // Standard estimated distance in Chisinau (~3.5km rutieri)
    lat: 46.996452,
    lng: 28.834809,
  });

  const { user, token, updateUser } = useAuth();

  // Pre-fill user data if available
  React.useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || prev.name,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  const [isSubmitting, setIsSubmitting] = useState(false);


  // Exact Munchotella Backend Delivery Calculation Engine
  const deliveryCalc = useMemo(() => {
    if (deliveryType === "pickup") {
      return {
        fee: 0,
        isDeliverable: true,
        isPedestrian: false,
        distanceKm: 0,
        typeLabel: "Preluare Gratuită din Boutique",
      };
    }

    const roadDistance = formData.estimatedKm;

    if (roadDistance > 10.0) {
      return {
        fee: 0,
        isDeliverable: false,
        isPedestrian: false,
        distanceKm: roadDistance,
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
      typeLabel: "Livrare prin Taxi (Letz Taxi)",
    };
  }, [deliveryType, doorDelivery, formData.estimatedKm]);

  const deliveryFee = deliveryCalc.fee;
  const discountAmount = Math.round((totalPrice * discountPercent) / 100);
  const grandTotal = Math.max(0, totalPrice - discountAmount + deliveryFee);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    const code = couponCode.trim().toUpperCase();
    if (code === "MUNCH10" || code === "DUBAI10") {
      setDiscountPercent(10);
    } else if (code === "MUNCH20") {
      setDiscountPercent(20);
    } else {
      setCouponError("Cod promoțional invalid sau expirat.");
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || !deliveryCalc.isDeliverable) return;

    setIsSubmitting(true);

    try {
      const menuItems = items.filter(i => !String(i.cartItemId).startsWith('drink_'));
      const drinkItems = items.filter(i => String(i.cartItemId).startsWith('drink_'));

      // Pregătește adresa completă (adăugând detalii bloc/apartament/interfon)
      let fullAddress = formData.street;
      const extras = [];
      if (formData.house) extras.push(`Bloc ${formData.house}`);
      if (formData.apartment) extras.push(`Ap. ${formData.apartment}`);
      if (formData.intercom) extras.push(`Interfon ${formData.intercom}`);
      if (extras.length > 0) {
        fullAddress += ` (${extras.join(', ')})`;
      }

      const orderPayload = {
        customer: {
          name: formData.name,
          phone: formData.phone,
          address: fullAddress,
          notes: formData.notes,
          coordinates: { lat: formData.lat, lng: formData.lng }
        },
        items: menuItems.map(i => ({
          menuItemId: i.id || i.cartItemId,
          quantity: i.quantity,
          variantName: (i as any).selectedVariant,
          modifiers: i.selectedToppings?.map((t: any) => ({
            title: t.groupName || 'Topping',
            optionName: t.name
          })) || []
        })),
        drinks: drinkItems.map(i => ({
          name: i.name,
          quantity: i.quantity
        })),
        paymentMethod: paymentMethod === "online" ? "card" : paymentMethod,
        doorDelivery,
        needsCutlery: false,
        promoCode: discountPercent > 0 ? couponCode : undefined
      };

      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      
      const res = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify(orderPayload)
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Eroare la plasarea comenzii");
      }

      if (user) {
         try {
           const profileRes = await fetch(`${API_URL}/auth/me`, {
             headers: { "Authorization": `Bearer ${token}` }
           });
           const profileData = await profileRes.json();
           if (profileData.success) {
             updateUser(profileData.data);
           }
         } catch(e) { console.error(e); }
      }

      clearCart();
      router.push(`/order-tracking/${data.data._id}`);
      
    } catch (err: any) {
      console.error(err);
      alert(err.message || "A apărut o problemă la trimiterea comenzii. Vă rugăm să încercați din nou.");
    } finally {
      setIsSubmitting(false);
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
          <h2 className="font-serif text-3xl font-bold">Coșul tău este gol</h2>
          <p className="text-[#736A60] font-light text-sm">
            Nu ai adăugat încă niciun desert delicios în coș. Vizitează meniul nostru!
          </p>
          <Link
            href="/menu"
            className="inline-block w-full bg-[#1A120B] hover:bg-[#3D3028] text-white py-4 rounded-full font-bold text-xs uppercase tracking-widest transition-colors shadow-md"
          >
            Descoperă Meniul
          </Link>
        </div>
      </div>
    );
  }

  const accordionVariants = {
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
                Finalizează <span className="text-[#D4A853] italic font-normal">Comanda</span>
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
                    <h3 className="font-serif text-xl font-bold text-[#1A120B]">Cum îți livrăm bunătățile?</h3>
                    {activeStep !== 1 && (
                      <p className="text-xs text-[#736A60] font-medium mt-1">
                        {deliveryType === 'delivery' ? 'Prin curier la adresa ta' : 'Treci tu pe la noi (Boutique)'}
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
                            Curier
                          </span>
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-[#1A120B]">Livrare la Adresă</h4>
                          <p className="text-[11px] text-[#736A60] mt-0.5">Calculat după distanță (km)</p>
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
                            Gratuit (0 MDL)
                          </span>
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-[#1A120B]">Preluare din Boutique</h4>
                          <p className="text-[11px] text-[#736A60] mt-0.5">Nicolae Testemițeanu 21/1</p>
                        </div>
                      </button>
                    </div>
                    <div className="mt-6 flex justify-end">
                      <button type="button" onClick={() => handleNextStep(2)} className="bg-[#1A120B] text-white px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#D4A853] hover:text-[#1A120B] transition-colors">
                        Continuă
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
                    <h3 className="font-serif text-xl font-bold text-[#1A120B]">Unde te găsim?</h3>
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
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#736A60] mb-2">Numele tău complet *</label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Ana Popescu"
                          className="w-full bg-[#FFFCF6] border border-[#E8E2D9] rounded-2xl px-5 py-3.5 text-sm outline-none focus:border-[#D4A853] focus:ring-1 focus:ring-[#D4A853] transition-all"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#736A60] mb-2">Număr de contact *</label>
                        <input
                          type="tel"
                          required
                          placeholder="Ex: 079 123 456"
                          className="w-full bg-[#FFFCF6] border border-[#E8E2D9] rounded-2xl px-5 py-3.5 text-sm outline-none focus:border-[#D4A853] focus:ring-1 focus:ring-[#D4A853] transition-all"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                    </div>

                    {deliveryType === "delivery" && (
                      <div className="space-y-6 pt-4 border-t border-[#E8E2D9]">
                        {/* Saved Addresses (Optional) */}
                        {user && user.addresses && user.addresses.length > 0 && (
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#736A60] mb-3">Adrese Salvate</label>
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
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#736A60]">Adresa de livrare *</label>
                            <button
                              type="button"
                              onClick={() => setIsMapModalOpen(true)}
                              className="text-xs font-bold text-[#D4A853] hover:text-[#1A120B] flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-[#FFFCF6] transition-colors"
                            >
                              <MapPin size={14} />
                              <span>Selectează pe Hartă</span>
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
                            placeholder="Ex: Bulevardul Ștefan cel Mare și Sfînt 1"
                            className="w-full bg-[#FFFCF6] border border-[#E8E2D9] rounded-2xl pl-12 pr-5 py-4 text-sm outline-none focus:border-[#D4A853] focus:ring-1 focus:ring-[#D4A853] transition-all"
                            required={true}
                          />
                        </div>

                        {/* Additional Address Info (Grid) */}
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#736A60] mb-2">Detalii clădire</label>
                            <input
                              type="text"
                              placeholder="Bloc/Scară"
                              className="w-full bg-[#FFFCF6] border border-[#E8E2D9] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#D4A853]"
                              value={formData.house}
                              onChange={(e) => setFormData({ ...formData, house: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#736A60] mb-2">Apartament</label>
                            <input
                              type="text"
                              placeholder="Ex: 45"
                              className="w-full bg-[#FFFCF6] border border-[#E8E2D9] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#D4A853]"
                              value={formData.apartment}
                              onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#736A60] mb-2">Interfon</label>
                            <input
                              type="text"
                              placeholder="Ex: 45B"
                              className="w-full bg-[#FFFCF6] border border-[#E8E2D9] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#D4A853]"
                              value={formData.intercom}
                              onChange={(e) => setFormData({ ...formData, intercom: e.target.value })}
                            />
                          </div>
                        </div>

                        {/* Door Delivery Upsell */}
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
                            <span className="text-sm font-bold text-[#1A120B] group-hover:text-[#D4A853] transition-colors">Livrare Până La Ușă (+20 MDL)</span>
                            <p className="text-xs text-[#736A60] mt-1 leading-relaxed">Bifează dacă dorești ca șoferul/curierul să urce până la etaj și să livreze comanda direct la ușa apartamentului tău.</p>
                          </div>
                        </label>
                      </div>
                    )}
                    
                    <div className="mt-6 flex justify-end pt-4 border-t border-[#E8E2D9]">
                      <button type="button" onClick={() => handleNextStep(3)} className="bg-[#1A120B] text-white px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#D4A853] hover:text-[#1A120B] transition-colors">
                        Continuă
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
                    <h3 className="font-serif text-xl font-bold text-[#1A120B]">Când să o pregătim?</h3>
                    {activeStep > 3 && (
                      <p className="text-xs text-[#736A60] font-medium mt-1 truncate">
                        {timing === 'asap' ? 'Cât mai repede posibil' : `Voi fi acolo/aștept la ${scheduledTime}`}
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setTiming("asap")}
                        className={`p-4 rounded-2xl border text-sm font-bold uppercase tracking-wider transition-all cursor-pointer text-center ${
                          timing === "asap"
                            ? "bg-[#D4A853] border-[#D4A853] text-[#1A120B] shadow-md"
                            : "bg-[#FFFCF6] border-[#E8E2D9] text-[#736A60] hover:border-[#D4A853]/50"
                        }`}
                      >
                        Cât Mai Repede
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
                        Programează
                      </button>
                    </div>

                    {timing === "scheduled" && (
                      <div className="flex flex-col items-start gap-2">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#736A60]">Ora dorită (Astăzi)</label>
                        <input
                          type="time"
                          value={scheduledTime}
                          onChange={(e) => setScheduledTime(e.target.value)}
                          className="bg-[#FFFCF6] border border-[#E8E2D9] rounded-xl px-5 py-3 text-base font-bold outline-none focus:border-[#D4A853] focus:ring-1 focus:ring-[#D4A853] text-[#1A120B] min-w-[150px]"
                        />
                      </div>
                    )}

                    <div className="pt-6 border-t border-[#E8E2D9]">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#736A60] mb-3 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-[#D4A853]" />
                        Ai o preferință anume?
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Ex: Fără alergeni, doresc un mesaj scris de mână, interfonul nu funcționează..."
                        className="w-full bg-[#FFFCF6] border border-[#E8E2D9] rounded-2xl p-4 text-sm outline-none focus:border-[#D4A853] focus:ring-1 focus:ring-[#D4A853] transition-all resize-none"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      />
                    </div>
                    
                    <div className="mt-6 flex justify-end">
                      <button type="button" onClick={() => handleNextStep(4)} className="bg-[#1A120B] text-white px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#D4A853] hover:text-[#1A120B] transition-colors">
                        Continuă
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
                    <h3 className="font-serif text-xl font-bold text-[#1A120B]">Cum preferi să plătești?</h3>
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
                          <h4 className="font-bold text-sm text-[#1A120B]">Numerar la {deliveryType === 'delivery' ? 'Livrare' : 'Preluare'}</h4>
                          <p className="text-[11px] text-[#736A60] mt-0.5">Plătești cash curierului/barista</p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cash' ? 'border-[#D4A853]' : 'border-[#E8E2D9]'}`}>
                        {paymentMethod === 'cash' && <div className="w-2.5 h-2.5 bg-[#D4A853] rounded-full" />}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("pos")}
                      className={`w-full p-5 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                        paymentMethod === "pos"
                          ? "bg-[#FFFCF6] border-[#D4A853] shadow-[0_0_0_1px_#D4A853]"
                          : "bg-white border-[#E8E2D9] hover:border-[#D4A853]/50"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${paymentMethod === 'pos' ? 'bg-[#D4A853]/20' : 'bg-[#FAF7F2]'}`}>
                          <CreditCard className={`w-6 h-6 ${paymentMethod === 'pos' ? 'text-[#D4A853]' : 'text-[#736A60]'}`} />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-[#1A120B]">Card via POS</h4>
                          <p className="text-[11px] text-[#736A60] mt-0.5">Plata cu cardul la terminalul POS mobil</p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'pos' ? 'border-[#D4A853]' : 'border-[#E8E2D9]'}`}>
                        {paymentMethod === 'pos' && <div className="w-2.5 h-2.5 bg-[#D4A853] rounded-full" />}
                      </div>
                    </button>
                    
                    {/* Placeholder for future Online Payment Stripe */}
                    <button
                      type="button"
                      disabled
                      className="w-full p-5 rounded-2xl border text-left bg-[#FAF7F2] border-[#E8E2D9] opacity-60 cursor-not-allowed flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#E8E2D9]/50 flex items-center justify-center">
                          <CreditCard className="w-6 h-6 text-[#736A60]" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-[#1A120B]">Plată Online (În Curând)</h4>
                          <p className="text-[11px] text-[#736A60] mt-0.5">Stripe / Apple Pay / Google Pay</p>
                        </div>
                      </div>
                    </button>

                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

          {/* Right Column: Sticky Summary Panel */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-32 h-fit">
            <div className="bg-[#FFFCF6] p-7 md:p-9 rounded-[32px] border border-[#E8E2D9] shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
              {/* Decorative background circle */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#D4A853]/5 rounded-full blur-2xl pointer-events-none" />
              
              <h3 className="font-serif text-2xl font-bold text-[#1A120B] pb-6 flex items-center gap-2 relative z-10">
                Sumar Comandă
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
                            {item.selectedToppings.map((t) => t.name).join(" • ")}
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
                    Cod Promoțional
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Introdu codul (ex: MUNCH10)"
                      className="flex-1 bg-white border border-[#E8E2D9] rounded-xl px-4 py-3 text-xs outline-none uppercase font-bold text-[#1A120B] focus:border-[#D4A853]"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="bg-[#1A120B] hover:bg-[#D4A853] hover:text-[#1A120B] text-white px-5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer"
                    >
                      Aplică
                    </button>
                  </div>
                  {discountPercent > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-[#D4A853] font-bold bg-[#D4A853]/10 px-3 py-2 rounded-lg">
                      <CheckCircle2 className="w-4 h-4" /> Cupon activat: {discountPercent}% Reducere
                    </div>
                  )}
                  {couponError && <p className="text-[11px] text-red-500 font-medium ml-1">{couponError}</p>}
                </div>
              </div>

              {/* Price Calculation Breakdown */}
              <div className="relative z-10 space-y-3 text-sm pt-2">
                <div className="flex justify-between text-[#736A60] font-medium">
                  <span>Subtotal produse</span>
                  <span className="text-[#1A120B]">{totalPrice} MDL</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#D4A853] font-bold">
                    <span>Reducere Promo</span>
                    <span>-{discountAmount} MDL</span>
                  </div>
                )}

                <div className="flex justify-between text-[#736A60] font-medium items-end">
                  <div className="flex flex-col">
                    <span>Livrare {deliveryType === 'delivery' ? (doorDelivery ? '(Ușă)' : '(Scară)') : '(Preluare)'}</span>
                    {deliveryType === 'delivery' && deliveryCalc.distanceKm > 0 && (
                      <span className="text-[10px] mt-0.5">~{deliveryCalc.distanceKm} km (Taxi/Pietonal)</span>
                    )}
                  </div>
                  <span className="text-[#1A120B]">
                    {deliveryFee === 0 ? (
                      <span className="text-[#D4A853] font-bold">Gratuit</span>
                    ) : (
                      `${deliveryFee} MDL`
                    )}
                  </span>
                </div>

                {!deliveryCalc.isDeliverable && (
                  <div className="bg-red-50/80 border border-red-200 text-red-700 p-3 rounded-xl text-xs mt-4 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>Ne pare rău, dar adresa introdusă depășește raza maximă de livrare (10 km).</span>
                  </div>
                )}
              </div>

              {/* Grand Total & Final Button */}
              <div className="relative z-10 mt-8 pt-6 border-t border-[#E8E2D9]">
                <div className="flex justify-between items-end mb-6">
                  <span className="font-bold text-[#1A120B] uppercase tracking-wider text-xs">Total de Plată</span>
                  <span className="font-serif text-3xl md:text-4xl font-bold text-[#D4A853] leading-none">{grandTotal} MDL</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !deliveryCalc.isDeliverable || activeStep < 4}
                  className={`w-full py-4.5 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all duration-300 shadow-xl min-h-[56px] flex items-center justify-center gap-2 cursor-pointer ${
                    isSubmitting || !deliveryCalc.isDeliverable || activeStep < 4
                      ? "bg-[#E8E2D9] text-[#736A60] shadow-none cursor-not-allowed opacity-80"
                      : "bg-[#1A120B] hover:bg-[#D4A853] text-white hover:text-[#1A120B] shadow-[#1A120B]/10 hover:shadow-[#D4A853]/20"
                  }`}
                >
                  {isSubmitting ? (
                    <span>Se trimite comanda...</span>
                  ) : (
                    <>
                      {activeStep < 4 ? "Completează Pașii Pentru Plată" : "Plasează Comanda"}
                    </>
                  )}
                </button>
                {activeStep < 4 && deliveryCalc.isDeliverable && (
                  <p className="text-center text-[10px] text-[#736A60] font-medium mt-3 uppercase tracking-wider">
                    Mai ai de completat informații în pașii anteriori
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
    </div>
  );
}

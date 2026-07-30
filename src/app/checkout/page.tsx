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
  Sparkles,
  Tag,
  CheckCircle2,
  AlertCircle,
  Phone,
  User,
  FileText,
  Footprints,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import LiveStoreStatus from "@/components/LiveStoreStatus";
import MapAutocomplete from "@/components/ui/MapAutocomplete";

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

  const [deliveryType, setDeliveryType] = useState<"delivery" | "pickup">("delivery");
  const [doorDelivery, setDoorDelivery] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "pos" | "online">("cash");
  const [timing, setTiming] = useState<"asap" | "scheduled">("asap");
  const [scheduledTime, setScheduledTime] = useState("18:00");

  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponError, setCouponError] = useState("");

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


  // Exact Munchotella Backend Delivery Calculation Engine (geoUtils.js)
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
        paymentMethod: paymentMethod === "online" ? "card" : paymentMethod, // Backend asteapta 'cash' sau 'card'
        doorDelivery,
        needsCutlery: false, // Default false pentru moment
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

      // Update user profile if they were logged in (backend auto-saves phone if missing)
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

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] text-[#1A120B] font-sans flex items-center justify-center pt-28 pb-20 px-6">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-[#E8E2D9] shadow-lg text-center space-y-6">
          <div className="w-16 h-16 bg-[#D4A853]/10 text-[#D4A853] rounded-full flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-3xl font-bold">Coșul tău este gol</h2>
          <p className="text-[#736A60] font-light text-sm">
            Nu ai adăugat încă niciun desert delicios în coș. Vizitează meniul nostru!
          </p>
          <Link
            href="/menu"
            className="inline-block w-full bg-[#D4A853] hover:bg-[#C09640] text-[#1A120B] py-3.5 rounded-full font-bold text-xs uppercase tracking-widest transition-colors shadow-md"
          >
            Vezi Meniul
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1A120B] font-sans selection:bg-[#D4A853] selection:text-white pt-28 pb-32">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        {/* Header navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 border-b border-[#E8E2D9] pb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/menu"
              className="w-10 h-10 rounded-full border border-[#E8E2D9] bg-white flex items-center justify-center text-[#1A120B] hover:border-[#D4A853] hover:text-[#D4A853] transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight">
                Finalizare <span className="text-[#D4A853] italic font-normal">Comandă</span>
              </h1>
              <p className="text-sm text-[#736A60] mt-2 font-medium">Aproape gata! Completează detaliile de mai jos și noi punem imediat aparatele în priză.</p>
            </div>
          </div>

          <LiveStoreStatus isDarkBackground={false} />
        </div>

        {/* Form Layout */}
        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Form Details */}
          <div className="lg:col-span-7 space-y-8">
            {/* 1. Delivery Type Toggle */}
            <div className="bg-white p-6 rounded-3xl border border-[#E8E2D9] shadow-sm space-y-4">
              <h3 className="font-serif text-xl font-bold text-[#1A120B] flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#D4A853]" />
                1. Mod de Livrare
              </h3>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setDeliveryType("delivery")}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between h-28 ${
                    deliveryType === "delivery"
                      ? "bg-[#D4A853]/10 border-[#D4A853] ring-1 ring-[#D4A853]"
                      : "bg-[#FFFCF6] border-[#E8E2D9] hover:border-[#D4A853]/50"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <Truck className={`w-6 h-6 ${deliveryType === "delivery" ? "text-[#D4A853]" : "text-[#736A60]"}`} />
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-[#1A120B] text-white px-2 py-0.5 rounded-full">
                      Taxi / Pietonal
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#1A120B]">Livrare la Adresă</h4>
                    <p className="text-[11px] text-[#736A60]">Calculat după distanță (km)</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryType("pickup")}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between h-28 ${
                    deliveryType === "pickup"
                      ? "bg-[#D4A853]/10 border-[#D4A853] ring-1 ring-[#D4A853]"
                      : "bg-[#FFFCF6] border-[#E8E2D9] hover:border-[#D4A853]/50"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <Store className={`w-6 h-6 ${deliveryType === "pickup" ? "text-[#D4A853]" : "text-[#736A60]"}`} />
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-[#D4A853] text-[#FCF9F4] px-2 py-0.5 rounded-full">
                      Gratuit (0 MDL)
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#1A120B]">Preluare din Boutique</h4>
                    <p className="text-[11px] text-[#736A60]">Nicolae Testemițeanu 21/1</p>
                  </div>
                </button>
              </div>
            </div>

            {/* 2. Customer Contact & Address */}
            <div className="bg-white p-6 rounded-3xl border border-[#E8E2D9] shadow-sm space-y-5">
              <h3 className="font-serif text-xl font-bold text-[#1A120B] flex items-center gap-2">
                <User className="w-5 h-5 text-[#D4A853]" />
                2. Date de Contact & Adresă
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#736A60] mb-2">
                    Nume & Prenume *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ion Popescu"
                    className="w-full bg-[#FFFCF6] border border-[#E8E2D9] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#D4A853] transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#736A60] mb-2">
                    Număr Telefon *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="ex: 079 xxx xxx"
                    className="w-full bg-[#FFFCF6] border border-[#E8E2D9] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#D4A853] transition-all"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              {deliveryType === "delivery" && (
                <div className="space-y-4 pt-2">
                  {/* Selectare Adrese Salvate */}
                  {user && user.addresses && user.addresses.length > 0 && (
                    <div className="mb-4">
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#736A60] mb-2 flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-[#D4A853]" /> 
                        Adrese Salvate
                      </label>
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
                                  ...prev,
                                  street: addr.street,
                                  lat: addr.lat,
                                  lng: addr.lng,
                                  estimatedKm: dist * 1.3
                                }));
                              }}
                              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all shrink-0 ${
                                isSelected 
                                  ? 'bg-[#D4A853] border-[#D4A853] text-[#1A120B] font-bold shadow-md' 
                                  : 'bg-[#FFFCF6] border-[#E8E2D9] text-[#736A60] hover:border-[#D4A853]/50'
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

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#736A60] mb-2">
                      Stradă & Număr *
                    </label>
                    <div className="relative">
                      <MapAutocomplete
                        value={formData.street}
                        onChange={(val) => setFormData({ ...formData, street: val })}
                        onPlaceSelected={(lat, lng, address) => {
                          const straightDist = getDistanceFromLatLonInKm(RESTAURANT_LOCATION.lat, RESTAURANT_LOCATION.lng, lat, lng);
                          const roadDist = straightDist * 1.3;
                          setFormData(prev => ({ ...prev, street: address, estimatedKm: roadDist, lat, lng }));
                        }}
                        placeholder="Caută adresa (ex: Stefan cel Mare 130)..."
                        className="w-full bg-[#FFFCF6] border border-[#E8E2D9] rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-[#D4A853] transition-all"
                        required={true}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#736A60] mb-1">
                        Bloc / Scară
                      </label>
                      <input
                        type="text"
                        placeholder="Bloc 2"
                        className="w-full bg-[#FFFCF6] border border-[#E8E2D9] rounded-xl px-3 py-2.5 text-xs outline-none focus:border-[#D4A853]"
                        value={formData.house}
                        onChange={(e) => setFormData({ ...formData, house: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#736A60] mb-1">
                        Apartament
                      </label>
                      <input
                        type="text"
                        placeholder="Ap. 45"
                        className="w-full bg-[#FFFCF6] border border-[#E8E2D9] rounded-xl px-3 py-2.5 text-xs outline-none focus:border-[#D4A853]"
                        value={formData.apartment}
                        onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#736A60] mb-1">
                        Interfon
                      </label>
                      <input
                        type="text"
                        placeholder="45B"
                        className="w-full bg-[#FFFCF6] border border-[#E8E2D9] rounded-xl px-3 py-2.5 text-xs outline-none focus:border-[#D4A853]"
                        value={formData.intercom}
                        onChange={(e) => setFormData({ ...formData, intercom: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Door delivery checkbox */}
                  <label className="flex items-center gap-3 p-3.5 rounded-xl border border-[#E8E2D9] bg-[#FFFCF6] cursor-pointer hover:border-[#D4A853]/60 transition-colors">
                    <input
                      type="checkbox"
                      checked={doorDelivery}
                      onChange={(e) => setDoorDelivery(e.target.checked)}
                      className="w-4 h-4 accent-[#D4A853]"
                    />
                    <div>
                      <span className="text-xs font-bold text-[#1A120B]">Livrare până la Ușă (+20 MDL la Pietonal)</span>
                      <p className="text-[11px] text-[#736A60]">Bifați dacă doriți urcarea la etaj de către curier</p>
                    </div>
                  </label>
                </div>
              )}
            </div>

            {/* 3. Delivery Timing & Payment Method */}
            <div className="bg-white p-6 rounded-3xl border border-[#E8E2D9] shadow-sm space-y-6">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#1A120B] flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-[#D4A853]" />
                  3. Orar Livrare
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTiming("asap")}
                    className={`p-3.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      timing === "asap"
                        ? "bg-[#D4A853]/10 border-[#D4A853] text-[#1A120B]"
                        : "bg-[#FFFCF6] border-[#E8E2D9] text-[#736A60]"
                    }`}
                  >
                    Livrare Imediată (30 - 60 min)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTiming("scheduled")}
                    className={`p-3.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      timing === "scheduled"
                        ? "bg-[#D4A853]/10 border-[#D4A853] text-[#1A120B]"
                        : "bg-[#FFFCF6] border-[#E8E2D9] text-[#736A60]"
                    }`}
                  >
                    Programată Mai Târziu
                  </button>
                </div>

                {timing === "scheduled" && (
                  <div className="mt-3">
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="bg-[#FFFCF6] border border-[#E8E2D9] rounded-xl px-4 py-2 text-sm outline-none focus:border-[#D4A853]"
                    />
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-[#E8E2D9]">
                <h3 className="font-serif text-xl font-bold text-[#1A120B] flex items-center gap-2 mb-4">
                  <CreditCard className="w-5 h-5 text-[#D4A853]" />
                  4. Metodă de Plată
                </h3>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cash")}
                    className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                      paymentMethod === "cash"
                        ? "bg-[#D4A853]/10 border-[#D4A853] ring-1 ring-[#D4A853]"
                        : "bg-[#FFFCF6] border-[#E8E2D9]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Banknote className="w-6 h-6 text-[#D4A853]" />
                      <div>
                        <h4 className="font-bold text-sm text-[#1A120B]">Numerar la Livrare</h4>
                        <p className="text-[11px] text-[#736A60]">Plătești cash curierului la primirea comenzii</p>
                      </div>
                    </div>
                    {paymentMethod === "cash" && <CheckCircle2 className="w-5 h-5 text-[#D4A853]" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("pos")}
                    className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                      paymentMethod === "pos"
                        ? "bg-[#D4A853]/10 border-[#D4A853] ring-1 ring-[#D4A853]"
                        : "bg-[#FFFCF6] border-[#E8E2D9]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-6 h-6 text-[#D4A853]" />
                      <div>
                        <h4 className="font-bold text-sm text-[#1A120B]">Card la Livrare (POS Mobil)</h4>
                        <p className="text-[11px] text-[#736A60]">Curierul vine cu terminalul POS bancar</p>
                      </div>
                    </div>
                    {paymentMethod === "pos" && <CheckCircle2 className="w-5 h-5 text-[#D4A853]" />}
                  </button>
                </div>
              </div>

              {/* Note field */}
              <div className="pt-4 border-t border-[#E8E2D9]">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#736A60] mb-2 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#D4A853]" />
                  Note speciale pentru bucătar & curier
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Fără arahide, sună când ajungi..."
                  className="w-full bg-[#FFFCF6] border border-[#E8E2D9] rounded-xl p-3 text-xs outline-none focus:border-[#D4A853]"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Summary & Place Order */}
          <div className="lg:col-span-5 space-y-6 sticky top-28">
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#E8E2D9] shadow-lg space-y-6">
              <h3 className="font-serif text-2xl font-bold text-[#1A120B] border-b border-[#E8E2D9] pb-4">
                Sumar Comandă
              </h3>

              {/* Items List */}
              <div className="space-y-4 max-h-60 overflow-y-auto pr-1 no-scrollbar">
                {items.map((item) => (
                  <div key={item.cartItemId} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#D4A853]/20 text-[#1A120B] font-bold text-xs flex items-center justify-center">
                        {item.quantity}x
                      </span>
                      <div>
                        <h4 className="font-medium text-[#1A120B]">{item.name}</h4>
                        {item.selectedToppings && item.selectedToppings.length > 0 && (
                          <p className="text-[10px] text-[#736A60]">
                            + {item.selectedToppings.map((t) => t.name).join(", ")}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="font-bold text-[#1A120B]">{item.price * item.quantity} MDL</span>
                  </div>
                ))}
              </div>

              {/* Promo Code Form */}
              <div className="pt-4 border-t border-[#E8E2D9]">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="w-4 h-4 text-[#D4A853]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1A120B]">
                    Cod Promoțional (Promo Code)
                  </span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="ex: MUNCH10"
                    className="flex-1 bg-[#FFFCF6] border border-[#E8E2D9] rounded-xl px-3 py-2 text-xs outline-none uppercase font-bold text-[#1A120B]"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="bg-[#1A120B] hover:bg-[#3D3028] text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Aplică
                  </button>
                </div>
                {discountPercent > 0 && (
                  <p className="text-xs text-[#D4A853] font-bold mt-2">
                    ✓ Cupon activat: {discountPercent}% Reducere!
                  </p>
                )}
                {couponError && <p className="text-xs text-red-500 mt-2">{couponError}</p>}
              </div>

              {/* Price & Delivery Calculation Breakdown */}
              <div className="pt-4 border-t border-[#E8E2D9] space-y-2 text-sm">
                <div className="flex justify-between text-[#736A60]">
                  <span>Subtotal produse</span>
                  <span className="font-medium text-[#1A120B]">{totalPrice} MDL</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#D4A853] font-medium">
                    <span>Reducere ({discountPercent}%)</span>
                    <span>-{discountAmount} MDL</span>
                  </div>
                )}

                <div className="flex justify-between text-[#736A60] items-center">
                  <div>
                    <span>Taxă Livrare ({deliveryCalc.typeLabel})</span>
                    {deliveryCalc.distanceKm > 0 && (
                      <p className="text-[10px] text-[#736A60]">~{deliveryCalc.distanceKm} km rutieri</p>
                    )}
                  </div>
                  <span className="font-medium text-[#1A120B]">
                    {deliveryFee === 0 ? (
                      <span className="text-[#D4A853] font-bold">0 MDL (Gratuit)</span>
                    ) : (
                      `${deliveryFee} MDL`
                    )}
                  </span>
                </div>

                {!deliveryCalc.isDeliverable && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs mt-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Adresa introdusă depășește raza maximă de livrare (10 km).</span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-3 border-t border-[#E8E2D9] text-base">
                  <span className="font-bold text-[#1A120B]">TOTAL DE PLATĂ</span>
                  <span className="font-serif text-3xl font-bold text-[#D4A853]">{grandTotal} MDL</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !deliveryCalc.isDeliverable}
                className={`w-full py-4 rounded-full font-bold text-xs uppercase tracking-widest transition-all duration-300 shadow-xl min-h-[52px] flex items-center justify-center gap-2 cursor-pointer ${
                  isSubmitting || !deliveryCalc.isDeliverable
                    ? "bg-gray-300 text-gray-600 shadow-none cursor-not-allowed"
                    : "bg-[#D4A853] hover:bg-[#C09640] text-[#1A120B] shadow-[#D4A853]/20"
                }`}
              >
                {isSubmitting ? (
                  <span>Se trimite comanda...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>PLASEAZĂ COMANDA ({grandTotal} MDL)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

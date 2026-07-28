"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Utensils,
  Truck,
  Check,
  ShoppingBag,
  Home,
  RefreshCw,
} from "lucide-react";

type OrderDetails = {
  orderId: string;
  createdAt: string;
  customer: {
    name: string;
    phone: string;
    street: string;
    house?: string;
    apartment?: string;
    intercom?: string;
    notes?: string;
  };
  deliveryType: "delivery" | "pickup";
  paymentMethod: string;
  timing: string;
  items: any[];
  totalPrice: number;
  deliveryFee: number;
  discountAmount: number;
  grandTotal: number;
};

const STEPS = [
  { id: 1, title: "Comandă Înregistrată", desc: "Preluată de sistemul Munchotella", icon: Clock },
  { id: 2, title: "Se Prepară în Bucătărie", desc: "Bucătarii noștri prepară desertul proaspăt", icon: Utensils },
  { id: 3, title: "În Curs de Livrare", desc: "Curierul se îndreaptă spre adresa ta", icon: Truck },
  { id: 4, title: "Comandă Finalizată", desc: "Poftă bună!", icon: CheckCircle2 },
];

export default function OrderTrackingPage() {
  const params = useParams();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [minutesLeft, setMinutesLeft] = useState(35);

  useEffect(() => {
    if (!orderId) return;

    const saved = localStorage.getItem(`munchotella_order_${orderId}`);
    if (saved) {
      try {
        setOrder(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse order", e);
      }
    } else {
      // Demo order fallback
      setOrder({
        orderId: orderId || "MNC-849201",
        createdAt: new Date().toISOString(),
        customer: {
          name: "Client Munchotella",
          phone: "+373 79 000 000",
          street: "Nicolae Testemițeanu 21/1",
        },
        deliveryType: "delivery",
        paymentMethod: "cash",
        timing: "Livrare Imediată (30-60 min)",
        items: [],
        totalPrice: 165,
        deliveryFee: 30,
        discountAmount: 0,
        grandTotal: 195,
      });
    }
  }, [orderId]);

  // Simulate progress steps over time
  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStep(2), 5000);
    const timer2 = setTimeout(() => {
      setCurrentStep(3);
      setMinutesLeft(15);
    }, 25000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  if (!order) return null;

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1A120B] font-sans pt-28 pb-32">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="bg-white p-8 rounded-3xl border border-[#E8E2D9] shadow-lg mb-8 text-center relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#D4A853]/10 rounded-full blur-2xl" />

          <span className="inline-block bg-[#D4A853]/20 text-[#1A120B] font-bold text-xs uppercase tracking-widest px-4 py-1.5 rounded-full mb-3">
            Comanda #{order.orderId}
          </span>
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-[#1A120B] mb-2">
            Status <span className="text-[#D4A853] italic font-normal">Comandă</span>
          </h1>
          <p className="text-sm text-[#736A60] font-light">
            Timp estimat de sosire: <strong className="text-[#1A120B]">{minutesLeft} minute</strong>
          </p>

          <div className="mt-8 flex justify-center gap-4">
            <a
              href="tel:+37379006499"
              className="inline-flex items-center gap-2 bg-[#1A120B] text-[#D4A853] px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#3D3028] transition-colors"
            >
              <Phone className="w-4 h-4" />
              Sunați Restaurantul
            </a>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-[#FAF7F2] border border-[#E8E2D9] text-[#1A120B] px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider hover:border-[#D4A853] transition-colors"
            >
              <Home className="w-4 h-4" />
              Acasă
            </Link>
          </div>
        </div>

        {/* Status Stepper */}
        <div className="bg-white p-8 rounded-3xl border border-[#E8E2D9] shadow-sm mb-8 space-y-8">
          <h3 className="font-serif text-xl font-bold text-[#1A120B] border-b border-[#E8E2D9] pb-4">
            Progres Livrare în Timp Real
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {STEPS.map((step) => {
              const Icon = step.icon;
              const isCompleted = step.id < currentStep;
              const isCurrent = step.id === currentStep;

              return (
                <div key={step.id} className="flex flex-col items-center text-center space-y-3 relative z-10">
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 shadow-md ${
                      isCompleted
                        ? "bg-[#D4A853] text-[#FCF9F4]"
                        : isCurrent
                        ? "bg-[#D4A853] text-[#1A120B] ring-4 ring-[#D4A853]/20 scale-110"
                        : "bg-[#F5F2EC] text-[#736A60] border border-[#E8E2D9]"
                    }`}
                  >
                    {isCompleted ? <Check className="w-7 h-7" /> : <Icon className="w-6 h-6" />}
                  </div>
                  <div>
                    <h4 className={`font-bold text-sm ${isCurrent ? "text-[#1A120B]" : "text-[#736A60]"}`}>
                      {step.title}
                    </h4>
                    <p className="text-[11px] text-[#736A60] mt-1 font-light">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Details Summary */}
        <div className="bg-white p-8 rounded-3xl border border-[#E8E2D9] shadow-sm space-y-6">
          <h3 className="font-serif text-xl font-bold text-[#1A120B] border-b border-[#E8E2D9] pb-4">
            Detalii Comandă
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#736A60] block">
                Client & Adresă
              </span>
              <p className="font-bold text-[#1A120B]">{order.customer.name}</p>
              <p className="text-[#736A60]">{order.customer.phone}</p>
              <p className="text-[#736A60]">
                {order.deliveryType === "pickup"
                  ? "Preluare din Boutique (Nicolae Testemițeanu 21/1)"
                  : `${order.customer.street} ${order.customer.house || ""} ${order.customer.apartment || ""}`}
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#736A60] block">
                Metodă Plată & Orar
              </span>
              <p className="font-bold text-[#1A120B] capitalize">
                {order.paymentMethod === "cash" ? "Numerar la livrare" : "Card la livrare (POS)"}
              </p>
              <p className="text-[#736A60]">{order.timing}</p>
              <p className="text-lg font-serif font-bold text-[#D4A853] pt-2">
                Total: {order.grandTotal} MDL
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

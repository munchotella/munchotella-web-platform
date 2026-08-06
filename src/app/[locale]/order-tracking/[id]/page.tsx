"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, CheckCircle2, Clock, ChefHat, Truck, MapPin, PackageOpen } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useTranslations } from 'next-intl';
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

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

  const orderId = typeof params?.id === 'string' ? params.id : '...';

  useEffect(() => {
    if (!orderId || orderId === '...') return;

    const docRef = doc(db, "orders", orderId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setOrderData(data);
        const status = data.status || "pending";
        const stepIndex = STEPS.findIndex(s => s.id === status);
        setCurrentStepIndex(stepIndex !== -1 ? stepIndex : 0);
        setError(null);
        setLoading(false);
      } else {
        setError("Comanda nu a fost găsită.");
        setLoading(false);
      }
    }, (err) => {
      console.error("Eroare la ascultarea comenzii:", err);
      setError("Eroare la încărcarea comenzii.");
      setLoading(false);
    });

    return () => unsubscribe();
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
          <button onClick={() => router.push('/menu')} className="bg-[#1A120B] text-white px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#D4A853] hover:text-[#1A120B] transition-colors">
            Mergi la Meniu
          </button>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFFCF6] flex flex-col">
      <Navbar />
      
      <div className="flex-1 pt-32 pb-24 max-w-[800px] mx-auto px-6 w-full">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#1A120B]/60 hover:text-[#D4A853] transition-colors mb-10"
        >
          <ChevronLeft size={20} />
          <span className="font-medium">{t('back')}</span>
        </button>

        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-serif text-[#1A120B] mb-2">{t('orderTracking')}</h1>
          <p className="text-[#1A120B]/60">#{orderId.toUpperCase()}</p>
        </div>

        {/* Status Tracker */}
        <div className="bg-white p-8 md:p-12 rounded-[32px] border border-[#E8E2D9] shadow-sm mb-8">
          
          <div className="relative">
            {/* Background Line */}
            <div className="absolute top-8 left-[10%] right-[10%] h-1 bg-[#E8E2D9] rounded-full hidden md:block"></div>
            
            {/* Active Line */}
            <div 
              className="absolute top-8 left-[10%] h-1 bg-[#D4A853] rounded-full hidden md:block transition-all duration-1000 ease-in-out overflow-hidden"
              style={{ width: `${(currentStepIndex / (STEPS.length - 1)) * 80}%` }}
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

        {/* Order Details & Delivery Map Mock */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#1A120B] p-8 rounded-[32px] text-white">
            <div className="flex items-center gap-3 mb-6">
              <MapPin size={24} className="text-[#D4A853]" />
              <h3 className="font-bold text-lg">{t('deliveryAddress')}</h3>
            </div>
            {orderData.deliveryType === "pickup" ? (
              <>
                <p className="text-white/80">Nicolae Testemițeanu 21/1</p>
                <p className="text-white/60 text-sm mt-1">Preluare din Boutique</p>
              </>
            ) : (
              <>
                <p className="text-white/80">{orderData.customer?.address || "Str. Nicolae Testemițeanu 29"}</p>
                {orderData.customer?.notes && (
                  <p className="text-white/60 text-sm mt-1">Note: {orderData.customer.notes}</p>
                )}
              </>
            )}
            <div className="mt-8 pt-8 border-t border-white/10">
              <p className="text-white/40 text-sm mb-2">{t('estimatedTime')}</p>
              <p className="text-3xl font-serif text-[#FDF9F1]">
                {orderData.deliveryType === "pickup" ? "15 - 20" : "30 - 45"} {t('min')}
              </p>
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-[32px] border border-[#E8E2D9] flex flex-col justify-center items-center text-center">
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="w-16 h-16 bg-[#1A120B]/5 rounded-full flex items-center justify-center text-[#1A120B] mb-4 shadow-[0_10px_30px_rgba(26,18,11,0.05)]"
            >
              <Truck size={28} />
            </motion.div>
            <h3 className="font-bold text-[#1A120B] mb-2">
              {orderData.deliveryType === "pickup" ? "Gata pentru Preluare" : t('ownCourier')}
            </h3>
            <p className="text-[#1A120B]/60 text-sm mb-6">
              {orderData.deliveryType === "pickup" 
                ? "Te așteptăm cu drag în boutique-ul nostru!" 
                : t('courierAssigned')}
            </p>
            <button className="px-6 py-3 border border-[#E8E2D9] rounded-full font-bold text-[#1A120B] hover:bg-[#1A120B]/5 transition-colors">
              {t('contactSupport')}
            </button>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  );
}

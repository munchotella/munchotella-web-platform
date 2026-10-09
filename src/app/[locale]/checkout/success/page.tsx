"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/routing";
import { CheckCircle2, ShoppingBag, ArrowRight, ShieldCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PaymentBadges from "@/components/PaymentBadges";
import { useTranslations, useLocale } from "next-intl";

function SuccessContent() {
  const t = useTranslations("CheckoutSuccess");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const checkoutId = searchParams.get("checkoutId");
  const orderId = searchParams.get("orderId");
  const checkoutStatus = searchParams.get("checkoutStatus") || "Completed";

  const [orderData, setOrderData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    const fetchOrder = async () => {
      try {
        const API_URL = "https://munchotella-api.onrender.com/api";
        const res = await fetch(`${API_URL}/orders/track/${orderId}`);
        const json = await res.json();
        if (json.success) {
          setOrderData(json.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const dateLocale = locale === 'ru' ? 'ru-RU' : locale === 'en' ? 'en-US' : 'ro-RO';
  const isStatusCompleted = checkoutStatus.toLowerCase() === 'completed' || checkoutStatus.toLowerCase() === 'success';

  return (
    <div className="max-w-xl w-full mx-auto bg-[#FFFCF6] border border-[#E8E2D9] rounded-[32px] p-8 md:p-12 shadow-[0_12px_40px_rgb(0,0,0,0.06)] text-center relative overflow-hidden">
      {/* Decorative Warm Glow */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#008F79]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-[#D4A853]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Success Icon */}
      <div className="w-20 h-20 mx-auto rounded-full bg-[#008F79]/15 border border-[#008F79]/30 flex items-center justify-center mb-6 shadow-sm">
        <CheckCircle2 className="w-10 h-10 text-[#008F79]" />
      </div>

      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#008F79]/10 text-[#008F79] text-xs font-bold uppercase tracking-wider mb-3">
        <ShieldCheck className="w-3.5 h-3.5" /> {t('badge')}
      </span>

      <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#1A120B] mb-3">
        {t('title')}
      </h1>
      
      <p className="text-[#736A60] text-sm md:text-base mb-8 max-w-md mx-auto leading-relaxed">
        {t.rich('description', {
          strong: (chunks) => <strong>{chunks}</strong>
        })}
      </p>

      {/* Order Details Card (MAIB E-commerce Requirements) */}
      <div className="bg-white rounded-2xl border border-[#E8E2D9] p-5 mb-8 text-left space-y-3 text-sm shadow-xs">
        <div className="flex justify-between items-center py-1 border-b border-[#E8E2D9]/60">
          <span className="text-[#736A60]">{t('merchant')}</span>
          <span className="font-bold text-[#1A120B]">MUNCHOTELLA S.R.L.</span>
        </div>

        {orderId && (
          <div className="flex justify-between items-center py-1 border-b border-[#E8E2D9]/60">
            <span className="text-[#736A60]">{t('orderNumber')}</span>
            <span className="font-mono font-bold text-[#1A120B]">{String(orderId).slice(-6).toUpperCase()}</span>
          </div>
        )}

        {checkoutId && (
          <div className="flex justify-between items-center py-1 border-b border-[#E8E2D9]/60">
            <span className="text-[#736A60]">{t('maibTransactionId')}</span>
            <span className="font-mono text-xs text-[#736A60] max-w-[200px] truncate">{checkoutId}</span>
          </div>
        )}

        {loading ? (
          <div className="py-2 text-center text-xs text-[#736A60]">{t('loading')}</div>
        ) : orderData ? (
          <>
            <div className="flex justify-between items-center py-1 border-b border-[#E8E2D9]/60">
              <span className="text-[#736A60]">{t('transactionDate')}</span>
              <span className="font-mono text-[#1A120B]">{new Date(orderData.createdAt).toLocaleString(dateLocale)}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-[#E8E2D9]/60">
              <span className="text-[#736A60]">{t('amountPaid')}</span>
              <span className="font-bold text-[#D4A853]">{orderData.totalPrice} MDL</span>
            </div>
            
            <div className="py-2 border-b border-[#E8E2D9]/60">
              <span className="text-[#736A60] block mb-2 font-bold text-xs uppercase tracking-wider">{t('orderedProducts')}</span>
              <ul className="space-y-1.5">
                {orderData.items?.map((item: any, idx: number) => (
                  <li key={idx} className="flex justify-between text-xs">
                    <span className="text-[#1A120B]">
                      {item.quantity} x {item.name} 
                      {item.variantName ? ` (${item.variantName})` : ''}
                    </span>
                    <span className="text-[#736A60]">{item.itemTotal} MDL</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : null}

        <div className="flex justify-between items-center py-1">
          <span className="text-[#736A60]">{t('paymentStatus')}</span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-[#008F79]/15 text-[#008F79]">
            {isStatusCompleted ? t('statusCompleted') : checkoutStatus}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Link
          href="/"
          className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#1A120B] text-white font-bold text-sm hover:bg-[#D4A853] transition-colors flex items-center justify-center gap-2 shadow-lg"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>{t('backToMenu')}</span>
        </Link>
        <Link
          href="/legal#delivery"
          className="w-full sm:w-auto px-6 py-3.5 rounded-full border border-[#E8E2D9] bg-white text-[#1A120B] font-bold text-sm hover:bg-[#FAF7F2] transition-colors flex items-center justify-center gap-2"
        >
          <span>{t('deliveryDetails')}</span>
          <ArrowRight className="w-4 h-4 text-[#736A60]" />
        </Link>
      </div>

      {/* Footer Badges inside Card */}
      <div className="mt-10 pt-6 border-t border-[#E8E2D9]/70 flex flex-col items-center gap-3">
        <span className="text-[11px] uppercase tracking-wider text-[#736A60]/80 font-medium">
          {t('secureProcessor')}
        </span>
        <PaymentBadges variant="checkout" />
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-between">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-24 md:py-32">
        <Suspense fallback={<div className="w-8 h-8 border-3 border-[#D4A853] border-t-transparent rounded-full animate-spin mx-auto" />}>
          <SuccessContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

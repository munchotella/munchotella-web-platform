"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { 
  ChevronDown, 
  Phone, 
  PhoneCall,
  Utensils, 
  MapPin, 
  Clock, 
  ExternalLink,
  Flame,
  CheckCircle2,
  PackageCheck,
  Award,
  Sparkles,
  ArrowUpRight,
  Copy,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { useTranslations } from "next-intl";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  tag?: string;
}

export default function FAQClient({ faqItems }: { faqItems: FAQItem[] }) {
  const t = useTranslations("FAQ");
  const tContact = useTranslations("Contact");
  const [openId, setOpenId] = useState<string | null>("q1");
  const [isCalling, setIsCalling] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  const handleCallClick = (e: React.MouseEvent) => {
    setIsCalling(true);
    // Also copy number to clipboard on desktop/all devices as convenient backup
    if (navigator?.clipboard) {
      navigator.clipboard.writeText("+37379006499").then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 3000);
      }).catch(() => {});
    }
    setTimeout(() => {
      window.location.href = "tel:+37379006499";
      setTimeout(() => setIsCalling(false), 2000);
    }, 250);
  };

  return (
    <div className="bg-[#FAF7F2] text-[#1A120B] font-sans antialiased min-h-screen selection:bg-[#D4A853] selection:text-white pt-28 pb-24 md:pt-36 md:pb-32 overflow-x-hidden">
      <div className="max-w-[1140px] mx-auto px-4 sm:px-6 md:px-8">
        
        {/* Editorial Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center space-x-2.5 text-xs font-semibold uppercase tracking-widest text-[#736A60]">
            <li>
              <Link href="/" className="hover:text-[#D4A853] transition-colors">
                Munchotella
              </Link>
            </li>
            <li className="text-[#D4A853]/40">•</li>
            <li className="text-[#D4A853] font-bold" aria-current="page">
              FAQ
            </li>
          </ol>
        </nav>

        {/* Hero Section: Warm Luxury Editorial */}
        <header className="text-center mb-14 md:mb-18 max-w-3xl mx-auto">
          <AnimateIn direction="up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4A853]/15 border border-[#D4A853]/35 text-[#8C6B1B] text-[11px] font-bold uppercase tracking-[0.2em] mb-5 shadow-xs">
              <Award className="w-3.5 h-3.5 text-[#D4A853]" />
              <span>{t("badge")}</span>
            </div>
          </AnimateIn>

          <AnimateIn direction="up" delay={0.1}>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-normal text-[#1A120B] tracking-tight mb-5 leading-[1.15]">
              {t("title")}
            </h1>
          </AnimateIn>

          <AnimateIn direction="up" delay={0.2}>
            <p className="text-[#736A60] text-base sm:text-lg font-light leading-relaxed max-w-2xl mx-auto">
              {t("subtitle")}
            </p>
          </AnimateIn>
        </header>

        {/* Floating Quick Info Cards */}
        <AnimateIn direction="up" delay={0.25}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5 mb-14 md:mb-18">
            
            {/* Location Card */}
            <div className="bg-[#FFFCF6] border border-[#E8E2D9] rounded-2xl p-5 shadow-[0_4px_20px_rgba(26,26,26,0.03)] hover:border-[#D4A853]/60 transition-all duration-300 flex flex-col justify-between group">
              <div className="flex items-center gap-3.5 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#D4A853]/15 text-[#8C6B1B] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <MapPin className="w-5 h-5 text-[#D4A853]" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-[#736A60] uppercase tracking-wider">{tContact("addressTitle")}</p>
                  <p className="text-sm font-bold text-[#1A120B]">Str. Testemițanu 21/1</p>
                </div>
              </div>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Munchotella+Strada+Nicolae+Testemi%C8%9Beanu+21%2F1+Chisinau"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#D4A853] hover:text-[#1A120B] transition-colors pt-2 border-t border-[#E8E2D9]/60"
              >
                <span>{tContact("openMap")}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Schedule / Delivery Card */}
            <div className="bg-[#FFFCF6] border border-[#E8E2D9] rounded-2xl p-5 shadow-[0_4px_20px_rgba(26,26,26,0.03)] hover:border-[#D4A853]/60 transition-all duration-300 flex flex-col justify-between group">
              <div className="flex items-center gap-3.5 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#D4A853]/15 text-[#8C6B1B] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Clock className="w-5 h-5 text-[#D4A853]" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-[#736A60] uppercase tracking-wider">{tContact("scheduleTitle")}</p>
                  <p className="text-sm font-bold text-[#1A120B]">16:00 – 00:00</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] font-medium text-[#736A60] pt-2 border-t border-[#E8E2D9]/60">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#D4A853] animate-pulse inline-block" />
                  {tContact("scheduleTime")}
                </span>
                <span className="text-amber-700 font-semibold">{tContact("scheduleClosed")}</span>
              </div>
            </div>

            {/* Phone & Fast Orders Card */}
            <div className="bg-[#FFFCF6] border border-[#E8E2D9] rounded-2xl p-5 shadow-[0_4px_20px_rgba(26,26,26,0.03)] hover:border-[#D4A853]/60 transition-all duration-300 flex flex-col justify-between group">
              <div className="flex items-center gap-3.5 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#D4A853]/15 text-[#8C6B1B] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Phone className="w-5 h-5 text-[#D4A853]" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-[#736A60] uppercase tracking-wider">{tContact("phoneEmailTitle")}</p>
                  <button
                    type="button"
                    onClick={handleCallClick}
                    className="text-sm font-bold text-[#1A120B] hover:text-[#D4A853] transition-colors flex items-center gap-1.5 cursor-pointer text-left"
                  >
                    <span>079 006 499</span>
                    {isCopied ? (
                      <Check className="w-3.5 h-3.5 text-[#D4A853]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-[#736A60] opacity-60 hover:opacity-100" />
                    )}
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCallClick}
                className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#D4A853] hover:text-[#1A120B] transition-colors pt-2 border-t border-[#E8E2D9]/60 cursor-pointer text-left"
              >
                <span>{isCalling ? t("callingState") : t("contactBtn")}</span>
                <PhoneCall className={`w-3 h-3 ${isCalling ? "animate-bounce" : ""}`} />
              </button>
            </div>

          </div>
        </AnimateIn>

        {/* Quality Guarantees Ribbon */}
        <AnimateIn direction="up" delay={0.28}>
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-8 py-3 px-6 mb-12 rounded-full bg-[#FFFCF6]/80 border border-[#E8E2D9] text-xs font-semibold text-[#736A60] shadow-xs">
            <span className="inline-flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-[#D4A853]" />
              Nutella® Original
            </span>
            <span className="hidden sm:inline text-[#D4A853]/40">•</span>
            <span className="inline-flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#D4A853]" />
              100% Pure Pistachio
            </span>
            <span className="hidden sm:inline text-[#D4A853]/40">•</span>
            <span className="inline-flex items-center gap-1.5">
              <PackageCheck className="w-4 h-4 text-[#D4A853]" />
              Ventilated Thermal Delivery Box
            </span>
            <span className="hidden sm:inline text-[#D4A853]/40">•</span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#D4A853]" />
              Fresh Batter Daily
            </span>
          </div>
        </AnimateIn>

        {/* Accordion Questions List */}
        <div className="space-y-4 max-w-4xl mx-auto">
          {faqItems.map((item, index) => {
            const isOpen = openId === item.id;
            return (
              <AnimateIn key={item.id} direction="up" delay={0.05 * (index + 1)}>
                <div
                  className={`bg-[#FFFCF6] rounded-2xl md:rounded-[20px] border transition-all duration-300 overflow-hidden ${
                    isOpen
                      ? "border-[#D4A853] shadow-[0_8px_30px_rgba(212,168,83,0.14)] ring-1 ring-[#D4A853]/40"
                      : "border-[#E8E2D9] hover:border-[#D4A853]/60 shadow-[0_2px_12px_rgba(26,26,26,0.02)]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleItem(item.id)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${item.id}`}
                    id={`faq-question-${item.id}`}
                    className="w-full px-5 py-5 sm:px-7 sm:py-6 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A853] rounded-2xl group"
                  >
                    <div className="flex items-start sm:items-center gap-4 min-w-0">
                      {/* Number Stamp */}
                      <span
                        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shrink-0 transition-colors duration-300 ${
                          isOpen
                            ? "bg-[#D4A853] text-[#1A120B]"
                            : "bg-[#FAF7F2] text-[#8C6B1B] border border-[#E8E2D9] group-hover:border-[#D4A853]/50"
                        }`}
                      >
                        0{index + 1}
                      </span>

                      {/* Question Text & Category Tag */}
                      <div className="space-y-1 min-w-0">
                        {item.tag && (
                          <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#D4A853] px-2 py-0.5 rounded-md bg-[#D4A853]/10">
                            {item.tag}
                          </span>
                        )}
                        <h2 className="font-serif text-lg sm:text-xl font-medium text-[#1A120B] leading-snug group-hover:text-[#D4A853] transition-colors">
                          {item.question}
                        </h2>
                      </div>
                    </div>

                    {/* Expand/Collapse Toggle Indicator */}
                    <div
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ml-2 ${
                        isOpen
                          ? "bg-[#1A120B] text-[#D4A853] rotate-180 shadow-sm"
                          : "bg-[#FAF7F2] text-[#736A60] group-hover:bg-[#D4A853]/15 group-hover:text-[#8C6B1B]"
                      }`}
                    >
                      <ChevronDown className="w-5 h-5" />
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`faq-answer-${item.id}`}
                        role="region"
                        aria-labelledby={`faq-question-${item.id}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                      >
                        <div className="px-5 pb-6 pt-1 sm:px-7 sm:pb-8 border-t border-[#E8E2D9]/60 bg-white/40">
                          <p className="text-[#1A120B]/85 text-sm sm:text-[15px] font-sans font-light leading-relaxed pl-12 sm:pl-13">
                            {item.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </AnimateIn>
            );
          })}
        </div>

        {/* 21st.dev-Inspired Visual CTA Showcase Card (Warm Luxury Editorial) */}
        <AnimateIn direction="up" delay={0.35}>
          <div className="mt-16 md:mt-24 max-w-4xl mx-auto rounded-3xl bg-[#1A120B] border border-[#D4A853]/30 shadow-2xl overflow-hidden relative">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4A853]/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#D4A853]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col lg:flex-row items-stretch relative z-10">
              
              {/* Visual Appetizer Showcase (40% desktop) */}
              <div className="lg:w-5/12 relative min-h-[260px] lg:min-h-[380px] overflow-hidden group">
                <Image
                  src="/dubai_pistachio_crepe_ref.png"
                  alt="Munchotella Dubai Pistachio Crepe"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A120B] via-[#1A120B]/30 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-[#1A120B]/40 lg:to-[#1A120B]" />
                
                {/* Floating Artisan Badge */}
                <div className="absolute bottom-4 left-4 lg:bottom-6 lg:left-6 px-3.5 py-1.5 rounded-full bg-[#1A120B]/85 backdrop-blur-md border border-[#D4A853]/40 text-white text-[11px] font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-lg">
                  <Award className="w-3.5 h-3.5 text-[#D4A853]" />
                  <span>Handcrafted Daily</span>
                </div>
              </div>

              {/* Content & Action Block (60% desktop) */}
              <div className="lg:w-7/12 p-7 sm:p-10 lg:p-12 flex flex-col justify-center text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4A853]/15 border border-[#D4A853]/30 text-[#D4A853] text-[10px] font-bold uppercase tracking-[0.2em] mb-4 w-fit">
                  <Flame className="w-3 h-3 text-[#D4A853]" />
                  <span>MUNCHOTELLA KITCHEN</span>
                </div>

                <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl font-normal text-white mb-4 tracking-tight leading-snug">
                  {t("ctaTitle")}
                </h3>

                <p className="text-white/75 text-sm sm:text-base font-light leading-relaxed mb-8">
                  {t("ctaDesc")}
                </p>

                {/* Interactive Action Row */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                  <button
                    type="button"
                    onClick={handleCallClick}
                    className={`inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-full font-bold text-xs uppercase tracking-widest transition-all duration-300 min-h-[50px] cursor-pointer active:scale-95 shadow-lg ${
                      isCalling
                        ? "bg-[#D4A853] text-[#1A120B] animate-pulse"
                        : "bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-[#D4A853]/50"
                    }`}
                  >
                    <PhoneCall className={`w-4 h-4 text-[#D4A853] ${isCalling ? "animate-spin" : ""}`} />
                    <span>{isCalling ? t("callingState") : t("contactBtn")}</span>
                  </button>

                  <Link
                    href="/menu"
                    className="inline-flex items-center justify-center gap-2.5 bg-[#D4A853] hover:bg-[#C09640] active:scale-95 text-[#1A120B] font-bold text-xs uppercase tracking-widest px-8 py-4 rounded-full transition-all duration-300 shadow-[0_8px_30px_rgba(212,168,83,0.35)] hover:shadow-[0_12px_35px_rgba(212,168,83,0.45)] min-h-[50px]"
                  >
                    <Utensils className="w-4 h-4 text-[#1A120B]" />
                    <span>{t("menuBtn")}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#1A120B]" />
                  </Link>
                </div>

                {/* Call Feedback Notification */}
                <AnimatePresence>
                  {(isCalling || isCopied) && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#D4A853] bg-[#D4A853]/10 border border-[#D4A853]/30 px-3.5 py-1.5 rounded-lg w-fit"
                    >
                      <Check className="w-3.5 h-3.5 text-[#D4A853]" />
                      <span>{isCopied ? t("callCopied") : t("callingState")} (+373 79 006 499)</span>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>

            </div>
          </div>
        </AnimateIn>

      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown, Phone, Utensils, HelpCircle, Sparkles, MapPin, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { useTranslations } from "next-intl";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export default function FAQClient({ faqItems }: { faqItems: FAQItem[] }) {
  const t = useTranslations("FAQ");
  const [openId, setOpenId] = useState<string | null>("q1");

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="bg-[#FAF7F2] text-[#1A120B] font-sans antialiased min-h-screen selection:bg-[#D4A853] selection:text-white pt-28 pb-24 md:pt-36 md:pb-32">
      <div className="max-w-[1000px] mx-auto px-4 md:px-8">
        
        {/* Breadcrumbs Navigation */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-widest text-[#1A120B]/50">
            <li>
              <Link href="/" className="hover:text-[#D4A853] transition-colors">
                Munchotella
              </Link>
            </li>
            <li>•</li>
            <li className="text-[#D4A853] font-bold" aria-current="page">
              FAQ
            </li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="text-center mb-14 md:mb-20">
          <AnimateIn direction="up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4A853]/15 border border-[#D4A853]/30 text-[#8C6B1B] text-[11px] font-bold uppercase tracking-widest mb-4">
              <Sparkles className="w-3.5 h-3.5 text-[#D4A853]" />
              <span>{t("badge")}</span>
            </div>
          </AnimateIn>

          <AnimateIn direction="up" delay={0.1}>
            <h1 className="font-serif text-4xl md:text-6xl font-medium text-[#1A120B] tracking-tight mb-5 leading-tight">
              {t("title")}
            </h1>
          </AnimateIn>

          <AnimateIn direction="up" delay={0.2}>
            <p className="text-[#1A120B]/75 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              {t("subtitle")}
            </p>
          </AnimateIn>
        </div>

        {/* Quick Highlights Bar */}
        <AnimateIn direction="up" delay={0.25}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            <div className="bg-white/80 backdrop-blur-sm border border-[#1A120B]/10 rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-[#D4A853]/15 text-[#8C6B1B] flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-[#D4A853]" />
              </div>
              <div className="text-left">
                <p className="text-[11px] font-bold text-[#1A120B]/50 uppercase tracking-wider">Locație Boutique</p>
                <p className="text-xs md:text-[13px] font-bold text-[#1A120B]">Str. Testemițanu 21/1</p>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm border border-[#1A120B]/10 rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-[#D4A853]/15 text-[#8C6B1B] flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-[#D4A853]" />
              </div>
              <div className="text-left">
                <p className="text-[11px] font-bold text-[#1A120B]/50 uppercase tracking-wider">Livrare Caldă</p>
                <p className="text-xs md:text-[13px] font-bold text-[#1A120B]">16:00 - 00:00 (Miercuri Închis)</p>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm border border-[#1A120B]/10 rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-[#D4A853]/15 text-[#8C6B1B] flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-[#D4A853]" />
              </div>
              <div className="text-left">
                <p className="text-[11px] font-bold text-[#1A120B]/50 uppercase tracking-wider">Comenzi Rapide</p>
                <a href="tel:+37379006499" className="text-xs md:text-[13px] font-bold text-[#1A120B] hover:text-[#D4A853] transition-colors">
                  079 006 499
                </a>
              </div>
            </div>
          </div>
        </AnimateIn>

        {/* Accordion Questions List */}
        <div className="space-y-4">
          {faqItems.map((item, index) => {
            const isOpen = openId === item.id;
            return (
              <AnimateIn key={item.id} direction="up" delay={0.05 * (index + 1)}>
                <div
                  className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden shadow-sm ${
                    isOpen
                      ? "border-[#D4A853] shadow-md ring-1 ring-[#D4A853]/30"
                      : "border-[#1A120B]/10 hover:border-[#D4A853]/50"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleItem(item.id)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${item.id}`}
                    id={`faq-question-${item.id}`}
                    className="w-full px-6 py-5 md:px-8 md:py-6 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A853]"
                  >
                    <div className="flex items-center gap-4">
                      <span className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#FAF7F2] text-[#8C6B1B] border border-[#1A120B]/10 flex items-center justify-center text-xs md:text-sm font-bold shrink-0">
                        0{index + 1}
                      </span>
                      <h2 className="font-serif text-lg md:text-xl font-medium text-[#1A120B] leading-snug">
                        {item.question}
                      </h2>
                    </div>

                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                        isOpen
                          ? "bg-[#1A120B] text-[#D4A853] rotate-180"
                          : "bg-[#FAF7F2] text-[#1A120B]/60"
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
                        <div className="px-6 pb-6 pt-1 md:px-8 md:pb-8 border-t border-[#FAF7F2]">
                          <p className="text-[#1A120B]/80 text-sm md:text-base leading-relaxed pl-11 md:pl-12">
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

        {/* Call to Action Footer Box */}
        <AnimateIn direction="up" delay={0.4}>
          <div className="mt-16 bg-[#1A120B] rounded-3xl p-8 md:p-12 text-center text-white border border-[#D4A853]/20 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4A853]/10 rounded-full blur-3xl -z-0 pointer-events-none" />
            <div className="relative z-10 max-w-xl mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-[#D4A853]/20 text-[#D4A853] flex items-center justify-center mx-auto mb-5">
                <HelpCircle className="w-6 h-6 text-[#D4A853]" />
              </div>
              <h3 className="font-serif text-2xl md:text-3xl font-medium mb-3 text-white">
                {t("ctaTitle")}
              </h3>
              <p className="text-white/70 text-sm md:text-base leading-relaxed mb-8">
                {t("ctaDesc")}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="tel:+37379006499"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-widest px-7 py-4 rounded-full border border-white/20 transition-all duration-300 min-h-[44px]"
                >
                  <Phone className="w-4 h-4 text-[#D4A853]" />
                  <span>{t("contactBtn")}</span>
                </a>

                <Link
                  href="/menu"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#D4A853] hover:bg-[#C09640] text-[#1A120B] font-bold text-xs uppercase tracking-widest px-8 py-4 rounded-full transition-all duration-300 shadow-lg hover:scale-105 min-h-[44px]"
                >
                  <Utensils className="w-4 h-4 text-[#1A120B]" />
                  <span>{t("menuBtn")}</span>
                </Link>
              </div>
            </div>
          </div>
        </AnimateIn>

      </div>
    </div>
  );
}

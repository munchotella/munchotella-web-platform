"use client";

import React, { useState } from "react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthContext";
import { 
  ShieldCheck, 
  Trash2, 
  Mail, 
  Phone, 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Smartphone, 
  Globe, 
  Headphones, 
  Send, 
  Check, 
  Loader2, 
  X 
} from "lucide-react";
import { AnimateIn } from "@/components/ui/AnimateIn";

interface DeleteAccountClientProps {
  locale: string;
}

export default function DeleteAccountClient({ locale }: DeleteAccountClientProps) {
  const t = useTranslations("DeleteAccount");
  const { user, token, logout } = useAuth();

  // Formular Web State
  const [contactInput, setContactInput] = useState("");
  const [reasonInput, setReasonInput] = useState("");
  const [confirmCheckbox, setConfirmCheckbox] = useState(false);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [ticketSuccess, setTicketSuccess] = useState<string | null>(null);

  // Modal Stergere Directa (Utilizatori Autentificati)
  const [showDirectModal, setShowDirectModal] = useState(false);
  const [isDeletingDirectly, setIsDeletingDirectly] = useState(false);
  const [directDeleteSuccess, setDirectDeleteSuccess] = useState(false);
  const [directDeleteError, setDirectDeleteError] = useState<string | null>(null);

  // Trimitere Formular Web (pentru cei fara aplicatie sau delogati)
  const handleWebRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!contactInput.trim()) {
      setFormError(t("validationErrorRequired"));
      return;
    }

    if (!confirmCheckbox) {
      setFormError(t("validationErrorCheckbox"));
      return;
    }

    try {
      setIsSubmittingForm(true);

      const res = await fetch("/api/delete-account-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contact: contactInput.trim(),
          reason: reasonInput.trim(),
          confirmed: confirmCheckbox,
          locale
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setTicketSuccess(data.ticketId);
        setContactInput("");
        setReasonInput("");
        setConfirmCheckbox(false);
      } else {
        setFormError(data.error || t("serverError"));
      }
    } catch (err) {
      console.error("Web deletion request error:", err);
      setFormError(t("serverError"));
    } finally {
      setIsSubmittingForm(false);
    }
  };

  // Stergere Directa din Backend pentru utilizatorul logat
  const handleExecuteDirectDelete = async () => {
    try {
      setIsDeletingDirectly(true);
      setDirectDeleteError(null);

      const API_URL = "https://munchotella-api.onrender.com/api";
      const headers: Record<string, string> = {};

      let currentToken = token;
      if (!currentToken && typeof window !== "undefined") {
        currentToken = localStorage.getItem("munchotella_token");
      }

      if (currentToken) {
        headers["Authorization"] = `Bearer ${currentToken}`;
      }

      const res = await fetch(`${API_URL}/users/account`, {
        method: "DELETE",
        credentials: "include",
        headers
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setDirectDeleteSuccess(true);
        setTimeout(() => {
          logout();
          setShowDirectModal(false);
        }, 2500);
      } else {
        setDirectDeleteError(data.message || t("serverError"));
      }
    } catch (err) {
      console.error("Direct deletion error:", err);
      setDirectDeleteError(t("serverError"));
    } finally {
      setIsDeletingDirectly(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF7F2] text-[#1A120B] pt-28 pb-32 selection:bg-[#D4A853] selection:text-white">
      <div className="max-w-[880px] mx-auto px-5 sm:px-8 md:px-12">
        
        {/* Navigare / Breadcrumb */}
        <AnimateIn direction="up">
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-[#736A60] mb-8" aria-label="Breadcrumb">
            <Link 
              href="/" 
              className="inline-flex items-center gap-1.5 hover:text-[#1A120B] transition-colors font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {t("breadcrumbHome")}
            </Link>
            <span className="text-[#E8E2D9]">/</span>
            <span className="text-[#1A120B] font-semibold">{t("breadcrumbCurrent")}</span>
          </nav>

          {/* Header Editorial */}
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4A853]/15 text-[#9E721D] border border-[#D4A853]/30 text-xs sm:text-sm font-bold uppercase tracking-wider mb-5">
              <ShieldCheck className="w-4 h-4 text-[#D4A853]" />
              {t("heroBadge")}
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#1A120B] tracking-tight mb-4">
              {t("heroTitle")}
            </h1>

            <p className="text-[#736A60] text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              {t("heroSubtitle")}
            </p>
          </div>
        </AnimateIn>

        {/* Zona Inteligenta Utilizator Conectat (Daca este autentificat) */}
        {user && (
          <AnimateIn direction="up" delay={0.05}>
            <div className="mb-10 p-6 sm:p-8 rounded-3xl bg-[#FFFCF6] border-2 border-[#D4A853]/40 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4A853]/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
                <div>
                  <div className="inline-flex items-center gap-2 text-xs font-bold text-[#D4A853] uppercase tracking-wider mb-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    {t("statusLoggedIn")}
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1A120B]">
                    {t("connectedAs")}: {user.name || user.phone}
                  </h3>
                  <p className="text-sm text-[#736A60] mt-1 max-w-md">
                    {t("btnDirectDeleteDesc")}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowDirectModal(true)}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#E83434] hover:bg-[#D32F2F] active:scale-95 text-white font-bold text-sm shadow-sm transition-all shrink-0 min-h-[48px]"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{t("btnDirectDelete")}</span>
                </button>
              </div>
            </div>
          </AnimateIn>
        )}

        <div className="space-y-10">
          
          {/* Bento Grid 1: Cele 3 Metode Oficiale de Stergere */}
          <AnimateIn direction="up" delay={0.1}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Card 1: Aplicatie Mobila */}
              <div className="p-6 rounded-3xl bg-[#FFFCF6] border border-[#E8E2D9] shadow-sm flex flex-col justify-between hover:border-[#D4A853]/50 transition-colors">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#1A120B] text-[#D4A853] flex items-center justify-center">
                      <Smartphone className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {t("cardAppBadge")}
                    </span>
                  </div>

                  <h3 className="font-serif text-lg font-bold text-[#1A120B] mb-3">
                    {t("cardAppTitle")}
                  </h3>

                  <ul className="space-y-2.5 text-sm text-[#736A60]">
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-[#1A120B] text-white text-[11px] flex items-center justify-center font-mono shrink-0 mt-0.5">1</span>
                      <span>{t("cardAppStep1")}</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-[#1A120B] text-white text-[11px] flex items-center justify-center font-mono shrink-0 mt-0.5">2</span>
                      <span>{t("cardAppStep2")}</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-[#1A120B] text-white text-[11px] flex items-center justify-center font-mono shrink-0 mt-0.5">3</span>
                      <span>{t("cardAppStep3")}</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Card 2: Formular Web Fara Aplicatie */}
              <div className="p-6 rounded-3xl bg-[#FFFCF6] border border-[#E8E2D9] shadow-sm flex flex-col justify-between hover:border-[#D4A853]/50 transition-colors">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D9] text-[#1A120B] flex items-center justify-center">
                      <Globe className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                      {t("cardWebBadge")}
                    </span>
                  </div>

                  <h3 className="font-serif text-lg font-bold text-[#1A120B] mb-3">
                    {t("cardWebTitle")}
                  </h3>

                  <p className="text-sm text-[#736A60] leading-relaxed mb-4">
                    {t("cardWebDesc")}
                  </p>
                </div>

                <a
                  href="#web-request-form"
                  className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-[#D4A853] hover:text-[#C09640] uppercase tracking-wider mt-2 py-2"
                >
                  <span>Completează formularul</span>
                  <span>↓</span>
                </a>
              </div>

              {/* Card 3: Asistenta Directa la Chisinau */}
              <div className="p-6 rounded-3xl bg-[#FFFCF6] border border-[#E8E2D9] shadow-sm flex flex-col justify-between hover:border-[#D4A853]/50 transition-colors">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D9] text-[#D4A853] flex items-center justify-center">
                      <Headphones className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      Chișinău
                    </span>
                  </div>

                  <h3 className="font-serif text-lg font-bold text-[#1A120B] mb-3">
                    {t("cardSupportTitle")}
                  </h3>

                  <p className="text-xs text-[#736A60] mb-4">
                    {t("cardSupportDesc")}
                  </p>

                  <div className="space-y-2.5 text-sm">
                    <a
                      href="tel:+37379006499"
                      className="flex items-center gap-2.5 font-bold text-[#1A120B] hover:text-[#D4A853] transition-colors py-1"
                    >
                      <Phone className="w-4 h-4 text-[#D4A853] shrink-0" />
                      <span>+373 79 006 499</span>
                    </a>
                    <a
                      href="mailto:munchotella@gmail.com?subject=Solicitare%20Stergere%20Date%20Munchotella"
                      className="flex items-center gap-2.5 text-[#736A60] hover:text-[#1A120B] transition-colors py-1 text-xs"
                    >
                      <Mail className="w-4 h-4 text-[#D4A853] shrink-0" />
                      <span className="truncate">munchotella@gmail.com</span>
                    </a>
                  </div>
                </div>

                <span className="text-[11px] text-[#736A60]/80 mt-4 block">
                  {t("cardSupportHours")}
                </span>
              </div>
            </div>
          </AnimateIn>

          {/* Bento Grid 2: Transparenta si Categorii de Date */}
          <AnimateIn direction="up" delay={0.15}>
            <div className="bg-[#FFFCF6] p-6 sm:p-8 rounded-3xl border border-[#E8E2D9] shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="w-6 h-6 text-[#D4A853]" />
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1A120B]">
                  {t("dataDeletedTitle")}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date Eliminate Definitiv */}
                <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D9]/80">
                  <h4 className="font-bold text-sm text-[#1A120B] uppercase tracking-wider mb-4 flex items-center gap-2 text-emerald-700">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    Eliminate definitiv la confirmare
                  </h4>
                  <ul className="space-y-3 text-sm text-[#4A4238]">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                      <span>{t("dataDeleted1")}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                      <span>{t("dataDeleted2")}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                      <span>{t("dataDeleted3")}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                      <span>{t("dataDeleted4")}</span>
                    </li>
                  </ul>
                </div>

                {/* Date Anonimizate Conform Legii RM */}
                <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D9]/80 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-[#1A120B] uppercase tracking-wider mb-4 flex items-center gap-2 text-amber-700">
                      <ShieldCheck className="w-4 h-4 shrink-0 text-amber-600" />
                      {t("dataRetainedTitle")}
                    </h4>
                    <p className="text-sm text-[#4A4238] leading-relaxed">
                      {t("dataRetainedDesc")}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#E8E2D9] flex items-center justify-between text-xs text-[#736A60]">
                    <span>{t("dataRetainedBadge")}</span>
                    <Link href="/legal" className="text-[#D4A853] hover:underline font-medium">
                      Politica de Confidențialitate →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </AnimateIn>

          {/* Bento Grid 3: Formular Web Interactiv (Cerință Oficială Store 2024+) */}
          <section id="web-request-form" className="scroll-mt-32">
            <AnimateIn direction="up" delay={0.2}>
              <div className="bg-[#FFFCF6] p-6 sm:p-10 rounded-3xl border border-[#E8E2D9] shadow-sm relative overflow-hidden">
                <div className="max-w-xl">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D4A853] uppercase tracking-wider mb-2">
                    <Globe className="w-3.5 h-3.5" />
                    Web Deletion Portal
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A120B] mb-3">
                    {t("formTitle")}
                  </h2>
                  <p className="text-sm text-[#736A60] leading-relaxed mb-8">
                    {t("formSubtitle")}
                  </p>
                </div>

                {/* Notificare de Succes cu Numar de Tichet */}
                {ticketSuccess ? (
                  <div className="p-6 sm:p-8 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-center max-w-lg mx-auto">
                    <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto mb-4">
                      <Check className="w-7 h-7" />
                    </div>
                    <h3 className="font-serif text-xl font-bold text-emerald-900 mb-2">
                      {t("submitSuccessTitle")}
                    </h3>
                    <p className="text-sm text-emerald-800 leading-relaxed mb-5">
                      {t("submitSuccessDesc")}
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-emerald-300 font-mono font-bold text-sm text-emerald-950 mb-6 shadow-sm">
                      <span className="text-xs text-emerald-600 uppercase font-sans">{t("ticketNumber")}</span>
                      <span>{ticketSuccess}</span>
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => setTicketSuccess(null)}
                        className="text-xs text-emerald-700 hover:text-emerald-900 font-bold uppercase tracking-wider underline"
                      >
                        {t("submitAnother")}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Formular Propriu-Zis */
                  <form onSubmit={handleWebRequestSubmit} className="space-y-6 max-w-xl">
                    {formError && (
                      <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-start gap-2.5">
                        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
                        <span>{formError}</span>
                      </div>
                    )}

                    {/* Camp Contact */}
                    <div>
                      <label 
                        htmlFor="contactInput" 
                        className="block text-sm font-semibold text-[#1A120B] mb-2"
                      >
                        {t("inputContactLabel")} <span className="text-[#E83434]">*</span>
                      </label>
                      <input
                        id="contactInput"
                        type="text"
                        required
                        value={contactInput}
                        onChange={(e) => setContactInput(e.target.value)}
                        placeholder={t("inputContactPlaceholder")}
                        className="w-full bg-[#FAF7F2] border border-[#E8E2D9] rounded-2xl py-3.5 px-4 text-[#1A120B] text-sm sm:text-base focus:outline-none focus:border-[#D4A853] focus:ring-2 focus:ring-[#D4A853]/20 transition-all min-h-[48px]"
                      />
                    </div>

                    {/* Camp Motiv (Optional) */}
                    <div>
                      <label 
                        htmlFor="reasonInput" 
                        className="block text-sm font-semibold text-[#1A120B] mb-2"
                      >
                        {t("inputReasonLabel")}
                      </label>
                      <textarea
                        id="reasonInput"
                        rows={3}
                        value={reasonInput}
                        onChange={(e) => setReasonInput(e.target.value)}
                        placeholder={t("inputReasonPlaceholder")}
                        className="w-full bg-[#FAF7F2] border border-[#E8E2D9] rounded-2xl py-3 px-4 text-[#1A120B] text-sm focus:outline-none focus:border-[#D4A853] focus:ring-2 focus:ring-[#D4A853]/20 transition-all resize-none"
                      />
                    </div>

                    {/* Checkbox Acord Obligatoriu */}
                    <div className="flex items-start gap-3 pt-1">
                      <input
                        id="confirmCheckbox"
                        type="checkbox"
                        checked={confirmCheckbox}
                        onChange={(e) => setConfirmCheckbox(e.target.checked)}
                        className="w-5 h-5 rounded-md border-[#E8E2D9] text-[#D4A853] focus:ring-[#D4A853] mt-0.5 shrink-0 cursor-pointer accent-[#D4A853]"
                      />
                      <label 
                        htmlFor="confirmCheckbox" 
                        className="text-xs sm:text-sm text-[#4A4238] cursor-pointer select-none leading-relaxed"
                      >
                        {t("checkboxConfirm")}
                      </label>
                    </div>

                    {/* Buton Submit */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSubmittingForm}
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#1A120B] hover:bg-[#D4A853] active:scale-95 text-white font-bold text-sm tracking-wide transition-all shadow-md disabled:opacity-50 min-h-[48px] w-full sm:w-auto"
                      >
                        {isSubmittingForm ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>{t("submitting")}</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>{t("btnSubmitRequest")}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </AnimateIn>
          </section>

          {/* Mesaj de Incheiere Cald (Sensory Copywriting Farewell) */}
          <AnimateIn direction="up" delay={0.25}>
            <div className="p-6 rounded-3xl bg-[#FFFCF6] border border-[#D4A853]/20 text-center max-w-2xl mx-auto shadow-sm">
              <p className="text-sm sm:text-base text-[#736A60] italic leading-relaxed">
                „{t("farewellNote")}”
              </p>
              <div className="mt-3 text-xs font-bold text-[#D4A853] uppercase tracking-wider">
                — Echipa Munchotella Chișinău
              </div>
            </div>
          </AnimateIn>

        </div>
      </div>

      {/* Modal Confirmare Stergere Directa Utilizator Autentificat */}
      {showDirectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div 
            className="w-full max-w-md bg-[#FFFCF6] rounded-3xl p-6 sm:p-8 border border-[#E8E2D9] shadow-2xl relative animate-in fade-in zoom-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <button
              type="button"
              onClick={() => !isDeletingDirectly && setShowDirectModal(false)}
              className="absolute top-5 right-5 text-[#736A60] hover:text-[#1A120B] transition-colors p-1"
              aria-label="Închide"
            >
              <X className="w-5 h-5" />
            </button>

            {directDeleteSuccess ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto mb-4">
                  <Check className="w-7 h-7" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#1A120B] mb-2">
                  {t("accountDeletedSuccess")}
                </h3>
              </div>
            ) : (
              <div>
                <div className="w-12 h-12 rounded-2xl bg-red-100 text-[#E83434] flex items-center justify-center mb-4">
                  <AlertTriangle className="w-6 h-6" />
                </div>

                <h3 id="modal-title" className="font-serif text-xl sm:text-2xl font-bold text-[#1A120B] mb-3">
                  {t("modalConfirmTitle")}
                </h3>

                <p className="text-sm text-[#736A60] leading-relaxed mb-6">
                  {t("modalConfirmDesc")}
                </p>

                {directDeleteError && (
                  <div className="mb-4 p-3 rounded-xl bg-red-50 text-xs text-red-700 border border-red-200">
                    {directDeleteError}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <button
                    type="button"
                    disabled={isDeletingDirectly}
                    onClick={() => setShowDirectModal(false)}
                    className="w-full sm:w-1/2 py-3 px-4 rounded-full border border-[#E8E2D9] text-[#1A120B] font-bold text-sm hover:bg-[#FAF7F2] transition-colors min-h-[44px]"
                  >
                    {t("modalBtnCancel")}
                  </button>

                  <button
                    type="button"
                    disabled={isDeletingDirectly}
                    onClick={handleExecuteDirectDelete}
                    className="w-full sm:w-1/2 py-3 px-4 rounded-full bg-[#E83434] text-white font-bold text-sm hover:bg-[#D32F2F] active:scale-95 transition-all shadow-sm flex items-center justify-center gap-2 min-h-[44px]"
                  >
                    {isDeletingDirectly ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{t("deletingAccount")}</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        <span>{t("modalBtnConfirm")}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

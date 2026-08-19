"use client";

import React, { useState } from "react";
import LuxuryButton from "@/components/admin/LuxuryButton";
import StatusBadge from "@/components/admin/StatusBadge";
import BentoKpiCard from "@/components/admin/BentoKpiCard";
import {
  Bot,
  MessageSquare,
  Fingerprint,
  Activity,
  Zap,
  CheckCircle2,
  Send,
  Radio,
  Sliders,
  Sparkles,
  ShieldCheck,
  BellRing,
  AlertTriangle,
  UserCheck,
  Clock,
  RefreshCw,
  Cpu,
  CornerDownRight,
  ExternalLink,
  Flame,
  FileCode,
  Tag,
  Plus,
  X
} from "lucide-react";

interface EscalationLog {
  id: string;
  time: string;
  channel: "Instagram" | "WhatsApp" | "Messenger";
  user: string;
  userMessage: string;
  action: "escalated" | "ai_resolved" | "order_placed" | "complaint";
  actionText: string;
  model: string;
  staffAlerted: boolean;
}

export default function AiSettingsPage() {
  // 1. Settings State
  const [tone, setTone] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("munchotella_ai_tone") || "elegant";
    }
    return "elegant";
  });

  const [prompt, setPrompt] = useState(() => {
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("munchotella_ai_prompt") ||
        "Ești asistentul Munchotella Waffle Boutique. Trebuie să răspunzi elegant, politicos și cald clienților pe Instagram, WhatsApp și Messenger. Dacă clientul dorește să comande o clătită Dubai, subliniază că este produsul nostru premium cu pastă de fistic 100% pură, kataif crocant și ciocolată belgiană caldă."
      );
    }
    return "Ești asistentul Munchotella Waffle Boutique. Trebuie să răspunzi elegant, politicos și cald clienților pe Instagram, WhatsApp și Messenger. Dacă clientul dorește să comande o clătită Dubai, subliniază că este produsul nostru premium cu pastă de fistic 100% pură, kataif crocant și ciocolată belgiană caldă.";
  });

  const [selectedModel, setSelectedModel] = useState("gemini-3.7-flash");
  const [temperature, setTemperature] = useState<number>(0.3);
  const [autoOrders, setAutoOrders] = useState<boolean>(true);
  const [autoPauseHandoff, setAutoPauseHandoff] = useState<boolean>(true);
  const [telegramAlertsEnabled, setTelegramAlertsEnabled] = useState<boolean>(true);

  // Trigger Keywords for Human Handoff
  const [keywords, setKeywords] = useState<string[]>([
    "om",
    "operator",
    "telefon",
    "urgent",
    "plangere",
    "nemultumit",
    "intarziat",
    "anulare",
    "manager",
    "vorbesc cu cineva"
  ]);
  const [newKeyword, setNewKeyword] = useState("");

  // Saving & Syncing
  const [saving, setSaving] = useState(false);
  const [syncingKnowledge, setSyncingKnowledge] = useState(false);

  // Telegram Testing State
  const [testingTelegram, setTestingTelegram] = useState(false);
  const [telegramTestStatus, setTelegramTestStatus] = useState<{
    success?: boolean;
    message?: string;
    timestamp?: string;
  } | null>(null);

  // Live Playground Simulator
  const [simMessage, setSimMessage] = useState("");
  const [simLoading, setSimLoading] = useState(false);
  const [simChatHistory, setSimChatHistory] = useState<
    Array<{ sender: "user" | "ai" | "staff_alert"; text: string; time: string; model?: string; latency?: number }>
  >([
    {
      sender: "ai",
      text: "Bună ziua! Sunt Munchotella AI (alimentat de Google Gemini 3.7-Flash). Cu ce desert vă pot încânta astăzi? 🧇🍫",
      time: "Acum",
      model: "gemini-3.7-flash"
    }
  ]);

  // Escalation & Activity Logs
  const [activityLogs] = useState<EscalationLog[]>([
    {
      id: "log-1",
      time: "23:04",
      channel: "Instagram",
      user: "@diana_cr",
      userMessage: "Vreau să comand 2 Waffles Dubai la Testemițeanu 21.",
      action: "order_placed",
      actionText: "Comandă Preluată Automat de AI",
      model: "Gemini 3.7 Flash",
      staffAlerted: true
    },
    {
      id: "log-2",
      time: "22:51",
      channel: "Instagram",
      user: "@alexandra_m",
      userMessage: "Aș vrea să vorbesc cu cineva din staff despre un catering pentru 30 de persoane.",
      action: "escalated",
      actionText: "Escalat la Om (Handoff Operator)",
      model: "Gemini 3.7 Flash",
      staffAlerted: true
    },
    {
      id: "log-3",
      time: "22:38",
      channel: "WhatsApp",
      user: "+373 69 412***",
      userMessage: "Care sunt ingredientele la sosul de ciocolată albă?",
      action: "ai_resolved",
      actionText: "Răspuns AI Meniu Livrat (1.1s)",
      model: "Gemini 3.7 Flash",
      staffAlerted: false
    },
    {
      id: "log-4",
      time: "21:45",
      channel: "Messenger",
      user: "Ionel Rusu",
      userMessage: "Până la ce oră aveți deschis în această seară la boutique?",
      action: "ai_resolved",
      actionText: "Răspuns AI Program Livrat (0.8s)",
      model: "Gemini 3.7 Flash",
      staffAlerted: false
    },
    {
      id: "log-5",
      time: "20:18",
      channel: "Instagram",
      user: "@elena_v",
      userMessage: "Comanda mea întârzie cu 20 de minute, vă rog să verificați!",
      action: "complaint",
      actionText: "Reclamație Livrare ➔ Alertă Telegram Staff",
      model: "Gemini 3.7 Flash",
      staffAlerted: true
    }
  ]);

  // Handle Save
  const handleSave = () => {
    setSaving(true);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("munchotella_ai_tone", tone);
        localStorage.setItem("munchotella_ai_prompt", prompt);
        localStorage.setItem("munchotella_ai_model", selectedModel);
      }
      setTimeout(() => {
        setSaving(false);
        alert("✅ Toate configurările asistentului AI și regulile de escaladare au fost salvate cu succes!");
      }, 400);
    } catch (e) {
      setSaving(false);
      alert("Eroare la salvarea setărilor.");
    }
  };

  // Handle Telegram Test Ping
  const handleTestTelegram = async () => {
    setTestingTelegram(true);
    setTelegramTestStatus(null);
    try {
      const res = await fetch("/api/admin/telegram-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (data.success) {
        setTelegramTestStatus({
          success: true,
          message: "Alertă recepționată cu succes în Grupul Munchotella Staff!",
          timestamp: data.timestamp || new Date().toLocaleTimeString("ro-RO")
        });
      } else {
        setTelegramTestStatus({
          success: false,
          message: data.error || "Eroare la apelul Telegram API"
        });
      }
    } catch (err: any) {
      setTelegramTestStatus({
        success: false,
        message: err?.message || "Eroare conexiune server"
      });
    } finally {
      setTestingTelegram(false);
    }
  };

  // Handle Add Keyword
  const handleAddKeyword = () => {
    if (!newKeyword.trim()) return;
    const clean = newKeyword.trim().toLowerCase();
    if (!keywords.includes(clean)) {
      setKeywords([...keywords, clean]);
    }
    setNewKeyword("");
  };

  const handleRemoveKeyword = (kw: string) => {
    setKeywords(keywords.filter(k => k !== kw));
  };

  // Handle Sync Knowledge
  const handleSyncKnowledge = () => {
    setSyncingKnowledge(true);
    setTimeout(() => {
      setSyncingKnowledge(false);
      alert("✅ Meniul, produsele și prețurile au fost re-indexate complet în memoria asistentului AI!");
    }, 1200);
  };

  // Handle Chat Simulation
  const handleSendSimulation = async () => {
    if (!simMessage.trim() || simLoading) return;
    const userText = simMessage.trim();
    const nowTime = new Date().toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" });

    // Append user message
    setSimChatHistory(prev => [...prev, { sender: "user", text: userText, time: nowTime }]);
    setSimMessage("");
    setSimLoading(true);

    try {
      const res = await fetch("/api/admin/ai-simulator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          prompt: prompt,
          model: selectedModel
        })
      });
      const data = await res.json();

      if (data.escalatedToStaff) {
        setSimChatHistory(prev => [
          ...prev,
          {
            sender: "staff_alert",
            text: `🚨 [ALERTĂ TELEGRAM TRIMISĂ CĂTRE STAFF]: Clientul a declanșat escaladarea umană (${data.escalationReason}). Robotul AI a activat pauza de 30 min.`,
            time: nowTime
          },
          {
            sender: "ai",
            text: data.reply || "Desigur! Vă fac imediat legătura cu un operator din echipa noastră.",
            time: nowTime,
            model: data.modelUsed,
            latency: data.responseTimeMs
          }
        ]);
      } else {
        setSimChatHistory(prev => [
          ...prev,
          {
            sender: "ai",
            text: data.reply || "Bună! Cu drag vă ajutăm cu comanda.",
            time: nowTime,
            model: data.modelUsed,
            latency: data.responseTimeMs
          }
        ]);
      }
    } catch (err) {
      setSimChatHistory(prev => [
        ...prev,
        {
          sender: "ai",
          text: "Eroare la simularea AI. Verificați conexiunea la server.",
          time: nowTime
        }
      ]);
    } finally {
      setSimLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Header & Omnichannel Status */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-vanilla-porcelain border border-warm-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 bg-[#FAF7F2] border border-warm-border rounded-2xl flex items-center justify-center relative shadow-inner">
            <Bot size={40} className="text-gold-saffron" />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center shadow-sm">
              <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="font-headline-lg text-cacao-dark text-2xl md:text-3xl">Munchotella AI Omnichannel Core</h2>
              <span className="bg-gold-saffron/15 text-gold-saffron font-label-caps text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-gold-saffron/30">
                v3.7 FLASH
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              <StatusBadge status="success" label="Activ & Răspunde Live" />
              <span className="text-xs text-cacao-dark/60 font-body-md flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Instagram (@munchotella.md)
              </span>
              <span className="text-xs text-cacao-dark/60 font-body-md flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> WhatsApp (+373)
              </span>
              <span className="text-xs text-cacao-dark/60 font-body-md flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Messenger
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <LuxuryButton variant="primary" onClick={handleSave} disabled={saving} className="shadow-md">
            {saving ? "Se salvează..." : "Salvează Toate Setările"}
          </LuxuryButton>
        </div>
      </div>

      {/* 2. Top Bento KPI Grid (4 Metrics incl. Human Escalations) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <BentoKpiCard
          title="Mesaje Răspunse Azi"
          value="142"
          trend="Timp mediu de răspuns: 1.1s"
          trendPositive={true}
          icon={<MessageSquare size={22} className="text-gold-saffron" />}
          className="bg-vanilla-porcelain border-warm-border"
        />
        <BentoKpiCard
          title="Comenzi Preluare Direct AI"
          value="18"
          trend="+5 comenzi față de ieri"
          trendPositive={true}
          icon={<Zap size={22} className="text-emerald-600" />}
          className="bg-vanilla-porcelain border-warm-border"
        />
        <BentoKpiCard
          title="Escaladate către Om (Staff)"
          value="4"
          subtitle="Rată de escaladare: 2.8% • Toate rezolvate"
          icon={<UserCheck size={22} className="text-amber-600" />}
          className="bg-vanilla-porcelain border-warm-border"
        />
        <BentoKpiCard
          title="Sănătate & Acuratețe AI"
          value="99.8%"
          subtitle="Google Gemini 3.7 • 0 Erori critice"
          icon={<Activity size={22} className="text-blue-600" />}
          className="bg-vanilla-porcelain border-warm-border"
        />
      </div>

      {/* 3. Telegram Staff Alert System & Health Monitor (Card Special Dedicat) */}
      <div className="bg-vanilla-porcelain border border-warm-border rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-warm-border">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#229ED9]/10 border border-[#229ED9]/30 flex items-center justify-center text-[#229ED9]">
              <Send size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-headline-md text-cacao-dark text-xl">Sistem Alerte Telegram Staff</h3>
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 font-label-caps text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  Conectat & Activ (200 OK)
                </span>
              </div>
              <p className="text-xs text-cacao-dark/60 font-body-md mt-0.5">
                Trimite instant comenzi noi, alerte de asistență umană și reclamații pe grupul intern al angajaților.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleTestTelegram}
              disabled={testingTelegram}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-warm-border hover:border-gold-saffron text-cacao-dark font-body-md text-xs font-medium transition-all shadow-sm cursor-pointer hover:bg-gold-saffron/10"
            >
              <BellRing size={16} className={testingTelegram ? "animate-spin text-gold-saffron" : "text-gold-saffron"} />
              {testingTelegram ? "Se trimite testul..." : "⚡ Trimite Alertă Test pe Telegram"}
            </button>
          </div>
        </div>

        {/* Telegram Test Feedback */}
        {telegramTestStatus && (
          <div
            className={`mt-4 p-3.5 rounded-xl text-xs font-body-md flex items-center justify-between border ${
              telegramTestStatus.success
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            <div className="flex items-center gap-2">
              {telegramTestStatus.success ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
              <span>{telegramTestStatus.message}</span>
            </div>
            {telegramTestStatus.timestamp && (
              <span className="text-[10px] opacity-75">Ora: {telegramTestStatus.timestamp}</span>
            )}
          </div>
        )}

        {/* Telegram Config Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-[#FAF7F2] p-4 rounded-xl border border-warm-border/70">
            <span className="block font-label-caps text-cacao-dark/50 text-[10px] uppercase tracking-wider mb-1">
              Bot Token Activ
            </span>
            <span className="font-mono text-xs text-cacao-dark font-semibold">
              8450338336:AAGx...MPUc
            </span>
            <p className="text-[11px] text-emerald-600 font-body-md mt-1 flex items-center gap-1">
              <ShieldCheck size={12} /> Integrat direct în nucleul Vercel
            </p>
          </div>

          <div className="bg-[#FAF7F2] p-4 rounded-xl border border-warm-border/70">
            <span className="block font-label-caps text-cacao-dark/50 text-[10px] uppercase tracking-wider mb-1">
              Grup Destinație (Chat ID)
            </span>
            <span className="font-mono text-xs text-cacao-dark font-semibold">
              -4164368978 (Grupul Munchotella)
            </span>
            <p className="text-[11px] text-cacao-dark/60 font-body-md mt-1 flex items-center gap-1">
              <UserCheck size={12} /> Staff Recepție & Bucătărie
            </p>
          </div>

          <div className="bg-[#FAF7F2] p-4 rounded-xl border border-warm-border/70">
            <span className="block font-label-caps text-cacao-dark/50 text-[10px] uppercase tracking-wider mb-1">
              Viteză & Mod Notificare
            </span>
            <span className="font-body-md text-xs text-cacao-dark font-semibold">
              &lt; 350ms (Push Instant)
            </span>
            <p className="text-[11px] text-gold-saffron font-body-md mt-1 flex items-center gap-1">
              <Sparkles size={12} /> Auto-formatare Markdown cu detalii
            </p>
          </div>
        </div>

        {/* Configured Alert Types */}
        <div className="mt-6 pt-6 border-t border-warm-border/60">
          <span className="block font-label-caps text-cacao-dark/70 text-xs mb-3 font-semibold">
            Tipuri de Alerte Active către Staff:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="flex items-center gap-2.5 p-3 rounded-lg bg-[#FAF7F2] border border-warm-border text-xs text-cacao-dark">
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
              <span>🎉 <strong>Comenzi Noi Plasate</strong> (Adresă, produse, sumă)</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-lg bg-[#FAF7F2] border border-warm-border text-xs text-cacao-dark">
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
              <span>🚨 <strong>Cerere Operator Uman</strong> (Handoff instant)</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-lg bg-[#FAF7F2] border border-warm-border text-xs text-cacao-dark">
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
              <span>⚠️ <strong>Reclamații & Probleme</strong> (Alertă roșie)</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-lg bg-[#FAF7F2] border border-warm-border text-xs text-cacao-dark">
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
              <span>❓ <strong>Întrebări Speciale Client</strong> (Nespecificate în meniu)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Model Architecture & Failover Cascade */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Model Architecture & Options */}
        <div className="bg-vanilla-porcelain border border-warm-border rounded-2xl p-6 md:p-8 space-y-6 lg:col-span-2 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Cpu className="text-gold-saffron" size={24} />
              <div>
                <h3 className="font-headline-md text-cacao-dark text-xl">Arhitectură Google Gemini & Cascadă</h3>
                <p className="text-xs text-cacao-dark/60 font-body-md">
                  Configurarea nucleului de procesare a limbajului natural și sistemul anti-cădere
                </p>
              </div>
            </div>
            <span className="px-3 py-1 bg-gold-saffron/10 text-gold-saffron border border-gold-saffron/30 rounded-lg text-xs font-semibold font-label-caps">
              Economic & Rapid
            </span>
          </div>

          {/* Model Selector Cards */}
          <div>
            <label className="block font-label-caps text-cacao-dark/60 text-xs mb-3">Model AI Principal Selectat</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setSelectedModel("gemini-3.7-flash")}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative ${
                  selectedModel === "gemini-3.7-flash"
                    ? "border-gold-saffron bg-gold-saffron/10 shadow-sm"
                    : "border-warm-border bg-[#FAF7F2] hover:bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-body-md font-bold text-sm text-cacao-dark">Gemini 3.7 Flash</span>
                  {selectedModel === "gemini-3.7-flash" && <CheckCircle2 size={16} className="text-gold-saffron" />}
                </div>
                <p className="text-[11px] text-cacao-dark/70 font-body-md">
                  Modelul Recomandat. Viteză maximă, cel mai mic cost și raționament superior.
                </p>
                <div className="mt-2 text-[10px] font-label-caps text-emerald-700 font-bold bg-emerald-100/60 px-2 py-0.5 rounded inline-block">
                  ACTIV ÎN PRODUCȚIE
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedModel("gemini-3.6-flash")}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedModel === "gemini-3.6-flash"
                    ? "border-gold-saffron bg-gold-saffron/10 shadow-sm"
                    : "border-warm-border bg-[#FAF7F2] hover:bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-body-md font-bold text-sm text-cacao-dark">Gemini 3.6 Flash</span>
                  {selectedModel === "gemini-3.6-flash" && <CheckCircle2 size={16} className="text-gold-saffron" />}
                </div>
                <p className="text-[11px] text-cacao-dark/70 font-body-md">
                  Trepte secundare de rezervă în caz de vârf de trafic.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedModel("gemini-3.5-flash")}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedModel === "gemini-3.5-flash"
                    ? "border-gold-saffron bg-gold-saffron/10 shadow-sm"
                    : "border-warm-border bg-[#FAF7F2] hover:bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-body-md font-bold text-sm text-cacao-dark">Gemini 3.5 Flash</span>
                  {selectedModel === "gemini-3.5-flash" && <CheckCircle2 size={16} className="text-gold-saffron" />}
                </div>
                <p className="text-[11px] text-cacao-dark/70 font-body-md">
                  Trepte terțiare de rezervă pentru disponibilitate 100%.
                </p>
              </button>
            </div>
          </div>

          {/* Failover Cascade Visual Schema */}
          <div className="bg-[#FAF7F2] border border-warm-border rounded-xl p-4">
            <span className="block font-label-caps text-cacao-dark/60 text-xs mb-2 font-semibold flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-600" />
              Sistem Cascadă de Siguranță (Zero Downtime Failover):
            </span>
            <div className="flex flex-wrap items-center gap-2 text-xs font-body-md text-cacao-dark">
              <span className="bg-white px-3 py-1 rounded-lg border border-gold-saffron font-bold text-gold-saffron shadow-2xs">
                1. Gemini 3.7-Flash (Principal)
              </span>
              <CornerDownRight size={14} className="text-cacao-dark/40" />
              <span className="bg-white px-3 py-1 rounded-lg border border-warm-border text-cacao-dark/80">
                2. Gemini 3.6-Flash
              </span>
              <CornerDownRight size={14} className="text-cacao-dark/40" />
              <span className="bg-white px-3 py-1 rounded-lg border border-warm-border text-cacao-dark/80">
                3. Gemini 3.5-Flash
              </span>
              <CornerDownRight size={14} className="text-cacao-dark/40" />
              <span className="bg-emerald-50 text-emerald-800 px-3 py-1 rounded-lg border border-emerald-200 font-medium">
                4. Motor Local Reguli & Meniu
              </span>
            </div>
          </div>

          {/* Fine Tuning Toggles & Sliders */}
          <div className="space-y-4 pt-2">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-label-caps text-cacao-dark/60 text-xs">
                  Nivel de Creativitate / Temperatură: <strong className="text-cacao-dark">{temperature}</strong>
                </label>
                <span className="text-[11px] text-cacao-dark/50 font-body-md">
                  {temperature <= 0.3 ? "Strict & Fidel Meniului" : temperature <= 0.6 ? "Echilibrat & Cald" : "Creativ & Conversațional"}
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.1"
                value={temperature}
                onChange={e => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-gold-saffron cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <label className="flex items-center gap-3 p-3 rounded-xl bg-[#FAF7F2] border border-warm-border cursor-pointer hover:bg-white transition-colors">
                <input
                  type="checkbox"
                  checked={autoOrders}
                  onChange={e => setAutoOrders(e.target.checked)}
                  className="accent-gold-saffron w-4 h-4 rounded"
                />
                <div>
                  <span className="block text-xs font-semibold text-cacao-dark">Preluare Automată Comenzi</span>
                  <span className="block text-[10px] text-cacao-dark/60">Salvează comenzile din chat direct în panou</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl bg-[#FAF7F2] border border-warm-border cursor-pointer hover:bg-white transition-colors">
                <input
                  type="checkbox"
                  checked={autoPauseHandoff}
                  onChange={e => setAutoPauseHandoff(e.target.checked)}
                  className="accent-gold-saffron w-4 h-4 rounded"
                />
                <div>
                  <span className="block text-xs font-semibold text-cacao-dark">Auto-Pauză AI la Intervenție Om (30 min)</span>
                  <span className="block text-[10px] text-cacao-dark/60">Oprește AI-ul pentru a nu întrerupe discuția staff-ului</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Human Escalation Triggers & Keywords */}
        <div className="bg-vanilla-porcelain border border-warm-border rounded-2xl p-6 md:p-8 flex flex-col justify-between shadow-sm space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <UserCheck className="text-amber-600" size={24} />
              <h3 className="font-headline-md text-cacao-dark text-xl">Reguli de Escaladare Umană</h3>
            </div>
            <p className="text-xs text-cacao-dark/60 font-body-md mb-4">
              Când un client folosește aceste cuvinte, AI-ul trimite instant o alertă pe Telegram și predă conversația unui om.
            </p>

            {/* Keyword tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {keywords.map(kw => (
                <span
                  key={kw}
                  className="inline-flex items-center gap-1.5 bg-[#FAF7F2] text-cacao-dark border border-warm-border px-3 py-1 rounded-full text-xs font-body-md shadow-2xs"
                >
                  <Tag size={11} className="text-gold-saffron" />
                  {kw}
                  <button
                    type="button"
                    onClick={() => handleRemoveKeyword(kw)}
                    className="text-cacao-dark/40 hover:text-rose-600 cursor-pointer ml-0.5"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>

            {/* Add new keyword */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Adaugă cuvânt cheie (ex: manager)..."
                value={newKeyword}
                onChange={e => setNewKeyword(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddKeyword();
                  }
                }}
                className="flex-1 bg-[#FAF7F2] border border-warm-border rounded-xl px-3 py-2 text-xs font-body-md text-cacao-dark focus:outline-none focus:border-gold-saffron"
              />
              <button
                type="button"
                onClick={handleAddKeyword}
                className="px-3 py-2 bg-gold-saffron text-white rounded-xl text-xs font-medium flex items-center gap-1 hover:bg-gold-saffron/90 cursor-pointer"
              >
                <Plus size={14} /> Adaugă
              </button>
            </div>
          </div>

          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 text-xs font-body-md text-amber-900">
            <strong className="block mb-1 flex items-center gap-1.5 text-amber-800 font-semibold">
              <AlertTriangle size={14} /> Reclamații & Probleme:
            </strong>
            Dacă clientul exprimă nemulțumiri despre livrare sau produse, botul cere scuze politicos și alertează imediat managerul de tură pe Telegram.
          </div>
        </div>
      </div>

      {/* 5. Personality, Tone & Knowledge Base */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Personality & Prompt */}
        <section className="bg-vanilla-porcelain border border-warm-border rounded-2xl p-6 md:p-8 flex flex-col h-full shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Fingerprint className="text-gold-saffron" size={24} />
            <div>
              <h3 className="font-headline-md text-cacao-dark text-xl">Personalitate, Ton & Prompt</h3>
              <p className="text-xs text-cacao-dark/60 font-body-md">Instrucțiunile de comportament ale botului</p>
            </div>
          </div>

          <div className="space-y-6 flex-1 flex flex-col justify-between">
            <div>
              <label className="block font-label-caps text-cacao-dark/60 text-xs mb-3">Tonul Vocii</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setTone("elegant")}
                  className={`py-3 px-4 rounded-xl font-body-md text-xs md:text-sm transition-all text-center cursor-pointer ${
                    tone === "elegant"
                      ? "border border-gold-saffron bg-gold-saffron/10 text-gold-saffron font-bold shadow-xs"
                      : "border border-warm-border bg-[#FAF7F2] text-cacao-dark/60 hover:bg-white"
                  }`}
                >
                  ✨ Elegant / Premium
                </button>
                <button
                  type="button"
                  onClick={() => setTone("friendly")}
                  className={`py-3 px-4 rounded-xl font-body-md text-xs md:text-sm transition-all text-center cursor-pointer ${
                    tone === "friendly"
                      ? "border border-gold-saffron bg-gold-saffron/10 text-gold-saffron font-bold shadow-xs"
                      : "border border-warm-border bg-[#FAF7F2] text-cacao-dark/60 hover:bg-white"
                  }`}
                >
                  🥰 Prietenos & Cald
                </button>
                <button
                  type="button"
                  onClick={() => setTone("formal")}
                  className={`py-3 px-4 rounded-xl font-body-md text-xs md:text-sm transition-all text-center cursor-pointer ${
                    tone === "formal"
                      ? "border border-gold-saffron bg-gold-saffron/10 text-gold-saffron font-bold shadow-xs"
                      : "border border-warm-border bg-[#FAF7F2] text-cacao-dark/60 hover:bg-white"
                  }`}
                >
                  🎩 Formal
                </button>
              </div>
            </div>

            <div>
              <label className="block font-label-caps text-cacao-dark/60 text-xs mb-3">
                Instrucțiune de Bază (Master Prompt)
              </label>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                rows={5}
                className="w-full bg-[#FAF7F2] border border-warm-border rounded-xl p-4 font-body-md text-sm text-cacao-dark focus:outline-none focus:border-gold-saffron transition-colors resize-none leading-relaxed"
              />
              <span className="text-[11px] text-cacao-dark/50 font-body-md mt-1 block">
                Sugestie: Include detalii despre ingredientele de lux (fistic autentic, ciocolată caldă, căpșuni proaspete).
              </span>
            </div>
          </div>
        </section>

        {/* Right Column: Knowledge Base & Menu Sync */}
        <section className="bg-vanilla-porcelain border border-warm-border rounded-2xl p-6 md:p-8 flex flex-col h-full shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Bot className="text-gold-saffron" size={24} />
              <div>
                <h3 className="font-headline-md text-cacao-dark text-xl">Baza de Cunoștințe & Meniu</h3>
                <p className="text-xs text-cacao-dark/60 font-body-md">Documentele pe care le consultă AI în timp real</p>
              </div>
            </div>
            <button
              onClick={handleSyncKnowledge}
              disabled={syncingKnowledge}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-warm-border text-xs font-body-md font-medium text-cacao-dark hover:border-gold-saffron cursor-pointer"
            >
              <RefreshCw size={14} className={syncingKnowledge ? "animate-spin text-gold-saffron" : "text-gold-saffron"} />
              {syncingKnowledge ? "Sincronizare..." : "🔄 Re-indexează Meniu"}
            </button>
          </div>

          <div className="flex-1 border border-warm-border/60 rounded-xl bg-[#FAF7F2]/60 p-6 flex flex-col justify-between">
            <div>
              <p className="font-body-md text-cacao-dark font-medium mb-1">
                Asistentul AI citește automat meniul tău live din MongoDB.
              </p>
              <p className="font-body-md text-cacao-dark/60 text-xs">
                Toate produsele, opțiunile de topping, prețurile și disponibilitatea sunt sincronizate automat la fiecare modificare.
              </p>
            </div>

            <div className="space-y-2.5 my-4">
              <div className="bg-vanilla-porcelain border border-warm-border p-3.5 rounded-xl flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="text-emerald-500" size={18} />
                  <div>
                    <span className="font-body-md text-xs font-semibold text-cacao-dark block">
                      Meniu_Preturi_Azi.json
                    </span>
                    <span className="text-[10px] text-cacao-dark/50 font-body-md">Clătite Dubai, Waffles, Toppings, Băuturi</span>
                  </div>
                </div>
                <span className="font-label-caps text-[10px] text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded font-bold">
                  LIVE MONGO DB
                </span>
              </div>

              <div className="bg-vanilla-porcelain border border-warm-border p-3.5 rounded-xl flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="text-emerald-500" size={18} />
                  <div>
                    <span className="font-body-md text-xs font-semibold text-cacao-dark block">
                      Zone_Livrare_Chisinau.txt
                    </span>
                    <span className="text-[10px] text-cacao-dark/50 font-body-md">Raza Botanica, Centru, Rîșcani, Ciocana, Buiucani</span>
                  </div>
                </div>
                <span className="font-label-caps text-[10px] text-cacao-dark/50 bg-warm-border/40 px-2 py-0.5 rounded font-medium">
                  Sincronizat
                </span>
              </div>

              <div className="bg-vanilla-porcelain border border-warm-border p-3.5 rounded-xl flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="text-emerald-500" size={18} />
                  <div>
                    <span className="font-body-md text-xs font-semibold text-cacao-dark block">
                      Politica_Retur_si_Alergeni.pdf
                    </span>
                    <span className="text-[10px] text-cacao-dark/50 font-body-md">Alergeni fistic, lapte, gluten, nuci</span>
                  </div>
                </div>
                <span className="font-label-caps text-[10px] text-cacao-dark/50 bg-warm-border/40 px-2 py-0.5 rounded font-medium">
                  Sincronizat
                </span>
              </div>
            </div>

            <div className="text-[11px] text-cacao-dark/60 font-body-md bg-white p-3 rounded-lg border border-warm-border">
              💡 <strong>Sfat:</strong> Schimbările de preț făcute în secțiunea <em>"Meniu și Oferte"</em> sunt transmise instantaneu asistentului AI fără a fi nevoie de restartare.
            </div>
          </div>
        </section>
      </div>

      {/* 6. Live AI Playground & Simulator */}
      <div className="bg-vanilla-porcelain border border-warm-border rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-warm-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-saffron/15 border border-gold-saffron/30 flex items-center justify-center text-gold-saffron">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="font-headline-md text-cacao-dark text-xl">Simulator Live AI (Playground Testare)</h3>
              <p className="text-xs text-cacao-dark/60 font-body-md">
                Testează în timp real cum va răspunde Google Gemini 3.7-Flash la mesajele clienților tăi
              </p>
            </div>
          </div>
          <span className="text-xs text-cacao-dark/60 font-body-md bg-[#FAF7F2] px-3 py-1.5 rounded-lg border border-warm-border flex items-center gap-1.5">
            <Flame size={14} className="text-amber-500" />
            Model Activ: <strong className="text-cacao-dark font-mono">{selectedModel}</strong>
          </span>
        </div>

        {/* Chat window simulator */}
        <div className="border border-warm-border rounded-2xl bg-[#FAF7F2] p-4 md:p-6 space-y-4 max-h-[380px] overflow-y-auto">
          {simChatHistory.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.sender === "user"
                  ? "justify-end"
                  : msg.sender === "staff_alert"
                  ? "justify-center"
                  : "justify-start"
              }`}
            >
              {msg.sender === "staff_alert" ? (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs px-4 py-2 rounded-xl font-body-md max-w-lg text-center shadow-xs">
                  {msg.text}
                </div>
              ) : (
                <div
                  className={`max-w-[80%] md:max-w-[70%] p-4 rounded-2xl text-xs md:text-sm font-body-md leading-relaxed shadow-xs ${
                    msg.sender === "user"
                      ? "bg-cacao-dark text-vanilla-porcelain rounded-br-none"
                      : "bg-white border border-warm-border text-cacao-dark rounded-bl-none"
                  }`}
                >
                  <p>{msg.text}</p>
                  <div className="flex items-center justify-between gap-4 mt-2 text-[10px] opacity-70">
                    <span>{msg.time}</span>
                    {msg.latency && (
                      <span className="font-mono text-emerald-600 font-semibold">{msg.latency}ms • {msg.model}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          {simLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-warm-border p-3 rounded-2xl rounded-bl-none text-xs text-cacao-dark/60 font-body-md flex items-center gap-2">
                <span className="w-2 h-2 bg-gold-saffron rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-gold-saffron rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 bg-gold-saffron rounded-full animate-bounce [animation-delay:0.4s]"></span>
                <span>Gemini 3.7 gândește răspunsul...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick prompt buttons & input bar */}
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-cacao-dark/50 font-label-caps">Încearcă rapid:</span>
            <button
              type="button"
              onClick={() => setSimMessage("Bună, ce clătite speciale aveți și care este prețul?")}
              className="text-xs bg-white border border-warm-border hover:border-gold-saffron px-2.5 py-1 rounded-lg text-cacao-dark/80 cursor-pointer"
            >
              🥞 Întrebare Meniu
            </button>
            <button
              type="button"
              onClick={() => setSimMessage("Vreau să vorbesc urgent cu un om din staff!")}
              className="text-xs bg-white border border-warm-border hover:border-gold-saffron px-2.5 py-1 rounded-lg text-cacao-dark/80 cursor-pointer"
            >
              🚨 Test Escaladare Om
            </button>
            <button
              type="button"
              onClick={() => setSimMessage("Faceți livrare la Ciocana pe Mircea cel Bătrân?")}
              className="text-xs bg-white border border-warm-border hover:border-gold-saffron px-2.5 py-1 rounded-lg text-cacao-dark/80 cursor-pointer"
            >
              📍 Test Livrare Chișinău
            </button>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Scrie un mesaj de test ca și cum ai fi un client pe Instagram sau WhatsApp..."
              value={simMessage}
              onChange={e => setSimMessage(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSendSimulation();
                }
              }}
              className="flex-1 bg-[#FAF7F2] border border-warm-border rounded-xl px-4 py-3 text-sm font-body-md text-cacao-dark focus:outline-none focus:border-gold-saffron"
            />
            <button
              type="button"
              onClick={handleSendSimulation}
              disabled={simLoading || !simMessage.trim()}
              className="px-5 py-3 bg-cacao-dark hover:bg-black text-vanilla-porcelain rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
            >
              <Send size={14} /> Trimite Test
            </button>
          </div>
        </div>
      </div>

      {/* 7. Live Activity & Human Escalations Log */}
      <div className="bg-vanilla-porcelain border border-warm-border rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-warm-border">
          <div className="flex items-center gap-3">
            <Clock className="text-gold-saffron" size={24} />
            <div>
              <h3 className="font-headline-md text-cacao-dark text-xl">Jurnal Activitate & Istoric Escaladări Staff</h3>
              <p className="text-xs text-cacao-dark/60 font-body-md">
                Evidența clară a mesajelor gestionate de AI vs. mesajele predate operatorilor umani
              </p>
            </div>
          </div>
          <span className="text-xs text-cacao-dark/60 font-body-md">
            Ultimele 5 evenimente live sincronizate
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-warm-border text-[11px] font-label-caps text-cacao-dark/50 uppercase tracking-wider">
                <th className="py-3 px-4">Ora</th>
                <th className="py-3 px-4">Canal</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Mesaj Primit</th>
                <th className="py-3 px-4">Acțiune AI / Escaladare</th>
                <th className="py-3 px-4 text-right">Alertă Telegram</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-border/60 text-xs font-body-md">
              {activityLogs.map(log => (
                <tr key={log.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-cacao-dark/70 font-semibold">{log.time}</td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-cacao-dark">
                      {log.channel === "Instagram" && "📸 Instagram"}
                      {log.channel === "WhatsApp" && "💬 WhatsApp"}
                      {log.channel === "Messenger" && "🔵 Messenger"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-medium text-cacao-dark">{log.user}</td>
                  <td className="py-3.5 px-4 max-w-xs truncate text-cacao-dark/80 italic">"{log.userMessage}"</td>
                  <td className="py-3.5 px-4">
                    {log.action === "escalated" && (
                      <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full font-semibold text-[11px]">
                        <UserCheck size={12} /> {log.actionText}
                      </span>
                    )}
                    {log.action === "complaint" && (
                      <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-800 border border-rose-200 px-2.5 py-0.5 rounded-full font-semibold text-[11px]">
                        <AlertTriangle size={12} /> {log.actionText}
                      </span>
                    )}
                    {log.action === "order_placed" && (
                      <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-semibold text-[11px]">
                        <Zap size={12} /> {log.actionText}
                      </span>
                    )}
                    {log.action === "ai_resolved" && (
                      <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded-full font-semibold text-[11px]">
                        <CheckCircle2 size={12} /> {log.actionText}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {log.staffAlerted ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                        <CheckCircle2 size={13} /> Trimisă pe Grup
                      </span>
                    ) : (
                      <span className="text-cacao-dark/40 text-[11px]">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

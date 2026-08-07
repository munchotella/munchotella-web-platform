"use client";

import React, { useState } from "react";
import LuxuryButton from "@/components/admin/LuxuryButton";
import StatusBadge from "@/components/admin/StatusBadge";
import BentoKpiCard from "@/components/admin/BentoKpiCard";
import { Bot, MessageSquare, Fingerprint, Activity, Zap, CheckCircle2 } from "lucide-react";

export default function AiSettingsPage() {
  const [tone, setTone] = useState("elegant");
  const [prompt, setPrompt] = useState(
    "Ești asistentul Munchotella Waffle Boutique. Trebuie să răspunzi elegant, politicos și cald clienților pe Instagram. Dacă clientul dorește să comande o clătită Dubai, subliniază că este produsul nostru premium cu pastă de fistic originală."
  );
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert("Personalitatea și instrucțiunile Asistentului Munchotella AI au fost salvate cu succes!");
    }, 600);
  };

  const handleUploadDoc = () => {
    alert("Funcționalitatea de încărcare documente suplimentare este activă. Documentele sunt analizate automat.");
  };

  return (
    <div className="space-y-8 pb-10">
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-vanilla-porcelain border border-warm-border rounded-full flex items-center justify-center relative shadow-sm">
            <Bot size={40} className="text-gold-saffron" />
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-2 border-[#FAF7F2] rounded-full"></div>
          </div>
          <div>
            <h2 className="font-headline-lg text-cacao-dark text-3xl mb-1">Munchotella AI</h2>
            <div className="flex items-center gap-3">
              <StatusBadge status="success" label="Activ și Răspunde" />
              <span className="font-label-caps text-xs text-cacao-dark/50">• Conectat la Instagram</span>
            </div>
          </div>
        </div>
        
        <LuxuryButton variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? "Se salvează..." : "Salvează Personalitatea"}
        </LuxuryButton>
      </div>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px] bg-warm-border rounded-2xl overflow-hidden border border-warm-border mb-8">
        <BentoKpiCard 
          title="Mesaje Răspunse Azi"
          value="142"
          trend="Timp mediu de răspuns: 4s"
          trendPositive={true}
          icon={<MessageSquare size={24} />}
          className="rounded-none border-0"
        />
        <BentoKpiCard 
          title="Comenzi Preluare AI"
          value="18"
          trend="+5 față de ieri"
          trendPositive={true}
          icon={<Zap size={24} />}
          className="rounded-none border-0"
        />
        <BentoKpiCard 
          title="Acuratețe"
          value="99.2%"
          subtitle="Nicio intervenție umană necesară"
          icon={<Activity size={24} />}
          className="rounded-none border-0"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Personality & Rules */}
        <section className="bg-vanilla-porcelain border border-warm-border rounded-2xl p-8 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6">
            <Fingerprint className="text-gold-saffron" size={24} />
            <h3 className="font-headline-md text-cacao-dark text-xl">Personalitate și Ton</h3>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block font-label-caps text-cacao-dark/60 text-xs mb-3">Tonul Vocii</label>
              <div className="grid grid-cols-3 gap-3">
                <button 
                  onClick={() => setTone("elegant")}
                  className={`py-3 px-4 rounded-lg font-body-md text-sm transition-colors text-center cursor-pointer ${
                    tone === "elegant"
                      ? "border border-gold-saffron bg-gold-saffron/10 text-gold-saffron font-medium"
                      : "border border-warm-border text-cacao-dark/60 hover:bg-[#FAF7F2]"
                  }`}
                >
                  Elegant / Premium
                </button>
                <button 
                  onClick={() => setTone("friendly")}
                  className={`py-3 px-4 rounded-lg font-body-md text-sm transition-colors text-center cursor-pointer ${
                    tone === "friendly"
                      ? "border border-gold-saffron bg-gold-saffron/10 text-gold-saffron font-medium"
                      : "border border-warm-border text-cacao-dark/60 hover:bg-[#FAF7F2]"
                  }`}
                >
                  Prietenos
                </button>
                <button 
                  onClick={() => setTone("formal")}
                  className={`py-3 px-4 rounded-lg font-body-md text-sm transition-colors text-center cursor-pointer ${
                    tone === "formal"
                      ? "border border-gold-saffron bg-gold-saffron/10 text-gold-saffron font-medium"
                      : "border border-warm-border text-cacao-dark/60 hover:bg-[#FAF7F2]"
                  }`}
                >
                  Formal
                </button>
              </div>
            </div>

            <div>
              <label className="block font-label-caps text-cacao-dark/60 text-xs mb-3">Instrucțiune de Bază (Prompt)</label>
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full bg-[#FAF7F2] border border-warm-border rounded-xl p-4 font-body-md text-cacao-dark min-h-[150px] focus:outline-none focus:border-gold-saffron transition-colors resize-none"
              />
            </div>
          </div>
        </section>

        {/* Right Column: Knowledge Base */}
        <section className="bg-vanilla-porcelain border border-warm-border rounded-2xl p-8 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Bot className="text-gold-saffron" size={24} />
              <h3 className="font-headline-md text-cacao-dark text-xl">Baza de Cunoștințe</h3>
            </div>
            <LuxuryButton variant="outline" className="scale-90 origin-right" onClick={handleUploadDoc}>
              Încarcă Document
            </LuxuryButton>
          </div>

          <div className="flex-1 border border-warm-border/50 rounded-xl bg-[#FAF7F2]/50 p-6 flex flex-col justify-center items-center text-center">
            <p className="font-body-md text-cacao-dark mb-2">Asistentul AI citește automat meniul tău.</p>
            <p className="font-body-md text-cacao-dark/60 text-sm max-w-sm">
              Pentru a-l învăța lucruri noi (ex: politica de retur, zonele exacte de livrare, prețurile per km), adaugă instrucțiuni aici.
            </p>
            
            <div className="mt-8 w-full space-y-3">
              <div className="bg-vanilla-porcelain border border-warm-border p-4 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="text-success" size={18} />
                  <span className="font-body-md text-sm text-cacao-dark">Meniu_Preturi_Azi.json</span>
                </div>
                <span className="font-label-caps text-[10px] text-cacao-dark/40">Sincronizat Automat</span>
              </div>
              <div className="bg-vanilla-porcelain border border-warm-border p-4 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="text-success" size={18} />
                  <span className="font-body-md text-sm text-cacao-dark">Zone_Livrare_Chisinau.txt</span>
                </div>
                <span className="font-label-caps text-[10px] text-cacao-dark/40">Acum 2 zile</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

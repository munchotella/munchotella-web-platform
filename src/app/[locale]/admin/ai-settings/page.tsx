"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Bot, Save, MessageSquare, AlertCircle } from "lucide-react";

export default function AISettingsPage() {
  const [saving, setSaving] = useState(false);
  
  const handleSave = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)] tracking-tight">Setări AI (Instagram)</h1>
          <p className="text-[var(--foreground)]/60 mt-1">Configurează personalitatea și limitele asistentului virtual.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full font-medium bg-[var(--primary)] text-[var(--primary-foreground)] shadow-lg hover:bg-[var(--color-chocolate)] transition-all disabled:opacity-70"
        >
          {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
          Salvează Modificările
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - System Prompt */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[var(--card)] p-6 rounded-2xl border border-[var(--primary)]/10 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-[var(--foreground)]">System Prompt (Personalitate)</h3>
            </div>
            
            <textarea 
              className="w-full h-64 p-4 bg-[var(--background)] border border-[var(--primary)]/20 rounded-xl resize-none outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] text-[var(--foreground)] leading-relaxed"
              defaultValue="Ești asistentul virtual al cafenelei Munchotella. Tonul tău trebuie să fie prietenos, elegant și mereu de ajutor. Folosești emoji-uri (🍫, ☕, ✨) dar cu măsură. Când preiei o comandă, verifică întotdeauna disponibilitatea produselor folosind funcțiile tale. Dacă ești întrebat lucruri care nu țin de cafenea, refuză politicos. Dacă utilizatorul este frustrat, folosește funcția de escaladare către Telegram."
            />
            <p className="text-sm text-[var(--foreground)]/50 mt-3 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              Acest text definește comportamentul de bază al AI-ului (folosit de OpenAI/Gemini).
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[var(--card)] p-6 rounded-2xl border border-[var(--primary)]/10 shadow-sm"
          >
            <h3 className="text-lg font-bold text-[var(--foreground)] mb-4">Recomandarea Zilei (Injectată dinamic)</h3>
            <p className="text-[var(--foreground)]/60 text-sm mb-4">Ce produs vrei ca AI-ul să împingă în față astăzi clienților indeciși?</p>
            <select className="w-full p-3 bg-[var(--background)] border border-[var(--primary)]/20 rounded-xl outline-none focus:border-[var(--primary)] text-[var(--foreground)]">
              <option>Niciuna (Lasă AI-ul să decidă)</option>
              <option>Croissant cu Fistic (Promo)</option>
              <option>Iced Caramel Macchiato</option>
              <option>Tiramisu</option>
            </select>
          </motion.div>
        </div>

        {/* Right Column - Rules & Limits */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[var(--card)] p-6 rounded-2xl border border-[var(--primary)]/10 shadow-sm"
          >
            <h3 className="text-lg font-bold text-[var(--foreground)] mb-6">Reguli de Vânzare</h3>
            
            <div className="space-y-5">
              <div>
                <label className="flex items-center justify-between text-sm font-bold text-[var(--foreground)] mb-2">
                  <span>Permite Oferirea de Discounturi?</span>
                  <input type="checkbox" className="toggle-checkbox" defaultChecked />
                </label>
                <p className="text-xs text-[var(--foreground)]/50">Dacă e activat, AI-ul poate oferi un discount mic clienților fideli sau supărați.</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-[var(--foreground)] mb-2">Discount Maxim Permis (%)</label>
                <input 
                  type="number" 
                  defaultValue={15}
                  className="w-full p-3 bg-[var(--background)] border border-[var(--primary)]/20 rounded-xl outline-none focus:border-[var(--primary)] text-[var(--foreground)]"
                />
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[var(--primary)]/5 p-6 rounded-2xl border border-[var(--primary)]/20 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-[var(--primary)]" />
              <h3 className="text-lg font-bold text-[var(--foreground)]">Testare Bot</h3>
            </div>
            <p className="text-sm text-[var(--foreground)]/70 mb-4">Apasă aici pentru a simula o conversație de test înainte de a pune setările live pe Instagram.</p>
            <button className="w-full bg-white text-[var(--primary)] border border-[var(--primary)]/20 py-2.5 rounded-xl font-bold hover:border-[var(--primary)] transition-colors">
              Deschide Simulator
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

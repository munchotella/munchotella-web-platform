"use client";

import React, { useState } from "react";
import { User, Lock, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import LuxuryButton from "./LuxuryButton";
import { API_URL } from "@/lib/adminApi";

export default function AdminLoginForm({ onSuccess }: { onSuccess?: () => void }) {
  const [phoneOrEmail, setPhoneOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    let normalized = phoneOrEmail.trim();
    if (normalized.startsWith('0') && normalized.length === 9) {
      normalized = '+373' + normalized.substring(1);
    }

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        credentials: "include",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalized, password }),
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Credentiale incorecte.");
      }

      if (data.data?.role !== "admin") {
        throw new Error("Acces refuzat: Contul tau nu are rol de Administrator.");
      }

      // SEC-HIGH-03 FIX (VUL-001): NU stocăm JWT-ul în localStorage.
      // Tokenul de acces este exclusiv în HttpOnly Cookie (setat de backend pe /api/auth/login).
      // Orice token în localStorage poate fi furat prin atacuri XSS — complet eliminat.
      // Stocăm DOAR datele de profil (fără secret) pentru hidratarea UI.
      localStorage.setItem("munchotella_user", JSON.stringify(data.data));

      if (onSuccess) {
        onSuccess();
      } else {
        window.location.reload();
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Nu s-a putut efectua autentificarea.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 bg-vanilla-porcelain border border-warm-border rounded-3xl p-8 shadow-xl relative overflow-hidden">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-gold-saffron/10 border border-gold-saffron/30 flex items-center justify-center mb-4 text-gold-saffron">
          <ShieldCheck size={32} />
        </div>
        <h2 className="font-headline-lg text-cacao-dark text-2xl mb-1">Panou de Administrare</h2>
        <p className="font-body-md text-cacao-dark/60 text-sm">
          Autentifica-te cu contul tau de administrator pentru acces.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl text-error text-sm text-center font-medium">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleLoginSubmit} className="space-y-5">
        <div>
          <label className="block font-label-caps text-cacao-dark/60 text-xs mb-2">Email sau Numar de Telefon</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-cacao-dark/40" size={18} />
            <input
              type="text"
              required
              value={phoneOrEmail}
              onChange={(e) => setPhoneOrEmail(e.target.value)}
              placeholder="ex: +37360912289 sau email"
              className="w-full pl-12 pr-4 py-3.5 bg-[#FAF7F2] border border-warm-border rounded-xl font-body-md text-cacao-dark focus:outline-none focus:border-gold-saffron transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block font-label-caps text-cacao-dark/60 text-xs mb-2">Parola Administrator</label>
          <div className="relative font-body-md text-cacao-dark">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-cacao-dark/40" size={18} />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Parola ta"
              className="w-full pl-12 pr-4 py-3.5 bg-[#FAF7F2] border border-warm-border rounded-xl font-body-md text-cacao-dark focus:outline-none focus:border-gold-saffron transition-colors"
            />
          </div>
        </div>

        <div className="pt-2">
          <LuxuryButton
            variant="primary"
            className="w-full py-4 text-base flex justify-center items-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 size={18} className="animate-spin" /> Conectare...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Autentificare Admin <ArrowRight size={18} />
              </span>
            )}
          </LuxuryButton>
        </div>
      </form>
    </div>
  );
}

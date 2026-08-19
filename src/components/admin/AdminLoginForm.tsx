"use client";

import React, { useState } from "react";
import { User, Lock, ArrowRight, Loader2, ShieldCheck, Phone, Mail, Eye, EyeOff } from "lucide-react";
import LuxuryButton from "./LuxuryButton";
import { API_URL } from "@/lib/adminApi";
import CountrySelector from "@/components/ui/CountrySelector";
import { defaultCountry, Country } from "@/data/countries";

interface AdminLoginFormProps {
  onSuccess?: () => void;
}

export default function AdminLoginForm({ onSuccess }: AdminLoginFormProps) {
  const [loginMethod, setLoginMethod] = useState<"phone" | "email">("phone");
  const [phone, setPhone] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<Country>(defaultCountry);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const normalizePhone = (raw: string, country: Country): string => {
    let clean = raw.replace(/[^0-9+]/g, "");
    if (clean.startsWith("+")) return clean;
    if (clean.startsWith("00")) return "+" + clean.substring(2);
    if (clean.startsWith("0")) {
      clean = clean.substring(1);
    }
    const dial = country.dialCode.startsWith("+") ? country.dialCode : `+${country.dialCode}`;
    return `${dial}${clean}`;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    let identifier = "";
    if (loginMethod === "phone") {
      if (!phone.trim()) {
        setErrorMsg("Te rugăm să introduci numărul de telefon.");
        setLoading(false);
        return;
      }
      identifier = normalizePhone(phone.trim(), selectedCountry);
    } else {
      if (!email.trim()) {
        setErrorMsg("Te rugăm să introduci adresa de email.");
        setLoading(false);
        return;
      }
      identifier = email.trim().toLowerCase();
    }

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        credentials: "include",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          phone: identifier,
          email: loginMethod === "email" ? identifier : undefined,
          password 
        }),
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Credențiale incorecte. Verifică datele introduse.");
      }

      if (data.data?.role !== "admin") {
        throw new Error("Acces refuzat: Contul tău nu are rol de Administrator.");
      }

      // SEC-HIGH-03 FIX (VUL-001): NU stocăm JWT-ul în localStorage.
      // Tokenul de acces este exclusiv în HttpOnly Cookie (setat de backend pe /api/auth/login).
      // Stocăm DOAR datele de profil pentru hidratarea UI.
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
    <div className="max-w-md mx-auto my-12 bg-vanilla-porcelain border border-warm-border rounded-3xl p-8 shadow-xl relative overflow-visible">
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gold-saffron/10 border border-gold-saffron/30 flex items-center justify-center mb-4 text-gold-saffron shadow-sm">
          <ShieldCheck size={32} />
        </div>
        <h2 className="font-headline-lg text-cacao-dark text-2xl mb-1">Panou de Administrare</h2>
        <p className="font-body-md text-cacao-dark/60 text-sm">
          Autentifică-te cu contul tău de administrator pentru acces.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl text-error text-sm text-center font-medium">
          {errorMsg}
        </div>
      )}

      {/* Toggle Tabs: Phone vs Email */}
      <div className="flex bg-[#FAF7F2] border border-warm-border p-1 rounded-xl gap-1 mb-6">
        <button
          type="button"
          onClick={() => {
            setLoginMethod("phone");
            setErrorMsg("");
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold font-body-md transition-all cursor-pointer ${
            loginMethod === "phone"
              ? "bg-white text-cacao-dark shadow-sm border border-warm-border/60"
              : "text-cacao-dark/60 hover:text-cacao-dark"
          }`}
        >
          <Phone size={14} className={loginMethod === "phone" ? "text-gold-saffron" : ""} />
          <span>Număr de Telefon</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setLoginMethod("email");
            setErrorMsg("");
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold font-body-md transition-all cursor-pointer ${
            loginMethod === "email"
              ? "bg-white text-cacao-dark shadow-sm border border-warm-border/60"
              : "text-cacao-dark/60 hover:text-cacao-dark"
          }`}
        >
          <Mail size={14} className={loginMethod === "email" ? "text-gold-saffron" : ""} />
          <span>Email</span>
        </button>
      </div>

      <form onSubmit={handleLoginSubmit} className="space-y-5">
        {/* Phone Input with Country Selector (Exact ca pe website) */}
        {loginMethod === "phone" ? (
          <div>
            <label className="block font-label-caps text-cacao-dark/60 text-xs mb-2">Număr de Telefon Admin</label>
            <div className="relative flex items-center bg-[#FAF7F2] border border-warm-border rounded-xl focus-within:border-gold-saffron focus-within:ring-2 focus-within:ring-gold-saffron/20 transition-all">
              <CountrySelector
                selectedCountry={selectedCountry}
                onSelect={setSelectedCountry}
              />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="60 000 000"
                className="w-full pl-3 pr-4 py-3.5 bg-transparent border-none font-body-md text-cacao-dark text-sm outline-none placeholder:text-cacao-dark/40"
              />
            </div>
            <p className="text-[11px] text-cacao-dark/50 font-body-md mt-1.5 pl-1">
              Codul țării ({selectedCountry.dialCode}) este inclus și formatat automat.
            </p>
          </div>
        ) : (
          /* Email Input */
          <div>
            <label className="block font-label-caps text-cacao-dark/60 text-xs mb-2">Email Administrator</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-cacao-dark/40" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@munchotella.md"
                className="w-full pl-12 pr-4 py-3.5 bg-[#FAF7F2] border border-warm-border rounded-xl font-body-md text-cacao-dark text-sm focus:outline-none focus:border-gold-saffron focus:ring-2 focus:ring-gold-saffron/20 transition-all"
              />
            </div>
          </div>
        )}

        {/* Password Input */}
        <div>
          <label className="block font-label-caps text-cacao-dark/60 text-xs mb-2">Parolă Administrator</label>
          <div className="relative font-body-md text-cacao-dark">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-cacao-dark/40" size={18} />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Parola contului"
              className="w-full pl-12 pr-11 py-3.5 bg-[#FAF7F2] border border-warm-border rounded-xl font-body-md text-cacao-dark text-sm focus:outline-none focus:border-gold-saffron focus:ring-2 focus:ring-gold-saffron/20 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-cacao-dark/40 hover:text-cacao-dark cursor-pointer transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="pt-2">
          <LuxuryButton
            variant="primary"
            className="w-full py-4 text-base flex justify-center items-center gap-2 shadow-md cursor-pointer"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 size={18} className="animate-spin text-gold-saffron" /> Conectare în curs...
              </span>
            ) : (
              <span className="flex items-center gap-2 font-semibold">
                Autentificare Admin <ArrowRight size={18} />
              </span>
            )}
          </LuxuryButton>
        </div>
      </form>
    </div>
  );
}

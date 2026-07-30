"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User as UserIcon, Phone, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  
  // Form states
  const [loginId, setLoginId] = useState(""); // Folosit pentru Login (Email sau Telefon) și ca Email pentru Register
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    
    // Normalizare telefon pentru compatibilitate cu aplicația mobilă (+373)
    let normalizedLoginId = loginId.trim();
    if (normalizedLoginId.startsWith('0') && normalizedLoginId.length === 9) {
      normalizedLoginId = '+373' + normalizedLoginId.substring(1);
    }
    
    try {
      if (isLogin) {
        // Logica de Login
        const res = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: normalizedLoginId, password })
        });
        const data = await res.json();
        
        if (!data.success) {
          throw new Error(data.message || "Eroare la autentificare");
        }
        
        login(data.data, data.token);
      } else {
        // Logica de Register
        let normalizedRegisterPhone = phone.trim();
        if (normalizedRegisterPhone.startsWith('0') && normalizedRegisterPhone.length === 9) {
          normalizedRegisterPhone = '+373' + normalizedRegisterPhone.substring(1);
        }
        
        const res = await fetch(`${API_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, phone: normalizedRegisterPhone, email: normalizedLoginId, password })
        });
        const data = await res.json();
        
        if (!data.success) {
          throw new Error(data.message || "Eroare la înregistrare");
        }
        
        login(data.data, data.token);
      }
      
      // Reset form
      setLoginId("");
      setPassword("");
      setName("");
      setPhone("");
      setIsLogin(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Ceva nu a funcționat. Încearcă din nou.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    
    let normalizedLoginId = loginId.trim();
    if (normalizedLoginId.startsWith('0') && normalizedLoginId.length === 9) {
      normalizedLoginId = '+373' + normalizedLoginId.substring(1);
    }
    
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalizedLoginId, method: "email" })
      });
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.message || "Eroare la recuperarea parolei");
      }
      
      setSuccessMsg(data.message || "Parola temporară a fost trimisă pe email!");
      // Optionally transition back to login after some time
      setTimeout(() => {
        setIsForgotPassword(false);
        setSuccessMsg("");
      }, 5000);
      
    } catch (err: any) {
      setErrorMsg(err.message || "Nu am putut iniția recuperarea parolei.");
    } finally {
      setLoading(false);
    }
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const modalVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: "spring", bounce: 0.3, duration: 0.6 }
    },
    exit: { 
      opacity: 0, 
      y: 20, 
      scale: 0.95,
      transition: { duration: 0.3 }
    }
  };

  return (
    <AnimatePresence>
      {isAuthModalOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1A120B]/80 backdrop-blur-md"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={() => setIsAuthModalOpen(false)}
        >
          <motion.div
            className="w-full max-w-[450px] bg-[#FFFCF6] rounded-[24px] shadow-2xl overflow-hidden relative flex flex-col"
            variants={modalVariants as any}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute top-5 right-5 text-[#1A120B]/40 hover:text-[#1A120B] hover:bg-[#1A120B]/5 p-2 rounded-full transition-colors z-10"
            >
              <X size={20} />
            </button>

            {/* Header / Brand Area */}
            <div className="bg-[#1A120B] p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
              <h2 className="text-3xl font-serif text-[#FDF9F1] relative z-10">
                {isForgotPassword ? "Recuperare Parolă" : (isLogin ? "Bine ai revenit" : "Devino Membru")}
              </h2>
              <p className="text-[#D4A853] text-sm mt-2 font-medium tracking-wide relative z-10">
                {isForgotPassword ? "Introdu telefonul pentru a primi parola pe email" : (isLogin ? "Accesează-ți contul Munchotella" : "Alătură-te comunității noastre dulci")}
              </p>
            </div>

            {/* Form Area */}
            <div className="p-8 pb-10">
              {errorMsg && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="mb-6 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 text-center"
                >
                  {errorMsg}
                </motion.div>
              )}
              {successMsg && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="mb-6 p-3 bg-[#E6F4EA] text-[#137333] rounded-xl text-sm font-medium border border-[#CEEAD6] text-center"
                >
                  {successMsg}
                </motion.div>
              )}
              
              {isForgotPassword ? (
                <form onSubmit={handleForgotPassword} className="flex flex-col space-y-4">
                  <div className="relative group focus-within:text-[#D4A853]">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1A120B]/40 group-focus-within:text-[#D4A853] transition-colors" size={18} />
                    <input 
                      type="text" 
                      placeholder="Număr de telefon" 
                      required
                      value={loginId}
                      onChange={(e) => setLoginId(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-white border border-[#E8E2D9] rounded-xl text-[15px] focus:outline-none focus:border-[#D4A853] focus:ring-4 focus:ring-[#D4A853]/20 transition-all duration-300"
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full mt-4 relative overflow-hidden bg-[#1A120B] text-white py-4 rounded-xl font-bold flex items-center justify-center space-x-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed group"
                  >
                    <div className="relative z-10 flex items-center justify-center space-x-2 group-hover:text-[#D4A853] transition-colors">
                      {loading ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                          <Loader2 size={20} />
                        </motion.div>
                      ) : (
                        <>
                          <span>Trimite Parola</span>
                          <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </div>
                  </button>
                  <div className="text-center mt-4">
                    <button 
                      type="button" 
                      onClick={() => { setIsForgotPassword(false); setErrorMsg(""); setSuccessMsg(""); }}
                      className="text-[13px] text-[#1A120B]/60 hover:text-[#D4A853] font-medium transition-colors"
                    >
                      Înapoi la Autentificare
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
                  
                  <AnimatePresence mode="popLayout">
                    {!isLogin && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex flex-col space-y-4 overflow-hidden"
                      >
                        <div className="relative">
                          <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1A120B]/40" size={18} />
                          <input 
                            type="text" 
                            placeholder="Nume complet" 
                            required={!isLogin}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full pl-11 pr-4 py-3.5 bg-white border border-[#E8E2D9] rounded-xl text-[15px] focus:outline-none focus:border-[#D4A853] focus:ring-4 focus:ring-[#D4A853]/20 transition-all duration-300 group"
                          />
                        </div>
                        
                        <div className="relative group focus-within:text-[#D4A853]">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1A120B]/40 group-focus-within:text-[#D4A853] transition-colors" size={18} />
                          <input 
                            type="tel" 
                            placeholder="Număr de telefon" 
                            required={!isLogin}
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full pl-11 pr-4 py-3.5 bg-white border border-[#E8E2D9] rounded-xl text-[15px] focus:outline-none focus:border-[#D4A853] focus:ring-4 focus:ring-[#D4A853]/20 transition-all duration-300"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="relative group focus-within:text-[#D4A853]">
                    {isLogin ? (
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1A120B]/40 group-focus-within:text-[#D4A853] transition-colors" size={18} />
                    ) : (
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1A120B]/40 group-focus-within:text-[#D4A853] transition-colors" size={18} />
                    )}
                    <input 
                      type={isLogin ? "text" : "email"} 
                      placeholder={isLogin ? "Email sau Număr de telefon" : "Adresa de email"} 
                      required
                      value={loginId}
                      onChange={(e) => setLoginId(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-white border border-[#E8E2D9] rounded-xl text-[15px] focus:outline-none focus:border-[#D4A853] focus:ring-4 focus:ring-[#D4A853]/20 transition-all duration-300"
                    />
                  </div>

                  <div className="relative group focus-within:text-[#D4A853]">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1A120B]/40 group-focus-within:text-[#D4A853] transition-colors" size={18} />
                    <input 
                      type="password" 
                      placeholder="Parola" 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-white border border-[#E8E2D9] rounded-xl text-[15px] focus:outline-none focus:border-[#D4A853] focus:ring-4 focus:ring-[#D4A853]/20 transition-all duration-300"
                    />
                  </div>

                  {isLogin && (
                    <div className="text-right">
                      <button 
                        type="button" 
                        onClick={() => { setIsForgotPassword(true); setErrorMsg(""); setSuccessMsg(""); }}
                        className="text-[13px] text-[#1A120B]/60 hover:text-[#D4A853] font-medium transition-colors"
                      >
                        Ai uitat parola?
                      </button>
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full mt-4 relative overflow-hidden bg-[#1A120B] text-white py-4 rounded-xl font-bold flex items-center justify-center space-x-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed group"
                  >
                    <motion.div 
                      className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
                      animate={{
                        translateX: ["-100%", "200%"],
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 2.5,
                        ease: "linear",
                        repeatDelay: 1
                      }}
                    />
                    <div className="relative z-10 flex items-center justify-center space-x-2 group-hover:text-[#D4A853] transition-colors">
                      {loading ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                          <Loader2 size={20} />
                        </motion.div>
                      ) : (
                        <>
                          <span>{isLogin ? "Autentificare" : "Creează cont"}</span>
                          <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </div>
                  </button>
                </form>

                <div className="mt-8 text-center">
                  <p className="text-[14px] text-[#1A120B]/60">
                    {isLogin ? "Nu ai un cont încă?" : "Ai deja un cont?"}
                    <button 
                      type="button"
                      onClick={() => { setIsLogin(!isLogin); setErrorMsg(""); setSuccessMsg(""); setIsForgotPassword(false); }}
                      className="ml-2 text-[#D4A853] font-bold hover:underline"
                    >
                      {isLogin ? "Creează unul" : "Autentifică-te"}
                    </button>
                  </p>
                </div>
              </>
            )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

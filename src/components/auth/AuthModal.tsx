"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User as UserIcon, Phone, ArrowRight, Loader2, Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import CountrySelector from "@/components/ui/CountrySelector";
import { defaultCountry, Country } from "@/data/countries";
import { auth } from "@/lib/firebase";
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  FacebookAuthProvider, 
  OAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from "firebase/auth";

// SVG Icons for Social Providers
function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg className="w-5 h-5 fill-[#1877F2]" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.85c.66-.8 1.11-1.92.99-3.04-.96.04-2.12.64-2.8 1.44-.61.71-1.14 1.86-1 2.97 1.08.08 2.16-.57 2.81-1.37z"/>
    </svg>
  );
}

type OnboardingStep = "AUTH" | "ONBOARDING_NAME" | "ONBOARDING_TERMS";

declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}

export default function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, login, user, token } = useAuth();
  
  const [modalStep, setModalStep] = useState<OnboardingStep>("AUTH");
  const [isLogin, setIsLogin] = useState(true);
  const [loginMethod, setLoginMethod] = useState<"phone" | "email">("phone");
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState<"phone" | "method" | "otp" | "success">("phone");
  const [resetMethod, setResetMethod] = useState<"email" | "sms">("email");
  const [otpCode, setOtpCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [tempPasswordDisplay, setTempPasswordDisplay] = useState("");
  const [forgotMethod, setForgotMethod] = useState<"phone" | "email">("phone");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Auth Form states
  const [loginEmail, setLoginEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<Country>(defaultCountry);

  // Onboarding Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  if (!isAuthModalOpen) return null;

  const API_URL = "https://munchotella-api.onrender.com/api";


  const setupRecaptcha = () => {
    try {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
      });
    } catch (e) {
      console.error("Recaptcha setup error:", e);
    }
  };

  const checkAndTriggerOnboarding = (userData: any, authToken: string) => {
    const isComplete = userData.isTermsAccepted && userData.name && userData.name.trim().length > 0;
    if (!isComplete) {
      if (userData.name) {
        const parts = userData.name.split(" ");
        setFirstName(parts[0] || "");
        setLastName(parts.slice(1).join(" ") || "");
      }
      setModalStep("ONBOARDING_NAME");
    } else {
      setIsAuthModalOpen(false);
    }
  };

  const handleSocialLogin = async (providerName: "google" | "facebook" | "apple") => {
    setSocialLoading(true);
    setErrorMsg("");
    try {
      let provider;
      if (providerName === "google") {
        provider = new GoogleAuthProvider();
      } else if (providerName === "facebook") {
        provider = new FacebookAuthProvider();
      } else {
        provider = new OAuthProvider("apple.com");
      }

      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      const res = await fetch(`${API_URL}/auth/social-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, provider: providerName })
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || `Eroare la conectarea cu ${providerName}`);
      }

      login(data.data, data.token);
      checkAndTriggerOnboarding(data.data, data.token);

    } catch (err: any) {
      console.error(`Social Auth Error (${providerName}):`, err);
      if (err.code !== "auth/popup-closed-by-user") {
        setErrorMsg(err.message || "Conectarea socială a eșuat.");
      }
    } finally {
      setSocialLoading(false);
    }
  };

  const normalizePhoneNumber = (raw: string, country: Country) => {
    const cleaned = raw.trim();
    if (cleaned.startsWith('+')) {
      return cleaned;
    }
    if (cleaned.startsWith('0')) {
      return country.dialCode + cleaned.substring(1);
    }
    return country.dialCode + cleaned;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    
    try {
      if (isLogin) {
        let identifier = "";
        if (loginMethod === "phone") {
          if (!phone.trim()) {
            throw new Error("Te rugăm să introduci numărul de telefon.");
          }
          identifier = normalizePhoneNumber(phone, selectedCountry);
        } else {
          if (!loginEmail.trim()) {
            throw new Error("Te rugăm să introduci adresa de email.");
          }
          identifier = loginEmail.trim().toLowerCase();
        }

        const res = await fetch(`${API_URL}/auth/login`, {
          credentials: "include",
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: identifier, password })
        });
        const data = await res.json();
        
        if (!data.success) {
          throw new Error(data.message || "Eroare la autentificare");
        }
        
        login(data.data, data.token);
        checkAndTriggerOnboarding(data.data, data.token);
      } else {
        // REGISTER
        if (!name.trim()) {
          throw new Error("Te rugăm să introduci numele complet.");
        }
        if (!phone.trim()) {
          throw new Error("Te rugăm să introduci numărul de telefon.");
        }
        if (!loginEmail.trim()) {
          throw new Error("Te rugăm să introduci adresa de email.");
        }

        const normalizedRegisterPhone = normalizePhoneNumber(phone, selectedCountry);
        
        const res = await fetch(`${API_URL}/auth/register`, {
          credentials: "include",
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            name: name.trim(), 
            phone: normalizedRegisterPhone, 
            email: loginEmail.trim().toLowerCase(), 
            password 
          })
        });
        const data = await res.json();
        
        if (!data.success) {
          throw new Error(data.message || "Eroare la înregistrare");
        }
        
        login(data.data, data.token);
        checkAndTriggerOnboarding(data.data, data.token);
      }
      
      setLoginEmail("");
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

  const handleForgotPhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setErrorMsg("Te rugăm să introduci numărul de telefon.");
      return;
    }
    setForgotStep("method");
  };

  const handleForgotMethodSubmit = async () => {
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    const identifier = normalizePhoneNumber(phone, selectedCountry);

    if (resetMethod === "email") {
      try {
        const res = await fetch(`${API_URL}/auth/forgot-password`, {
          credentials: "include",
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: identifier, method: "email" })
        });
        const data = await res.json();
        
        if (!data.success) {
          throw new Error(data.message || "Eroare la recuperarea parolei");
        }
        
        setSuccessMsg(data.message || "Parola temporară a fost trimisă pe email!");
        setForgotStep("success");
      } catch (err: any) {
        setErrorMsg(err.message || "Nu am putut iniția recuperarea parolei.");
      } finally {
        setLoading(false);
      }
    } else {
      // SMS flow
      try {
        setupRecaptcha();
        const confirmation = await signInWithPhoneNumber(auth, identifier, window.recaptchaVerifier);
        setConfirmationResult(confirmation);
        setForgotStep("otp");
      } catch (error: any) {
        console.error("SMS Error", error);
        setErrorMsg(error.message || "Eroare la trimiterea SMS-ului. Verifică numărul și încearcă din nou.");
        // reset recaptcha
        if (window.recaptchaVerifier) {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = null;
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6 || !confirmationResult) {
      setErrorMsg("Introdu codul din 6 cifre.");
      return;
    }
    setLoading(true);
    setErrorMsg("");

    try {
      const userCredential = await confirmationResult.confirm(otpCode);
      const idToken = await userCredential.user.getIdToken();

      const res = await fetch(`${API_URL}/auth/reset-password-firebase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: idToken })
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Eroare la resetarea parolei.");
      }

      if (data.data && data.data.tempPassword) {
        setTempPasswordDisplay(data.data.tempPassword);
        setForgotStep("success");
      } else {
        setSuccessMsg("Parola a fost resetată cu succes!");
        setForgotStep("success");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Cod incorect sau expirat.");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteNameStep = () => {
    if (!firstName.trim() || !lastName.trim()) {
      setErrorMsg("Te rugăm să completezi prenumele și numele.");
      return;
    }
    setErrorMsg("");
    setModalStep("ONBOARDING_TERMS");
  };

  const handleCompleteTermsStep = async () => {
    if (!acceptedTerms) {
      setErrorMsg("Trebuie să accepți Termenii și Condițiile pentru a continua.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      const res = await fetch(`${API_URL}/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: fullName,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          isTermsAccepted: true
        })
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || "Eroare la salvarea profilului.");
      }

      setIsAuthModalOpen(false);
      setModalStep("AUTH");
    } catch (err: any) {
      setErrorMsg(err.message || "Nu s-a putut finaliza înregistrarea.");
    } finally {
      setLoading(false);
    }
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const modalVariants: any = {
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={() => setIsAuthModalOpen(false)}
        >
          <motion.div
            className="relative w-full max-w-md bg-[#FAF8F5] rounded-3xl shadow-2xl border border-[#E8E2D9] overflow-visible"
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Banner */}
            <div className="relative bg-[#1A120B] p-8 text-center rounded-t-3xl overflow-hidden">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#D4A853_1px,transparent_1px)] [background-size:16px_16px]"></div>
              
              <button 
                onClick={() => setIsAuthModalOpen(false)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 hover:text-[#D4A853] transition-colors z-20 cursor-pointer"
              >
                <X size={18} />
              </button>

              <h2 className="font-serif text-3xl text-white font-bold tracking-tight relative z-10">
                {modalStep === "ONBOARDING_NAME" 
                  ? "Cum te numești?" 
                  : modalStep === "ONBOARDING_TERMS" 
                  ? "Termeni & Condiții" 
                  : isForgotPassword 
                  ? "Recuperare Parolă" 
                  : (isLogin ? "Bine ai revenit" : "Devino Membru")}
              </h2>
              <p className="text-[#D4A853] text-sm mt-2 font-medium tracking-wide relative z-10">
                {modalStep === "ONBOARDING_NAME"
                  ? "Spune-ne numele tău pentru comenzi"
                  : modalStep === "ONBOARDING_TERMS"
                  ? "Revizuiește și acceptă politica Munchotella"
                  : isForgotPassword 
                  ? (forgotMethod === "phone" ? "Introdu telefonul pentru a primi parola temporară" : "Introdu adresa de email pentru recuperare")
                  : (isLogin ? "Accesează-ți contul Munchotella" : "Alătură-te comunității noastre dulci")}
              </p>
            </div>

            {/* Form Area */}
            <div className="p-7 sm:p-8 pb-10">
              {errorMsg && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="mb-5 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 text-center"
                >
                  {errorMsg}
                </motion.div>
              )}
              {successMsg && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="mb-5 p-3 bg-[#E6F4EA] text-[#137333] rounded-xl text-sm font-medium border border-[#CEEAD6] text-center"
                >
                  {successMsg}
                </motion.div>
              )}

              {/* STEP 1: ONBOARDING NAME */}
              {modalStep === "ONBOARDING_NAME" && (
                <div className="flex flex-col space-y-4">
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1A120B]/40" size={18} />
                    <input 
                      type="text" 
                      placeholder="Prenume (ex: Maria)" 
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-white border border-[#E8E2D9] rounded-xl text-[15px] focus:outline-none focus:border-[#D4A853] focus:ring-4 focus:ring-[#D4A853]/20 transition-all duration-300"
                    />
                  </div>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1A120B]/40" size={18} />
                    <input 
                      type="text" 
                      placeholder="Nume de familie (ex: Popescu)" 
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-white border border-[#E8E2D9] rounded-xl text-[15px] focus:outline-none focus:border-[#D4A853] focus:ring-4 focus:ring-[#D4A853]/20 transition-all duration-300"
                    />
                  </div>

                  <button 
                    onClick={handleCompleteNameStep}
                    disabled={!firstName.trim() || !lastName.trim()}
                    className="w-full mt-4 relative overflow-hidden bg-[#1A120B] text-white py-4 rounded-xl font-bold flex items-center justify-center space-x-2 transition-colors disabled:opacity-50 cursor-pointer group"
                  >
                    <span className="group-hover:text-[#D4A853] transition-colors">Pasul Următor</span>
                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              )}

              {/* STEP 2: ONBOARDING TERMS */}
              {modalStep === "ONBOARDING_TERMS" && (
                <div className="flex flex-col space-y-4">
                  <p className="text-sm text-[#1A120B]/70 leading-relaxed bg-white p-4 rounded-xl border border-[#E8E2D9]">
                    Te rugăm să confirmi că ești de acord cu <a href="/ro/legal" target="_blank" className="text-[#D4A853] font-bold underline">Termenii & Condițiile</a> și <a href="/ro/legal" target="_blank" className="text-[#D4A853] font-bold underline">Politica de Confidențialitate</a> Munchotella.
                  </p>

                  <label className="flex items-center space-x-3 cursor-pointer p-2 rounded-xl hover:bg-black/5 transition-colors">
                    <input 
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="hidden"
                    />
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                      acceptedTerms ? "bg-[#1A120B] border-[#1A120B] text-white" : "border-[#E8E2D9] bg-white"
                    }`}>
                      {acceptedTerms && <Check size={14} />}
                    </div>
                    <span className="text-sm font-semibold text-[#1A120B]">Sunt de acord cu Termenii & Condițiile</span>
                  </label>

                  <button 
                    onClick={handleCompleteTermsStep}
                    disabled={!acceptedTerms || loading}
                    className="w-full mt-4 bg-[#1A120B] text-white py-4 rounded-xl font-bold flex items-center justify-center space-x-2 transition-colors disabled:opacity-50 cursor-pointer group"
                  >
                    {loading ? (
                      <Loader2 size={20} className="animate-spin text-[#D4A853]" />
                    ) : (
                      <>
                        <span className="group-hover:text-[#D4A853] transition-colors">Finalizează Înregistrarea</span>
                        <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* STEP 0: AUTHENTICATION FORM */}
              {modalStep === "AUTH" && (
                <>
                  {/* Social Login Buttons */}
                  {!isForgotPassword && (
                    <div className="mb-6 space-y-3">
                      <button
                        type="button"
                        disabled={socialLoading || loading}
                        onClick={() => handleSocialLogin("google")}
                        className="w-full flex items-center justify-center space-x-3 py-3 px-4 bg-white border border-[#E8E2D9] rounded-xl font-semibold text-sm text-[#1A120B] hover:bg-gray-50 hover:border-[#D4A853]/50 transition-all shadow-sm cursor-pointer disabled:opacity-60"
                      >
                        <GoogleIcon />
                        <span>Continuă cu Google</span>
                      </button>

                      <button
                        type="button"
                        disabled={socialLoading || loading}
                        onClick={() => handleSocialLogin("facebook")}
                        className="w-full flex items-center justify-center space-x-3 py-3 px-4 bg-white border border-[#E8E2D9] rounded-xl font-semibold text-sm text-[#1A120B] hover:bg-gray-50 hover:border-[#D4A853]/50 transition-all shadow-sm cursor-pointer disabled:opacity-60"
                      >
                        <FacebookIcon />
                        <span>Continuă cu Facebook</span>
                      </button>

                      {/*
                      <button
                        type="button"
                        disabled={socialLoading || loading}
                        onClick={() => handleSocialLogin("apple")}
                        className="w-full flex items-center justify-center space-x-3 py-3 px-4 bg-[#1A120B] text-white rounded-xl font-semibold text-sm hover:bg-[#2A1E14] transition-all shadow-sm cursor-pointer disabled:opacity-60"
                      >
                        <AppleIcon />
                        <span>Continuă cu Apple</span>
                      </button>
                      */}

                      <div className="relative flex items-center justify-center my-4">
                        <div className="border-t border-[#E8E2D9] w-full"></div>
                        <span className="bg-[#FAF8F5] px-3 text-xs text-[#1A120B]/50 font-medium uppercase tracking-wider relative z-10">sau</span>
                      </div>
                    </div>
                  )}

                  {isForgotPassword ? (
                    <div className="flex flex-col space-y-4">
                      <div id="recaptcha-container" className="flex justify-center mt-2"></div>
                      {forgotStep === "phone" && (
                        <form onSubmit={handleForgotPhoneSubmit} className="flex flex-col space-y-4">
                          <div className="relative flex items-center bg-white border border-[#E8E2D9] rounded-xl focus-within:border-[#D4A853] focus-within:ring-4 focus-within:ring-[#D4A853]/20 transition-all duration-300">
                            <CountrySelector selectedCountry={selectedCountry} onSelect={setSelectedCountry} />
                            <input 
                              type="tel" 
                              placeholder="60 000 000" 
                              required
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              className="w-full pl-3 pr-4 py-3.5 bg-transparent border-none text-[15px] text-[#1A120B] outline-none placeholder:text-[#1A120B]/40"
                            />
                          </div>
                          <button type="submit" className="w-full relative bg-[#1A120B] text-white py-4 rounded-xl font-bold flex items-center justify-center space-x-2 transition-colors group cursor-pointer">
                            <span>Următorul pas</span>
                            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                          </button>
                        </form>
                      )}

                      {forgotStep === "method" && (
                        <div className="flex flex-col space-y-4">
                          <p className="text-center text-[#1A120B] font-medium text-sm">Cum dorești să recuperezi parola?</p>
                          <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => setResetMethod("sms")} className={`py-3 rounded-xl font-bold text-sm transition-all ${resetMethod === 'sms' ? 'bg-[#1A120B] text-white shadow-md' : 'bg-white border border-[#E8E2D9] text-[#1A120B]/60 hover:border-[#1A120B] hover:text-[#1A120B]'}`}>
                              Prin SMS
                            </button>
                            <button onClick={() => setResetMethod("email")} className={`py-3 rounded-xl font-bold text-sm transition-all ${resetMethod === 'email' ? 'bg-[#1A120B] text-white shadow-md' : 'bg-white border border-[#E8E2D9] text-[#1A120B]/60 hover:border-[#1A120B] hover:text-[#1A120B]'}`}>
                              Prin Email
                            </button>
                          </div>
                          <button onClick={handleForgotMethodSubmit} disabled={loading} className="w-full mt-2 relative overflow-hidden bg-[#1A120B] text-white py-4 rounded-xl font-bold flex items-center justify-center space-x-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed group cursor-pointer">
                            {loading ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}><Loader2 size={20} /></motion.div> : <span>Confirmă</span>}
                          </button>
                          <button onClick={() => setForgotStep("phone")} className="text-[13px] text-[#1A120B]/60 hover:text-[#1A120B] transition-colors mt-2">Înapoi la telefon</button>
                        </div>
                      )}

                      {forgotStep === "otp" && (
                        <form onSubmit={handleVerifyOtp} className="flex flex-col space-y-4">
                          <p className="text-center text-[#1A120B] font-medium text-sm">Am trimis un cod de 6 cifre pe telefonul tău.</p>
                          <div className="relative group focus-within:text-[#D4A853]">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1A120B]/40 group-focus-within:text-[#D4A853] transition-colors" size={18} />
                            <input 
                              type="text" 
                              placeholder="Cod OTP din 6 cifre" 
                              required
                              value={otpCode}
                              onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, '').slice(0,6))}
                              className="w-full pl-11 pr-4 py-3.5 bg-white border border-[#E8E2D9] rounded-xl text-[15px] focus:outline-none focus:border-[#D4A853] focus:ring-4 focus:ring-[#D4A853]/20 transition-all duration-300 tracking-widest text-center"
                            />
                          </div>
                          <button type="submit" disabled={loading} className="w-full mt-2 relative overflow-hidden bg-[#1A120B] text-white py-4 rounded-xl font-bold flex items-center justify-center space-x-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed group cursor-pointer">
                            {loading ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}><Loader2 size={20} /></motion.div> : <span>Verifică Codul</span>}
                          </button>
                        </form>
                      )}

                      {forgotStep === "success" && (
                        <div className="flex flex-col space-y-4 text-center">
                          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2 text-green-600">
                            <Check size={32} />
                          </div>
                          {tempPasswordDisplay ? (
                            <>
                              <h3 className="text-xl font-bold text-[#1A120B]">Recuperare reușită!</h3>
                              <p className="text-[#1A120B]/70 text-sm">Parola ta temporară este:</p>
                              <div className="bg-gray-100 p-4 rounded-xl border border-gray-200 mt-2">
                                <p className="font-mono text-2xl tracking-wider font-bold text-[#1A120B]">{tempPasswordDisplay}</p>
                              </div>
                              <p className="text-[#1A120B]/60 text-xs mt-2">Folosește această parolă pentru a te autentifica, apoi schimb-o din contul tău.</p>
                            </>
                          ) : (
                            <>
                              <h3 className="text-xl font-bold text-[#1A120B]">Verifică-ți Emailul</h3>
                              <p className="text-[#1A120B]/70 text-sm">{successMsg || "Parola temporară a fost trimisă cu succes!"}</p>
                            </>
                          )}
                        </div>
                      )}

                      <div className="text-center mt-4">
                        <button 
                          type="button" 
                          onClick={() => { setIsForgotPassword(false); setForgotStep("phone"); setErrorMsg(""); setSuccessMsg(""); }}
                          className="text-[13px] text-[#1A120B]/60 hover:text-[#D4A853] font-medium transition-colors cursor-pointer"
                        >
                          {forgotStep === "success" ? "Mergi la Autentificare" : "Înapoi la Autentificare"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
                        
                        {/* If in Login mode: Toggle Phone / Email */}
                        {isLogin && (
                          <div className="flex bg-[#F0EBE1] p-1 rounded-xl gap-1 mb-1">
                            <button
                              type="button"
                              onClick={() => setLoginMethod("phone")}
                              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                loginMethod === "phone"
                                  ? "bg-white text-[#1A120B] shadow-sm"
                                  : "text-[#1A120B]/60 hover:text-[#1A120B]"
                              }`}
                            >
                              <Phone size={14} />
                              <span>Număr de Telefon</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setLoginMethod("email")}
                              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                loginMethod === "email"
                                  ? "bg-white text-[#1A120B] shadow-sm"
                                  : "text-[#1A120B]/60 hover:text-[#1A120B]"
                              }`}
                            >
                              <Mail size={14} />
                              <span>Email</span>
                            </button>
                          </div>
                        )}

                        {/* REGISTER SPECIFIC FIELDS */}
                        <AnimatePresence mode="popLayout">
                          {!isLogin && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="flex flex-col space-y-4 overflow-visible"
                            >
                              {/* 1. Full Name */}
                              <div className="relative group focus-within:text-[#D4A853]">
                                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1A120B]/40 group-focus-within:text-[#D4A853] transition-colors" size={18} />
                                <input 
                                  type="text" 
                                  placeholder="Nume complet (ex: Maria Popescu)" 
                                  required={!isLogin}
                                  value={name}
                                  onChange={(e) => setName(e.target.value)}
                                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-[#E8E2D9] rounded-xl text-[15px] focus:outline-none focus:border-[#D4A853] focus:ring-4 focus:ring-[#D4A853]/20 transition-all duration-300"
                                />
                              </div>
                              
                              {/* 2. Phone Number with Country Selector */}
                              <div className="relative flex items-center bg-white border border-[#E8E2D9] rounded-xl focus-within:border-[#D4A853] focus-within:ring-4 focus-within:ring-[#D4A853]/20 transition-all duration-300">
                                <CountrySelector
                                  selectedCountry={selectedCountry}
                                  onSelect={setSelectedCountry}
                                />
                                <input 
                                  type="tel" 
                                  placeholder="60 000 000" 
                                  required={!isLogin}
                                  value={phone}
                                  onChange={(e) => setPhone(e.target.value)}
                                  className="w-full pl-3 pr-4 py-3.5 bg-transparent border-none text-[15px] text-[#1A120B] outline-none placeholder:text-[#1A120B]/40"
                                />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* LOGIN: PHONE INPUT (when loginMethod === "phone") */}
                        {isLogin && loginMethod === "phone" && (
                          <div className="relative flex items-center bg-white border border-[#E8E2D9] rounded-xl focus-within:border-[#D4A853] focus-within:ring-4 focus-within:ring-[#D4A853]/20 transition-all duration-300">
                            <CountrySelector
                              selectedCountry={selectedCountry}
                              onSelect={setSelectedCountry}
                            />
                            <input 
                              type="tel" 
                              placeholder="60 000 000" 
                              required
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              className="w-full pl-3 pr-4 py-3.5 bg-transparent border-none text-[15px] text-[#1A120B] outline-none placeholder:text-[#1A120B]/40"
                            />
                          </div>
                        )}

                        {/* LOGIN WITH EMAIL OR REGISTER EMAIL INPUT */}
                        {(!isLogin || (isLogin && loginMethod === "email")) && (
                          <div className="relative group focus-within:text-[#D4A853]">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1A120B]/40 group-focus-within:text-[#D4A853] transition-colors" size={18} />
                            <input 
                              type="email" 
                              placeholder="Adresa de email" 
                              required
                              value={loginEmail}
                              onChange={(e) => setLoginEmail(e.target.value)}
                              className="w-full pl-11 pr-4 py-3.5 bg-white border border-[#E8E2D9] rounded-xl text-[15px] focus:outline-none focus:border-[#D4A853] focus:ring-4 focus:ring-[#D4A853]/20 transition-all duration-300"
                            />
                          </div>
                        )}

                        {/* PASSWORD INPUT */}
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
                              className="text-[13px] text-[#1A120B]/60 hover:text-[#D4A853] font-medium transition-colors cursor-pointer"
                            >
                              Ai uitat parola?
                            </button>
                          </div>
                        )}

                        <button 
                          type="submit" 
                          disabled={loading || socialLoading}
                          className="w-full mt-4 relative overflow-hidden bg-[#1A120B] text-white py-4 rounded-xl font-bold flex items-center justify-center space-x-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed group cursor-pointer"
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
                                <span>{isLogin ? "Autentificare" : "Creează Cont"}</span>
                                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                              </>
                            )}
                          </div>
                        </button>
                      </form>

                      <div className="mt-6 text-center text-sm text-[#1A120B]/60">
                        {isLogin ? "Nu ai un cont încă?" : "Ai deja un cont?"}{" "}
                        <button 
                          type="button"
                          onClick={() => { setIsLogin(!isLogin); setErrorMsg(""); setSuccessMsg(""); setIsForgotPassword(false); }}
                          className="text-[#D4A853] font-bold hover:underline transition-all cursor-pointer"
                        >
                          {isLogin ? "Creează unul" : "Autentifică-te"}
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

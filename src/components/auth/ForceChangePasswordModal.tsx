"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function ForceChangePasswordModal() {
  const { user, token, updateUser } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!user || !user.mustChangePassword) return null;

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://munchotella-api.onrender.com/api";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    if (newPassword.length < 8) {
      setErrorMsg("Parola nouă trebuie să aibă cel puțin 8 caractere.");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Parolele nu se potrivesc.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/auth/force-change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword })
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Eroare la schimbarea parolei.");
      }

      setSuccessMsg("Parola a fost schimbată cu succes!");
      updateUser({ mustChangePassword: false });

    } catch (err: any) {
      setErrorMsg(err.message || "Nu s-a putut schimba parola.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#1A120B]/90 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="w-full max-w-[420px] bg-[#FFFCF6] rounded-[24px] shadow-2xl overflow-hidden relative flex flex-col border border-[#D4A853]/30"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", bounce: 0.3 }}
        >
          {/* Header */}
          <div className="bg-[#1A120B] p-6 text-center relative overflow-hidden">
            <div className="w-12 h-12 rounded-full bg-[#D4A853]/20 text-[#D4A853] flex items-center justify-center mx-auto mb-3">
              <Lock size={22} />
            </div>
            <h2 className="text-2xl font-serif text-[#FDF9F1]">Schimbare Parolă</h2>
            <p className="text-[#D4A853] text-xs mt-1 font-medium">
              Te-ai autentificat cu o parolă temporară. Setează o parolă nouă pentru securitatea contului.
            </p>
          </div>

          {/* Form */}
          <div className="p-6">
            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-xs font-medium border border-red-100 flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="mb-4 p-3 bg-[#E6F4EA] text-[#137333] rounded-xl text-xs font-medium border border-[#CEEAD6] text-center">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1A120B]/70 mb-1">Parolă nouă</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1A120B]/40" size={16} />
                  <input
                    type="password"
                    placeholder="Minim 8 caractere"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-[#E8E2D9] rounded-xl text-sm focus:outline-none focus:border-[#D4A853] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A120B]/70 mb-1">Confirmă parola nouă</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1A120B]/40" size={16} />
                  <input
                    type="password"
                    placeholder="Repetă parola nouă"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-[#E8E2D9] rounded-xl text-sm focus:outline-none focus:border-[#D4A853] transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 bg-[#1A120B] text-white py-3.5 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-[#D4A853] hover:text-[#1A120B] transition-colors disabled:opacity-70"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <span>Salvează Parola Nouă</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

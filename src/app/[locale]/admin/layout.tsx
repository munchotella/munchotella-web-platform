"use client";

import React, { useState, useEffect } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import { usePathname } from "next/navigation";

const API_URL = "https://munchotella-api.onrender.com/api";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // VUL-002 FIX: Starea de autentificare pornește ca null (necunoscută)
  // și este ÎNTOTDEAUNA verificată server-side prin /api/auth/me cu cookie HttpOnly.
  // Un utilizator nu mai poate bypassa autentificarea setând localStorage manual.
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const verifySession = async () => {
      try {
        // Verificare server-side: trimitem cookie-ul HttpOnly (credentials: "include")
        // Dacă sesiunea este validă și utilizatorul are rol de admin, accesul este permis.
        const res = await fetch(`${API_URL}/auth/me`, {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          setIsAuthenticated(false);
          return;
        }

        const data = await res.json();

        // Verificăm explicit rolul — nu ne bazăm pe client-side data
        if (data?.success && data?.data?.role === "admin") {
          // Actualizăm și datele locale de profil (non-sensibile) pentru UI
          localStorage.setItem("munchotella_user", JSON.stringify(data.data));
          setIsAuthenticated(true);
        } else {
          // Token valid dar utilizatorul nu este admin — acces refuzat
          localStorage.removeItem("munchotella_user");
          setIsAuthenticated(false);
        }
      } catch {
        // Eroare de rețea sau server — tratăm ca neautentificat
        setIsAuthenticated(false);
      }
    };

    verifySession();
  }, []);

  // Determine title based on path
  let title = "Tablou de Bord Executiv";
  if (pathname.includes("/orders")) title = "Comenzi în Curs";
  if (pathname.includes("/crm")) title = "Oaspeți și Recunoștință";
  if (pathname.includes("/marketing")) title = "Promoții și Oferte";
  if (pathname.includes("/menu")) title = "Gestionare Meniu";

  // 1. Loading state — așteptăm răspunsul server-side înainte de a afișa orice
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] font-body-md flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-gold-saffron border-t-transparent rounded-full animate-spin"></div>
        <p className="font-body-md text-cacao-dark/60 animate-pulse">Se verifică autentificarea...</p>
      </div>
    );
  }

  // 2. Unauthenticated state -> Show AdminLoginForm
  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] font-body-md flex items-center justify-center p-6 relative">
        <div
          className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
        ></div>
        <div className="w-full relative z-10">
          <AdminLoginForm onSuccess={() => setIsAuthenticated(true)} />
        </div>
      </div>
    );
  }

  // 3. Authenticated + admin role confirmed server-side
  return (
    <div className="min-h-screen bg-[#FAF7F2] font-body-md relative overflow-hidden">
      {/* Noise Texture Overlay for Artisanal Feel */}
      <div
        className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      ></div>

      <AdminSidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      <main className="lg:ml-72 flex-1 relative z-10 flex flex-col h-screen overflow-hidden">
        <AdminHeader title={title} onMenuClick={() => setIsMobileMenuOpen(true)} />

        <div className="flex-1 overflow-y-auto p-4 lg:p-10">
          <div className="max-w-[1440px] mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

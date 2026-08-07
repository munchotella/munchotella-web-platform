"use client";

import React from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Determine title based on path
  let title = "Tablou de Bord Executiv";
  if (pathname.includes("/orders")) title = "Comenzi în Curs";
  if (pathname.includes("/crm")) title = "Oaspeți și Recunoștință";
  if (pathname.includes("/marketing")) title = "Promoții și Oferte";

  return (
    <div className="min-h-screen bg-[#FAF7F2] font-body-md relative overflow-hidden">
      {/* Noise Texture Overlay for Artisanal Feel */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      ></div>

      <AdminSidebar />
      
      <main className="ml-72 flex-1 relative z-10 flex flex-col h-screen overflow-hidden">
        <AdminHeader title={title} />
        
        <div className="flex-1 overflow-y-auto p-10">
          <div className="max-w-[1440px] mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

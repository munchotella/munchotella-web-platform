"use client";

import React, { useState, useEffect } from "react";
import LuxuryButton from "@/components/admin/LuxuryButton";
import StatusBadge from "@/components/admin/StatusBadge";
import SlideOver from "@/components/admin/SlideOver";
import { adminFetch, API_URL } from "@/lib/adminApi";
import { Plus, Search, Sparkles, AlertCircle } from "lucide-react";

export default function MenuPage() {
  const [isSlideOverOpen, setSlideOverOpen] = useState(false);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMenu() {
      try {
        setLoading(true);
        // The menu endpoint is public, but we can still use adminFetch
        const res = await adminFetch("/menu");
        if (res?.success) {
          setMenuItems(res.data);
        }
      } catch (err: any) {
        setError(err.message || "Eroare la preluarea meniului");
      } finally {
        setLoading(false);
      }
    }
    loadMenu();
  }, []);

  return (
    <div className="space-y-8 pb-10">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-headline-lg text-cacao-dark text-3xl mb-2">Meniu și Oferte</h2>
          <p className="font-body-md text-cacao-dark/60">Controlează vitrina cu preparate artizanale vizibilă clienților.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-cacao-dark/40" size={18} />
            <input 
              type="text" 
              placeholder="Caută în meniu..." 
              className="pl-12 pr-6 py-3 bg-vanilla-porcelain border border-warm-border rounded-lg text-cacao-dark font-body-md focus:outline-none focus:border-gold-saffron transition-colors w-72"
            />
          </div>
          <LuxuryButton 
            variant="primary" 
            icon={<Plus size={16} />}
            onClick={() => setSlideOverOpen(true)}
          >
            Adaugă Preparat
          </LuxuryButton>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="w-12 h-12 border-4 border-gold-saffron border-t-transparent rounded-full animate-spin"></div>
          <p className="font-body-md text-cacao-dark/60 animate-pulse">Se încarcă vitrina cu bunătăți...</p>
        </div>
      ) : error ? (
        <div className="bg-[#FAF7F2] border border-error/20 p-8 rounded-2xl flex flex-col items-center text-center">
          <AlertCircle size={48} className="text-error mb-4" />
          <h3 className="font-headline-md text-cacao-dark text-xl mb-2">Nu am putut aduce meniul</h3>
          <p className="font-body-md text-cacao-dark/70 max-w-md">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <div key={item._id} className="bg-vanilla-porcelain border border-warm-border rounded-2xl overflow-hidden group hover:border-gold-saffron/50 transition-colors flex flex-col cursor-pointer">
              
              {/* Image Placeholder - 21st.dev style strict borders */}
              <div className="h-48 bg-[#FAF7F2] border-b border-warm-border relative overflow-hidden">
                <img 
                  src={item.image ? `${API_URL}/../${item.image}` : "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&q=80"} 
                  alt={item.name} 
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" 
                />
                
                <div className="absolute top-4 right-4">
                  <StatusBadge 
                    status={item.isAvailable ? 'success' : 'neutral'} 
                    label={item.isAvailable ? 'Activ' : 'Ascuns'} 
                  />
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-headline-md text-cacao-dark text-xl">{item.name}</h3>
                  {item.name.toLowerCase().includes("dubai") && (
                    <span className="text-gold-saffron" title="Produs Premium"><Sparkles size={18} /></span>
                  )}
                </div>
                
                <p className="font-body-md text-cacao-dark/60 text-sm line-clamp-2 mb-6 flex-1">
                  {item.description || "Nicio descriere adăugată."}
                </p>
                
                <div className="flex items-center justify-between pt-4 border-t border-warm-border/50 mt-auto">
                  <span className="font-headline-md text-gold-saffron text-xl">{item.basePrice} MDL</span>
                  <button className="text-cacao-dark/50 hover:text-gold-saffron font-label-caps text-xs transition-colors">
                    Editează
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <SlideOver 
        isOpen={isSlideOverOpen} 
        onClose={() => setSlideOverOpen(false)}
        title="Preparat Nou"
      >
        <div className="space-y-6">
          <div>
            <label className="block font-label-caps text-cacao-dark/60 text-xs mb-2">Nume Preparat</label>
            <input type="text" className="w-full bg-vanilla-porcelain border border-warm-border rounded-lg p-3 font-body-md text-cacao-dark focus:outline-none focus:border-gold-saffron transition-colors" placeholder="Ex: Waffle Praline" />
          </div>
          <div>
            <label className="block font-label-caps text-cacao-dark/60 text-xs mb-2">Descriere Artisanală</label>
            <textarea className="w-full bg-vanilla-porcelain border border-warm-border rounded-lg p-3 font-body-md text-cacao-dark min-h-[100px] focus:outline-none focus:border-gold-saffron transition-colors resize-none" placeholder="Descrierea delicioasă..."></textarea>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-label-caps text-cacao-dark/60 text-xs mb-2">Preț (MDL)</label>
              <input type="number" className="w-full bg-vanilla-porcelain border border-warm-border rounded-lg p-3 font-body-md text-cacao-dark focus:outline-none focus:border-gold-saffron transition-colors" placeholder="0.00" />
            </div>
            <div>
              <label className="block font-label-caps text-cacao-dark/60 text-xs mb-2">Status</label>
              <select className="w-full bg-vanilla-porcelain border border-warm-border rounded-lg p-3 font-body-md text-cacao-dark focus:outline-none focus:border-gold-saffron transition-colors appearance-none">
                <option>Activ</option>
                <option>Ascuns</option>
              </select>
            </div>
          </div>
          <div className="pt-6 border-t border-warm-border mt-8">
            <LuxuryButton variant="primary" className="w-full">
              Salvează Preparatul
            </LuxuryButton>
          </div>
        </div>
      </SlideOver>
    </div>
  );
}

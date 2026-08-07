"use client";

import React, { useState, useEffect } from "react";
import LuxuryButton from "@/components/admin/LuxuryButton";
import StatusBadge from "@/components/admin/StatusBadge";
import SlideOver from "@/components/admin/SlideOver";
import { adminFetch, API_URL } from "@/lib/adminApi";
import { Plus, Search, Sparkles, AlertCircle, Edit3 } from "lucide-react";

export default function MenuPage() {
  const [isSlideOverOpen, setSlideOverOpen] = useState(false);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "waffles",
    image: "",
    available: true,
  });

  const loadMenu = async () => {
    try {
      setLoading(true);
      const res = await adminFetch("/menu");
      if (res?.success) {
        setMenuItems(res.data);
      }
    } catch (err: any) {
      setError(err.message || "Eroare la preluarea meniului");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenu();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "waffles",
      image: "",
      available: true,
    });
    setSlideOverOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingId(item._id);
    setFormData({
      name: item.name || "",
      description: item.description || "",
      price: (item.price ?? item.basePrice ?? "").toString(),
      category: item.category || "waffles",
      image: item.image || "",
      available: item.available ?? item.isAvailable ?? true,
    });
    setSlideOverOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      alert("Completarea numelui și a prețului este obligatorie.");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        category: formData.category,
        image: formData.image || "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&q=80",
        available: formData.available,
      };

      if (editingId) {
        await adminFetch(`/menu/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await adminFetch("/menu", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      setSlideOverOpen(false);
      await loadMenu();
    } catch (err: any) {
      alert("Eroare la salvare: " + (err.message || "Apel eșuat"));
    } finally {
      setSaving(false);
    }
  };

  const filteredItems = menuItems.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.name?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q) ||
      item.category?.toLowerCase().includes(q)
    );
  });

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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Caută în meniu..." 
              className="pl-12 pr-6 py-3 bg-vanilla-porcelain border border-warm-border rounded-lg text-cacao-dark font-body-md focus:outline-none focus:border-gold-saffron transition-colors w-72"
            />
          </div>
          <LuxuryButton 
            variant="primary" 
            icon={<Plus size={16} />}
            onClick={handleOpenAdd}
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
      ) : filteredItems.length === 0 ? (
        <div className="p-12 text-center text-cacao-dark/60 font-body-md bg-vanilla-porcelain border border-warm-border rounded-2xl">
          Nu s-a găsit niciun preparat corespunzător căutării.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div key={item._id} className="bg-vanilla-porcelain border border-warm-border rounded-2xl overflow-hidden group hover:border-gold-saffron/50 transition-colors flex flex-col cursor-pointer">
              
              {/* Image Container */}
              <div className="h-48 bg-[#FAF7F2] border-b border-warm-border relative overflow-hidden">
                <img 
                  src={item.image ? (item.image.startsWith('http') ? item.image : `${API_URL}/../${item.image}`) : "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&q=80"} 
                  alt={item.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" 
                  onError={(e: any) => { e.target.src = "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&q=80"; }}
                />
                
                <div className="absolute top-4 right-4">
                  <StatusBadge 
                    status={(item.available ?? item.isAvailable) ? 'success' : 'neutral'} 
                    label={(item.available ?? item.isAvailable) ? 'Activ' : 'Ascuns'} 
                  />
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-headline-md text-cacao-dark text-xl">{item.name}</h3>
                  {item.name?.toLowerCase().includes("dubai") && (
                    <span className="text-gold-saffron" title="Produs Premium"><Sparkles size={18} /></span>
                  )}
                </div>
                
                <p className="font-body-md text-cacao-dark/60 text-sm line-clamp-2 mb-6 flex-1">
                  {item.description || "Nicio descriere adăugată."}
                </p>
                
                <div className="flex items-center justify-between pt-4 border-t border-warm-border/50 mt-auto">
                  <span className="font-headline-md text-gold-saffron text-xl">{item.price ?? item.basePrice} MDL</span>
                  <button 
                    onClick={() => handleOpenEdit(item)}
                    className="flex items-center gap-1 text-cacao-dark/50 hover:text-gold-saffron font-label-caps text-xs transition-colors cursor-pointer"
                  >
                    <Edit3 size={14} />
                    <span>Editează</span>
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
        title={editingId ? "Editează Preparat" : "Preparat Nou"}
      >
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block font-label-caps text-cacao-dark/60 text-xs mb-2">Nume Preparat *</label>
            <input 
              type="text" 
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-vanilla-porcelain border border-warm-border rounded-lg p-3 font-body-md text-cacao-dark focus:outline-none focus:border-gold-saffron transition-colors" 
              placeholder="Ex: Waffle Praline" 
            />
          </div>
          <div>
            <label className="block font-label-caps text-cacao-dark/60 text-xs mb-2">Descriere Artisanală</label>
            <textarea 
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-vanilla-porcelain border border-warm-border rounded-lg p-3 font-body-md text-cacao-dark min-h-[100px] focus:outline-none focus:border-gold-saffron transition-colors resize-none" 
              placeholder="Descrierea delicioasă..."
            />
          </div>
          <div>
            <label className="block font-label-caps text-cacao-dark/60 text-xs mb-2">URL Imagine (Cloudinary / Web)</label>
            <input 
              type="text" 
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full bg-vanilla-porcelain border border-warm-border rounded-lg p-3 font-body-md text-cacao-dark focus:outline-none focus:border-gold-saffron transition-colors" 
              placeholder="https://..." 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-label-caps text-cacao-dark/60 text-xs mb-2">Preț (MDL) *</label>
              <input 
                type="number" 
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full bg-vanilla-porcelain border border-warm-border rounded-lg p-3 font-body-md text-cacao-dark focus:outline-none focus:border-gold-saffron transition-colors" 
                placeholder="0.00" 
              />
            </div>
            <div>
              <label className="block font-label-caps text-cacao-dark/60 text-xs mb-2">Categorie</label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-vanilla-porcelain border border-warm-border rounded-lg p-3 font-body-md text-cacao-dark focus:outline-none focus:border-gold-saffron transition-colors"
              >
                <option value="waffles">Waffles</option>
                <option value="crepes">Crepes</option>
                <option value="pancakes">Pancakes</option>
                <option value="bauturi">Băuturi</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block font-label-caps text-cacao-dark/60 text-xs mb-2">Status Disponibilitate</label>
            <select 
              value={formData.available ? "true" : "false"}
              onChange={(e) => setFormData({ ...formData, available: e.target.value === "true" })}
              className="w-full bg-vanilla-porcelain border border-warm-border rounded-lg p-3 font-body-md text-cacao-dark focus:outline-none focus:border-gold-saffron transition-colors"
            >
              <option value="true">Activ</option>
              <option value="false">Ascuns</option>
            </select>
          </div>
          <div className="pt-6 border-t border-warm-border mt-8">
            <LuxuryButton variant="primary" className="w-full" disabled={saving}>
              {saving ? "Se salvează..." : editingId ? "Actualizează Preparatul" : "Salvează Preparatul"}
            </LuxuryButton>
          </div>
        </form>
      </SlideOver>
    </div>
  );
}

"use client";

import { ArrowRight, ChevronLeft, Search, ShoppingBag, X, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { AnimateIn } from "@/components/ui/AnimateIn";
import MagneticButton from "@/components/ui/MagneticButton";
import rawMenuItems from "@/data/menu.json";
import { useCart } from "@/context/CartContext";
import ProductCustomizationModal, { ProductItem } from "@/components/ProductCustomizationModal";
import ProductCard from "@/components/ProductCard";
import { useLocale, useTranslations } from "next-intl";

export default function MenuPage() {
  const t = useTranslations("Menu");
  const locale = useLocale();
  const [activeCategory, setActiveCategory] = useState(t('catAll'));
  const [searchQuery, setSearchQuery] = useState("");
  const { addToCart } = useCart();

  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenCustomization = (item: any) => {
    setSelectedProduct({
      id: item.id,
      name: item.name,
      price: item.numericPrice,
      desc: item.desc,
      img: item.img,
      category: item.category,
    });
    setIsModalOpen(true);
  };
  
  const categoryMap: Record<string, string> = {
    "waffles": "Waffles",
    "crepes": "Crepes",
    "pancakes": "Pancakes",
    "drinks": t('catDrinks')
  };
  
  const categories = [t('catAll'), "Waffles", "Crepes", "Pancakes", t('catDrinks')];
  
  // 1. Initial State: Hybrid Fallback cu menu.json (0ms)
  const initialItems = rawMenuItems.map((item: any, index: number) => ({
    id: index + 1,
    name: item.name,
    price: `${item.price} ${item.currency}`,
    numericPrice: item.price,
    category: categoryMap[item.category] || item.category,
    desc: item.description,
    img: item.image,
    badge: item.name.includes("Dubai") ? t('badgeHouseSpecial') : item.name.includes("Delux") ? t('badgeTopSeller') : undefined
  }));

  const [menuItems, setMenuItems] = useState<any[]>(initialItems);
  const [isSyncedWithDb, setIsSyncedWithDb] = useState(false);

  // 2. Background Sync cu MongoDB Live Backend
  useEffect(() => {
    const syncMenuFromBackend = async () => {
      try {
        const res = await fetch("https://munchotella-api.onrender.com/api/menu");
        const data = await res.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          const liveItems = data.data.map((item: any, index: number) => ({
            id: item._id || index + 1,
            name: item.name,
            price: `${item.price} ${item.currency || 'MDL'}`,
            numericPrice: item.price,
            category: categoryMap[item.category] || item.category,
            desc: item.description,
            img: item.imageUrl || item.image,
            badge: item.name.includes("Dubai") ? t('badgeHouseSpecial') : item.name.includes("Delux") ? t('badgeTopSeller') : undefined
          }));
          setMenuItems(liveItems);
          setIsSyncedWithDb(true);
        }
      } catch (err) {
        console.log("Meniu încărcat din cache local (offline fallback).");
      }
    };

    syncMenuFromBackend();
  }, [t]);

  const filteredItems = menuItems.filter(item => {
    const query = searchQuery.trim().toLowerCase();
    const isSearching = query !== "";
    
    const matchesCategory = isSearching || activeCategory === t('catAll') || item.category === activeCategory;
    
    const matchesSearch = !isSearching || 
      (item.name && item.name.toLowerCase().includes(query)) || 
      (item.desc && item.desc.toLowerCase().includes(query));
      
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F9F9FB] text-[#1A1A1A] font-sans selection:bg-[#1A1A1A] selection:text-white pb-32">
      <ProductCustomizationModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      
      {/* Header Banner */}
      <div className="bg-[#1A120B] text-white pt-28 pb-16 px-4 border-b border-[#D4A853]/20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D4A853_1px,transparent_1px)] [background-size:20px_20px]" />
        
        <div className="max-w-[1200px] mx-auto text-center relative z-10">
          <AnimateIn direction="down">
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#D4A853] mb-3 block">
              {t('subtitle')}
            </span>
            <h1 className="font-serif text-4xl md:text-6xl font-bold tracking-tight text-white mb-4">
              {t('title')}
            </h1>
            <p className="text-[#D4A853]/80 max-w-xl mx-auto text-sm md:text-base font-medium">
              {t('desc')}
            </p>
          </AnimateIn>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="sticky top-20 z-30 bg-[#F9F9FB]/90 backdrop-blur-md py-4 border-b border-[#E5E5EA]">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Category Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 whitespace-nowrap cursor-pointer ${
                  activeCategory === cat
                    ? "bg-[#1A120B] text-[#D4A853] shadow-md scale-105"
                    : "bg-white text-[#736A60] hover:bg-[#EAE6DF] hover:text-[#1A120B] border border-[#E5E5EA]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#736A60]" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2 bg-white border border-[#E5E5EA] rounded-full text-xs font-medium focus:outline-none focus:border-[#D4A853] focus:ring-2 focus:ring-[#D4A853]/20 transition-all duration-300"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#736A60] hover:text-[#1A120B]"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 pt-12">
        {filteredItems.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-[#736A60] font-medium text-base mb-4">
              {t('noResults')}
            </p>
            <button
              onClick={() => { setActiveCategory(t('catAll')); setSearchQuery(""); }}
              className="px-6 py-2.5 bg-[#1A120B] text-[#D4A853] rounded-full text-xs font-bold hover:bg-[#D4A853] hover:text-[#1A120B] transition-all duration-300"
            >
              {t('resetFilters')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item, idx) => (
              <AnimateIn key={item.id} direction="up" delay={idx * 0.05}>
                <ProductCard
                  item={item}
                  onSelect={handleOpenCustomization}
                />
              </AnimateIn>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

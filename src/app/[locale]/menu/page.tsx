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
      rawCategory: item.rawCategory,
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
  
  // Sort helper based on category bar order
  const categoryOrder = ["waffles", "crepes", "pancakes", "specials"];
  const getCategoryIndex = (cat: string) => {
    const lowerCat = cat.toLowerCase();
    if (lowerCat.includes("drink") || lowerCat.includes("băutur") || lowerCat.includes("напитки")) return 1000;
    const index = categoryOrder.indexOf(lowerCat);
    return index === -1 ? 500 : index;
  };

  // 1. Initial State: Hybrid Fallback cu menu.json (0ms)
  const initialItems = rawMenuItems.map((item: any, index: number) => {
    let desc = item.description;
    let name = item.name;
    const nameLower = name.toLowerCase();
    if (item.category === "drinks" && (nameLower.includes("coca") || nameLower.includes("fanta") || nameLower.includes("dorna") || nameLower.includes("sprite"))) {
      desc = "";
    }
    
    if (nameLower.includes("dorna")) {
      if (locale === 'en') name = name.replace(/apă|apa/i, "Water");
      else if (locale === 'ru') name = name.replace(/apă|apa/i, "Вода");
      else name = name.replace(/apa/i, "Apă"); // Correct diacritics in RO
    }

    return {
      id: index + 1,
      name,
      price: `${item.price} ${item.currency}`,
      numericPrice: item.price,
      category: categoryMap[item.category] || item.category,
      rawCategory: item.category?.toLowerCase() || "",
      desc,
      img: item.image,
      badge: name.includes("Dubai") ? t('badgeHouseSpecial') : name.includes("Delux") ? t('badgeTopSeller') : undefined
    };
  }).sort((a: any, b: any) => getCategoryIndex(a.rawCategory) - getCategoryIndex(b.rawCategory));

  const [menuItems, setMenuItems] = useState<any[]>(initialItems);
  const [isSyncedWithDb, setIsSyncedWithDb] = useState(false);

  // 2. Background Sync cu MongoDB Live Backend
  useEffect(() => {
    const syncMenuFromBackend = async () => {
      try {
        const res = await fetch("https://munchotella-api.onrender.com/api/menu");
        const data = await res.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          const liveItems = data.data.map((item: any, index: number) => {
            let desc = item.description;
            let name = item.name;
            const cat = item.category?.toLowerCase() || "";
            const nameLower = name.toLowerCase();
            
            // Remove description for commercial bottled drinks
            if ((cat === "drinks" || cat === "băuturi" || cat === "напитки") && 
                (nameLower.includes("coca") || nameLower.includes("fanta") || nameLower.includes("dorna") || nameLower.includes("sprite"))) {
              desc = "";
            }
            
            // Translate 'Apa' but keep 'Dorna'
            if (nameLower.includes("dorna")) {
              if (locale === 'en') name = name.replace(/apă|apa/i, "Water");
              else if (locale === 'ru') name = name.replace(/apă|apa/i, "Вода");
              else name = name.replace(/apa/i, "Apă");
            }

            return {
              id: item._id || index + 1,
              name,
              price: `${item.price} ${item.currency || 'MDL'}`,
              numericPrice: item.price,
              category: categoryMap[item.category] || item.category,
              rawCategory: item.category?.toLowerCase() || "",
              desc,
              img: item.imageUrl || item.image,
              badge: name.includes("Dubai") ? t('badgeHouseSpecial') : name.includes("Delux") ? t('badgeTopSeller') : undefined
            };
          }).sort((a: any, b: any) => getCategoryIndex(a.rawCategory) - getCategoryIndex(b.rawCategory));
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
      
      {/* Static Header Section (Title + Search) */}
      <div className="bg-[#F9F9FB] pt-32 pb-6 px-6 md:px-12">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col">
            <h1 className="font-serif text-[42px] leading-[1.1] font-bold text-[#1A1A1A] tracking-tight mb-2">
              {t('title1')} <span className="text-[#1A1A1A] italic font-normal">{t('title2')}</span>
            </h1>
            <p className="text-[#82756A] text-[14px] font-medium hidden md:block">
              {t('subtitle')}
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#82756A]" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.trim() !== "") {
                  setActiveCategory(t('catAll'));
                }
              }}
              placeholder={t('searchPlaceholder')} 
              className="w-full bg-[#FFFFFF] border border-[#EAE1DB] rounded-lg py-3 pl-11 pr-10 outline-none focus:border-[#D4A373] focus:ring-1 focus:ring-[#D4A373] transition-all text-[#1A1A1A] text-[14px] placeholder:text-[#82756A] font-medium shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-[#82756A] hover:text-[#1A1A1A] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
        
      {/* Sticky Category Pills */}
      <div className="sticky top-[80px] z-40 bg-[#F9F9FB]/95 backdrop-blur-xl border-b border-[#EAE1DB]/60 py-3 px-6 md:px-12 transition-all">
        <div className="max-w-[1200px] mx-auto overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 min-w-max pb-1">
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`relative px-5 py-2 rounded-full text-[14px] font-semibold tracking-wide transition-colors duration-300 cursor-pointer outline-none select-none border ${
                    isActive 
                      ? "bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-md" 
                      : "bg-[#FFFFFF] text-[#50453B] border-[#EAE1DB] hover:text-[#1A1A1A] hover:border-[#1A1A1A] shadow-sm"
                  }`}
                >
                  <span className="relative z-10">{cat}</span>
                </button>
              );
            })}
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
            {filteredItems.map((item) => (
              <ProductCard
                key={item.id}
                item={item}
                onSelect={handleOpenCustomization}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { ArrowRight, ChevronLeft, Search, ShoppingBag, X } from "lucide-react";
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
  
  // Authentic Munchotella Products mapped from database
  const menuItems = rawMenuItems.map((item: any, index: number) => ({
    id: index + 1,
    name: item.name,
    price: `${item.price} ${item.currency}`,
    numericPrice: item.price,
    category: categoryMap[item.category] || item.category,
    desc: item.description,
    img: item.image,
    badge: item.name.includes("Dubai") ? t('badgeHouseSpecial') : item.name.includes("Delux") ? t('badgeTopSeller') : undefined
  }));

  const filteredItems = menuItems.filter(item => {
    // If there is an active search query, we want to search across ALL categories.
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
      
      {/* Sticky Header Nav matching Stitch UI */}
      <div className="sticky top-0 z-40 bg-[#F9F9FB]/95 backdrop-blur-xl border-b border-[#EAE1DB]/60 pt-24 pb-4 px-6 md:px-12 transition-all">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col mb-12">
            <h1 className="font-serif text-[42px] leading-[1.1] font-bold text-[#1A1A1A] tracking-tight mb-3">
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
        
        {/* Elegant Pill Category Slider inside Sticky Header */}
        <div className="max-w-[1200px] mx-auto mt-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 min-w-max pb-2">
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
      
      <main className="max-w-[1200px] mx-auto px-6 md:px-12 pt-8">
        {/* Product Grid - Synchronized Uniform Fade */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-20 bg-[#FFFFFF] rounded-[16px] border border-[#EAE1DB] p-8 max-w-md mx-auto my-12 shadow-[0_4px_20px_rgba(26,26,26,0.04)]">
            <Search className="w-12 h-12 text-[#D4A373] mx-auto mb-4 opacity-50" />
            <h3 className="font-serif text-2xl font-bold text-[#1A1A1A] mb-2">{t('noDessertsFound')}</h3>
            <p className="text-[#50453B] text-[14px] font-medium mb-6">
              {t('noProductsFound_1')}<span className="font-bold text-[#1A1A1A]">{searchQuery}</span>{t('noProductsFound_2')}
            </p>
            <button
              onClick={() => { setSearchQuery(""); setActiveCategory(t('catAll')); }}
              className="bg-[#1A1A1A] hover:bg-[#342F2C] text-white font-bold text-[13px] uppercase tracking-widest px-6 py-3.5 rounded-full transition-all shadow-md min-h-[44px]"
            >
              {t('resetSearch')}
            </button>
          </div>
        ) : (
          <motion.div 
            key={`${activeCategory}-${searchQuery}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredItems.map((item) => (
              <ProductCard
                key={item.id}
                item={item}
                onSelect={handleOpenCustomization}
              />
            ))}
          </motion.div>
        )}
      </main>
    </div>
  );
}

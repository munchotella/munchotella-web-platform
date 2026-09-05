"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Check, Sparkles } from "lucide-react";
import { useCart, ToppingOption } from "@/context/CartContext";
import { useTranslations, useLocale } from "next-intl";
import { translateTopping } from "@/utils/toppingTranslations";

export type ProductItem = {
  id: number | string;
  name: string;
  price: number;
  desc?: string;
  img: string;
  category?: string;
  rawCategory?: string;
  modifiers?: any[];
};


type ProductCustomizationModalProps = {
  product: ProductItem | null;
  isOpen: boolean;
  onClose: () => void;
};

export default function ProductCustomizationModal({
  product,
  isOpen,
  onClose,
}: ProductCustomizationModalProps) {
  const { addToCart } = useCart();
  const t = useTranslations("Toppings");
  const locale = useLocale();
  const [selectedToppings, setSelectedToppings] = useState<ToppingOption[]>([]);
  const [quantity, setQuantity] = useState(1);

  // Fallback Hardcoded Toppings (In case offline cache 'menu.json' without modifiers is active)
  const ALL_TOPPINGS: ToppingOption[] = [
    { name: t("extraNutella"), price: 55 },
    { name: t("extraWhiteChocolate"), price: 45 },
    { name: t("extraStrawberry"), price: 30 },
    { name: t("extraBanana"), price: 25 },
    { name: t("extraKiwi"), price: 30 },
    { name: t("freshFruit"), price: 55 },
    { name: t("extraPistachio"), price: 50 },
    { name: t("pistachioPaste"), price: 65 },
    { name: t("extraOreo"), price: 25 },
    { name: t("extraKinder"), price: 25 },
    { name: t("kinderBueno"), price: 35 },
    { name: t("extraPeanuts"), price: 25 },
    { name: t("extraLotus"), price: 55 },
    { name: t("iceCream"), price: 30 },
  ];

  let renderModifierGroups: { title: string; options: ToppingOption[] }[] = [];

  if (product) {
    const isDrink = product.rawCategory === "drinks" || 
                    product.rawCategory === "băuturi" || 
                    product.rawCategory === "напитки" || 
                    product.category === "drinks";
    
    if (!isDrink) {
      if (Array.isArray(product.modifiers) && product.modifiers.length > 0) {
        // DYNAMIC LOGIC: Fetched from Database API
        renderModifierGroups = product.modifiers;
      } else {
        // FALLBACK LOGIC: Offline cache fallback
        const descLower = (product.desc || "").toLowerCase();
        const nameLower = (product.name || "").toLowerCase();

        const AVAILABLE_TOPPINGS = ALL_TOPPINGS.filter((topping) => {
          if (topping.name === t("freshFruit")) return true;
          if (topping.name === t("iceCream")) return true;
          if (topping.name === t("pistachioPaste")) {
            return descLower.includes("pistachio cream") || descLower.includes("katayf") || nameLower.includes("dubai");
          }
          if (topping.name === t("kinderBueno")) return descLower.includes("kinder bueno");
          if (topping.name === t("extraKiwi")) return descLower.includes("kiwi");
          if (topping.name === t("extraNutella")) return descLower.includes("nutella");
          if (topping.name === t("extraStrawberry")) return descLower.includes("strawberry");
          if (topping.name === t("extraBanana")) return descLower.includes("banana");
          if (topping.name === t("extraPistachio")) return descLower.includes("pistachio") && !topping.name.includes("Pastă"); 
          if (topping.name === t("extraOreo")) return descLower.includes("oreo");
          if (topping.name === t("extraKinder")) return (descLower.includes("kinder") && !descLower.includes("kinder bueno")) || descLower.includes("kinder");
          if (topping.name === t("extraPeanuts")) return descLower.includes("peanuts");
          if (topping.name === t("extraWhiteChocolate")) return descLower.includes("white chocolate");
          if (topping.name === t("extraLotus")) return descLower.includes("lotus");
          return true;
        });

        if (AVAILABLE_TOPPINGS.length > 0) {
          renderModifierGroups = [
            {
              title: 'Personalizare', // Generic fallback title
              options: AVAILABLE_TOPPINGS
            }
          ];
        }
      }
    }
  }

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setSelectedToppings([]);
      setQuantity(1);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [product, isOpen]);

  if (!product) return null;

  const toggleTopping = (e: React.MouseEvent, topping: ToppingOption) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedToppings((prev) => {
      const exists = prev.some((t) => t.name === topping.name);
      if (exists) {
        return prev.filter((t) => t.name !== topping.name);
      }
      return [...prev, topping];
    });
  };

  const toppingsTotal = selectedToppings.reduce((sum, t) => sum + t.price, 0);
  const unitPrice = product.price + toppingsTotal;
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.img,
      selectedToppings,
      quantity,
    });
    onClose();
  };

  const modalContent = (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#1A1A1A]/60 backdrop-blur-sm z-[9998]"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center p-0 md:p-6 pointer-events-none">
            <motion.div
              key="modal"
              initial={{ opacity: 0, y: 50, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.98 }}
              transition={{ type: "spring", damping: 26, stiffness: 320 }}
              className="w-full max-w-full md:max-w-[820px] lg:max-w-[880px] bg-[#FFFFFF] rounded-t-[28px] md:rounded-[28px] shadow-2xl relative overflow-hidden flex flex-col md:flex-row max-h-[90vh] md:h-[580px] md:max-h-[85vh] pointer-events-auto border border-[#EAE1DB]/70"
            >
              {/* Drag Handle for Mobile */}
              <div className="w-full h-5 flex items-center justify-center absolute top-0 left-0 z-30 md:hidden">
                <div className="w-12 h-1.5 bg-[#EAE1DB] rounded-full mt-2"></div>
              </div>

              {/* Close Button Mobile (over image) */}
              <button
                type="button"
                onClick={onClose}
                className="md:hidden absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 text-[#1A1A1A] backdrop-blur-md flex items-center justify-center hover:bg-white transition-all cursor-pointer z-40 shadow-md border border-black/5"
              >
                <X className="w-4 h-4" />
              </button>

              {/* LEFT COLUMN (Desktop) / TOP SECTION (Mobile): Product Visual & Details */}
              <div className="w-full md:w-[42%] lg:w-[40%] bg-[#FDFBF9] border-b md:border-b-0 md:border-r border-[#EAE1DB] flex flex-col shrink-0 md:overflow-y-auto no-scrollbar">
                {/* Product Image */}
                <div className="relative h-36 sm:h-44 md:h-56 w-full shrink-0 bg-[#F9F9FB] overflow-hidden">
                  <img
                    src={product.img}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10" />
                </div>

                {/* Product Details */}
                <div className="p-4 md:p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-3">
                      <h3 className="font-sans text-[20px] md:text-[23px] font-bold text-[#1A1A1A] leading-tight tracking-tight">
                        {product.name}
                      </h3>
                      <span className="font-sans text-[19px] md:text-[22px] font-bold text-[#D4A373] whitespace-nowrap">
                        {product.price} MDL
                      </span>
                    </div>
                    {product.desc && (
                      <p className="text-[#50453B] text-[13px] md:text-[14px] leading-relaxed mt-2">
                        {product.desc}
                      </p>
                    )}
                  </div>

                  {/* Desktop Tip Badge */}
                  <div className="hidden md:flex items-start gap-2.5 p-3 rounded-2xl bg-[#F5EFEB]/80 border border-[#EAE1DB] mt-6">
                    <Sparkles className="w-4 h-4 text-[#D4A853] shrink-0 mt-0.5" />
                    <p className="text-[12px] text-[#736A60] leading-snug">
                      {locale === "ro"
                        ? "Personalizează desertul cu toppingurile tale favorite din lista alăturată."
                        : locale === "ru"
                        ? "Настройте десерт с любимыми топпингами из списка справа."
                        : "Customize your treat with your favorite toppings from the list."}
                    </p>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN (Desktop) / BOTTOM SECTION (Mobile): Customization & Actions */}
              <div className="w-full md:w-[58%] lg:w-[60%] flex-1 flex flex-col min-h-0 bg-white">
                {/* Desktop Header Bar with Close Button */}
                <div className="hidden md:flex items-center justify-between px-6 py-4 border-b border-[#EAE1DB] bg-white shrink-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-[16px] text-[#1A1A1A]">
                      {renderModifierGroups.length > 0 
                        ? translateTopping(renderModifierGroups[0].title, locale) 
                        : (locale === 'ro' ? 'Toppinguri & Extra' : locale === 'ru' ? 'Топпинги и Экстра' : 'Toppings & Extras')}
                    </h4>
                    <span className="text-[11px] bg-[#F5EFEB] text-[#736A60] px-2.5 py-0.5 rounded-full font-semibold">
                      {t('optional')}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={onClose}
                    className="w-8 h-8 rounded-full bg-[#F5EFEB] hover:bg-[#EAE1DB] text-[#1A1A1A] flex items-center justify-center transition-all cursor-pointer shadow-sm"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Scrollable Toppings Body */}
                <div className="p-4 md:p-6 flex-1 overflow-y-auto no-scrollbar space-y-4">
                  {renderModifierGroups.length > 0 ? (
                    renderModifierGroups.map((group, groupIndex) => (
                      <div key={groupIndex} className="space-y-3">
                        {/* Group Header on Mobile */}
                        <div className="flex md:hidden items-center justify-between">
                          <h4 className="text-[15px] font-bold text-[#1A1A1A]">
                            {translateTopping(group.title, locale)}
                          </h4>
                          <span className="text-[11px] bg-[#F5EFEB] text-[#50453B] px-2 py-0.5 rounded-full font-medium">
                            {t('optional')}
                          </span>
                        </div>

                        {/* Group Options List */}
                        <div className="flex flex-col border border-[#EAE1DB] rounded-[20px] overflow-hidden bg-white shadow-sm">
                          {group.options.map((topping: any, index: number) => {
                            const cleanToppingName = topping.name.replace(/^(Extra|Доп\.)\s+/i, '');
                            const translatedToppingName = translateTopping(cleanToppingName, locale);
                            const isSelected = selectedToppings.some((t) => t.name === topping.name || t.name === cleanToppingName);
                            return (
                              <div
                                key={topping.name}
                                onClick={(e) => toggleTopping(e, { name: cleanToppingName, price: topping.price })}
                                className={`group flex items-center justify-between p-3.5 md:p-4 cursor-pointer transition-all hover:bg-[#FAF8F5] select-none ${
                                  index !== group.options.length - 1 ? "border-b border-[#EAE1DB]" : ""
                                } ${isSelected ? "bg-[#FFFBF5]" : ""}`}
                              >
                                <div className="flex flex-row items-center gap-3">
                                  <span className={`text-[15px] md:text-[16px] ${isSelected ? "font-bold text-[#1A1A1A]" : "font-medium text-[#2C241E]"}`}>
                                    {translatedToppingName}
                                  </span>
                                  <span className={`text-[13px] md:text-[14px] ${isSelected ? "text-[#D4A373] font-bold" : "text-[#8C7E72]"}`}>
                                    (+{topping.price} MDL)
                                  </span>
                                </div>
                                <div className={`w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center transition-all border-2 group-hover:border-[#D4A853] ${
                                  isSelected ? "bg-[#D4A853] border-[#D4A853] shadow-sm" : "border-[#C5BCB1] bg-white"
                                }`}>
                                  {isSelected && <Check className="w-4 h-4 md:w-5 md:h-5 text-white stroke-[3]" />}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-[#736A60] text-[14px]">
                      {locale === 'ro' ? 'Acest produs nu necesită personalizare.' : locale === 'ru' ? 'Этот товар не требует настройки.' : 'No customization options for this item.'}
                    </div>
                  )}
                </div>

                {/* Fixed Bottom CTA & Quantity Footer */}
                <div className="p-4 md:p-5 border-t border-[#EAE1DB] bg-[#FFFFFF] shrink-0 shadow-[0_-4px_20px_rgba(26,26,26,0.03)]">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[14px] md:text-[15px] font-semibold text-[#50453B]">
                      {t('quantity')}
                    </span>
                    <div className="flex items-center bg-[#FFFAF5] border border-[#EAE1DB] rounded-full p-1 shadow-inner">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setQuantity((q) => Math.max(1, q - 1));
                        }}
                        className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#FFFFFF] text-[#1A1A1A] flex items-center justify-center hover:bg-[#EAE1DB]/50 transition-colors shadow-sm cursor-pointer border border-[#EAE1DB]"
                      >
                        <Minus className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      </button>
                      <span className="w-10 md:w-12 text-center font-bold text-[15px] md:text-[16px] text-[#1A1A1A]">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setQuantity((q) => q + 1);
                        }}
                        className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#FFFFFF] text-[#1A1A1A] flex items-center justify-center hover:bg-[#EAE1DB]/50 transition-colors shadow-sm cursor-pointer border border-[#EAE1DB]"
                      >
                        <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="w-full bg-[#D4A373] hover:bg-[#7D562D] text-white py-3.5 md:py-4 px-5 md:px-6 rounded-full font-bold text-[14px] md:text-[15px] uppercase tracking-wide transition-all duration-300 flex items-center justify-between cursor-pointer shadow-[0_4px_14px_rgba(212,163,115,0.4)]"
                  >
                    <span>{t('addToCart')}</span>
                    <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 md:px-3.5 md:py-1.5 rounded-full text-[13px] md:text-[14px] font-bold">
                      {totalPrice} MDL
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );

  return typeof window !== 'undefined' 
    ? require('react-dom').createPortal(modalContent, document.body)
    : null;
}

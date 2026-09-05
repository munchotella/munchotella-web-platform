"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Check } from "lucide-react";
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
          <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-6 pointer-events-none">
            <motion.div
              key="modal"
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-[520px] bg-[#FFFFFF] sm:rounded-[24px] rounded-t-[24px] rounded-b-none shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] pointer-events-auto"
            >
              {/* Drag Handle for Mobile */}
              <div className="w-full h-6 flex items-center justify-center absolute top-0 left-0 z-30 sm:hidden">
                <div className="w-12 h-1.5 bg-[#EAE1DB] rounded-full mt-3"></div>
              </div>
            {/* Header Image */}
            <div className="relative h-48 sm:h-64 w-full shrink-0 bg-[#F9F9FB]">
              <img
                src={product.img}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/10" />

              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 text-[#1A1A1A] backdrop-blur-md flex items-center justify-center hover:bg-white hover:scale-105 transition-all cursor-pointer z-20 shadow-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="p-6 relative bg-white flex-1 overflow-y-auto no-scrollbar">
              <div className="mb-6 mt-2">
                <div className="flex justify-between items-start gap-3">
                  <h3 className="font-sans text-[24px] font-bold text-[#1A1A1A] leading-tight tracking-tight">
                    {product.name}
                  </h3>
                  <span className="font-sans text-[22px] font-bold text-[#D4A373] whitespace-nowrap mt-1">
                    {product.price} MDL
                  </span>
                </div>
                {product.desc && (
                  <p className="text-[#50453B] text-[15px] mt-2">
                    {product.desc}
                  </p>
                )}
              </div>

              {/* Toppings Selection */}
              {renderModifierGroups.length > 0 && (
                <div>
                  {renderModifierGroups.map((group, groupIndex) => (
                    <div key={groupIndex} className="mb-6">
                      <div className="flex items-center gap-2 mb-4">
                        <h4 className="text-[16px] font-bold text-[#1A1A1A]">
                          {translateTopping(group.title, locale)}
                        </h4>
                        <span className="text-[12px] bg-[#EAE1DB]/50 text-[#50453B] px-2 py-0.5 rounded-full font-medium ml-auto">
                          {t('optional')}
                        </span>
                      </div>

                      <div className="flex flex-col border border-[#EAE1DB] rounded-[20px] overflow-hidden bg-white">
                        {group.options.map((topping: any, index: number) => {
                          const cleanToppingName = topping.name.replace(/^(Extra|Доп\.)\s+/i, '');
                          const translatedToppingName = translateTopping(cleanToppingName, locale);
                          const isSelected = selectedToppings.some((t) => t.name === topping.name || t.name === cleanToppingName);
                          return (
                            <div
                              key={topping.name}
                              onClick={(e) => toggleTopping(e, { name: cleanToppingName, price: topping.price })}
                              className={`group flex items-center justify-between p-4 cursor-pointer transition-colors hover:bg-[#F9F9FB] select-none ${
                                index !== group.options.length - 1 ? "border-b border-[#EAE1DB]" : ""
                              } ${isSelected ? "bg-[#FFFCF6]" : ""}`}
                            >
                              <div className="flex flex-row items-center gap-3">
                                <span className={`text-[17px] ${isSelected ? "font-bold text-[#1A1A1A]" : "font-medium text-[#1A120B]"}`}>
                                  {translatedToppingName}
                                </span>
                                <span className={`text-[15px] ${isSelected ? "text-[#D4A373] font-bold" : "text-[#736A60]"}`}>
                                  (+{topping.price} MDL)
                                </span>
                              </div>
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all border-2 group-hover:border-[#D4A853] ${
                                isSelected ? "bg-[#D4A853] border-[#D4A853] shadow-sm" : "border-[#C5BCB1] bg-white"
                              }`}>
                                {isSelected && <Check className="w-5 h-5 text-white stroke-[3]" />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Fixed Bottom CTA & Quantity Footer */}
            <div className="p-5 sm:p-6 border-t border-[#EAE1DB] bg-[#FFFFFF] shrink-0 shadow-[0_-4px_20px_rgba(26,26,26,0.03)]">
              <div className="flex items-center justify-between mb-5">
                <span className="text-[15px] font-semibold text-[#50453B]">
                  {t('quantity')}
                </span>
                <div className="flex items-center bg-[#FFFAF5] border border-[#EAE1DB] rounded-full p-1.5 shadow-inner">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setQuantity((q) => Math.max(1, q - 1));
                    }}
                    className="w-9 h-9 rounded-full bg-[#FFFFFF] text-[#1A1A1A] flex items-center justify-center hover:bg-[#EAE1DB]/50 transition-colors shadow-sm cursor-pointer border border-[#EAE1DB]"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-bold text-[16px] text-[#1A1A1A]">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setQuantity((q) => q + 1);
                    }}
                    className="w-9 h-9 rounded-full bg-[#FFFFFF] text-[#1A1A1A] flex items-center justify-center hover:bg-[#EAE1DB]/50 transition-colors shadow-sm cursor-pointer border border-[#EAE1DB]"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full bg-[#D4A373] hover:bg-[#7D562D] text-white py-4 px-6 rounded-full font-bold text-[15px] uppercase tracking-wide transition-all duration-300 flex items-center justify-between cursor-pointer shadow-[0_4px_14px_rgba(212,163,115,0.4)]"
              >
                <span>{t('addToCart')}</span>
                <span className="bg-white/20 backdrop-blur-sm text-white px-3.5 py-1.5 rounded-full text-[14px] font-bold">
                  {totalPrice} MDL
                </span>
              </button>
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

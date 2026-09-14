"use client";

import React, { useState, useEffect, useRef } from "react";
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
  const [isMobile, setIsMobile] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const currentYRef = useRef(0);

  const resetModalPosition = () => {
    if (modalRef.current) {
      modalRef.current.style.transform = "";
      modalRef.current.style.transition = "";
      modalRef.current.style.opacity = "";
    }
  };

  const startDrag = (clientY: number) => {
    if (!isMobile) return;
    isDraggingRef.current = true;
    startYRef.current = clientY;
    currentYRef.current = 0;
    if (modalRef.current) {
      modalRef.current.style.transition = "none";
    }
  };

  const moveDrag = (clientY: number) => {
    if (!isDraggingRef.current || !modalRef.current) return;
    const deltaY = clientY - startYRef.current;
    if (deltaY > 0) {
      currentYRef.current = deltaY;
      modalRef.current.style.transform = `translateY(${deltaY}px)`;
    } else {
      currentYRef.current = deltaY * 0.2;
      modalRef.current.style.transform = `translateY(${deltaY * 0.2}px)`;
    }
  };

  const endDrag = () => {
    if (!isDraggingRef.current || !modalRef.current) return;
    isDraggingRef.current = false;
    const finalY = currentYRef.current;

    if (finalY > 75) {
      modalRef.current.style.transition = "transform 0.22s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.2s ease-out";
      modalRef.current.style.transform = "translateY(100%)";
      modalRef.current.style.opacity = "0";
      setTimeout(() => {
        onClose();
        resetModalPosition();
      }, 220);
    } else {
      modalRef.current.style.transition = "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)";
      modalRef.current.style.transform = "translateY(0px)";
    }
  };

  useEffect(() => {
    const handleGlobalPointerMove = (e: PointerEvent) => {
      if (isDraggingRef.current) {
        moveDrag(e.clientY);
      }
    };
    const handleGlobalPointerUp = () => {
      if (isDraggingRef.current) {
        endDrag();
      }
    };
    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (isDraggingRef.current && e.touches.length > 0) {
        moveDrag(e.touches[0].clientY);
      }
    };
    const handleGlobalTouchEnd = () => {
      if (isDraggingRef.current) {
        endDrag();
      }
    };

    window.addEventListener("pointermove", handleGlobalPointerMove);
    window.addEventListener("pointerup", handleGlobalPointerUp);
    window.addEventListener("pointercancel", handleGlobalPointerUp);
    window.addEventListener("touchmove", handleGlobalTouchMove, { passive: true });
    window.addEventListener("touchend", handleGlobalTouchEnd);
    window.addEventListener("touchcancel", handleGlobalTouchEnd);

    return () => {
      window.removeEventListener("pointermove", handleGlobalPointerMove);
      window.removeEventListener("pointerup", handleGlobalPointerUp);
      window.removeEventListener("pointercancel", handleGlobalPointerUp);
      window.removeEventListener("touchmove", handleGlobalTouchMove);
      window.removeEventListener("touchend", handleGlobalTouchEnd);
      window.removeEventListener("touchcancel", handleGlobalTouchEnd);
    };
  }, [isMobile]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Standard Food Modifiers: Exactly 14 items across Toppinguri (6) and Personalizare (8)
  const STANDARD_FOOD_MODIFIERS: { title: string; isRequired?: boolean; multiSelect?: boolean; options: ToppingOption[] }[] = [
    {
      title: "Toppinguri",
      isRequired: false,
      multiSelect: true,
      options: [
        { name: "Alune", price: 25 },
        { name: "Fistic", price: 50 },
        { name: "Oreo", price: 25 },
        { name: "Banană", price: 25 },
        { name: "Căpșune", price: 30 },
        { name: "Kiwi", price: 30 },
      ],
    },
    {
      title: "Personalizare",
      isRequired: false,
      multiSelect: true,
      options: [
        { name: "Nutella®", price: 55 },
        { name: "Ciocolată Albă", price: 45 },
        { name: "Cremă de Lotus", price: 55 },
        { name: "Pastă de fistic", price: 65 },
        { name: "Kinder", price: 25 },
        { name: "Kinder Bueno", price: 35 },
        { name: "Mix de fructe", price: 55 },
        { name: "Bilă de înghețată", price: 30 },
      ],
    },
  ];

  let renderModifierGroups: { title: string; options: ToppingOption[] }[] = [];

  if (product) {
    const isDrink = product.rawCategory === "drinks" || 
                    product.rawCategory === "băuturi" || 
                    product.rawCategory === "напитки" || 
                    product.category === "drinks" ||
                    (product.name && (
                      product.name.toLowerCase().includes("milk shake") ||
                      product.name.toLowerCase().includes("milkshake") ||
                      product.name.toLowerCase().includes("lemonade") ||
                      product.name.toLowerCase().includes("tea") ||
                      product.name.toLowerCase().includes("ceai") ||
                      product.name.toLowerCase().includes("coca") ||
                      product.name.toLowerCase().includes("fanta") ||
                      product.name.toLowerCase().includes("sprite") ||
                      product.name.toLowerCase().includes("dorna")
                    ));
    
    if (!isDrink) {
      if (Array.isArray(product.modifiers) && product.modifiers.length > 0) {
        // DYNAMIC LOGIC: Fetched from Database API
        renderModifierGroups = product.modifiers;
      } else {
        // Fallback to standard 14 items
        renderModifierGroups = STANDARD_FOOD_MODIFIERS;
      }
    }
  }

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setSelectedToppings([]);
      setQuantity(1);
      resetModalPosition();
    } else {
      document.body.style.overflow = "unset";
      resetModalPosition();
    }
    return () => {
      document.body.style.overflow = "unset";
      resetModalPosition();
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
          <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center p-0 md:p-4 lg:p-6 pointer-events-none">
            <motion.div
              ref={modalRef}
              key="modal"
              initial={{ opacity: 0, y: 40, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 120, transition: { duration: 0.2 } }}
              transition={{ type: "spring", damping: 26, stiffness: 320 }}
              className="w-full max-w-full md:max-w-[780px] lg:max-w-[840px] bg-[#FFFFFF] rounded-t-[28px] md:rounded-[24px] shadow-2xl relative overflow-hidden flex flex-col max-h-[90dvh] md:max-h-[min(590px,calc(100dvh-2.5rem))] md:h-[590px] pointer-events-auto border border-[#EAE1DB]/70"
            >
              {/* Interactive Drag Handle for Mobile - Swipe down to dismiss */}
              <div
                onPointerDown={(e) => {
                  startDrag(e.clientY);
                }}
                onTouchStart={(e) => {
                  if (e.touches.length > 0) startDrag(e.touches[0].clientY);
                }}
                onMouseDown={(e) => {
                  startDrag(e.clientY);
                }}
                className="w-full h-11 flex items-center justify-center absolute top-0 left-0 z-40 md:hidden cursor-grab active:cursor-grabbing touch-none select-none group"
              >
                <div className="w-12 h-1.5 bg-white/85 backdrop-blur-md rounded-full shadow-sm transition-all group-active:w-16"></div>
              </div>

              {/* Close Button Mobile (fixed at top-right of dialog, stays pinned over scrolling content) */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Închide fereastra"
                className="md:hidden absolute top-3 right-3 w-10 h-10 min-w-[40px] min-h-[40px] rounded-full bg-white/90 text-[#1A1A1A] backdrop-blur-md flex items-center justify-center hover:bg-white transition-all cursor-pointer z-50 shadow-md border border-black/5"
              >
                <X className="w-4 h-4" />
              </button>

              {/* UNIFIED SCROLLABLE BODY ON MOBILE / TWO-COLUMN LAYOUT ON DESKTOP */}
              <div className="flex-1 overflow-y-auto md:overflow-hidden flex flex-col md:flex-row no-scrollbar min-h-0">
                {/* LEFT COLUMN (Desktop) / TOP SECTION (Mobile): Product Visual & Details */}
                <div className="w-full md:w-[40%] lg:w-[38%] bg-[#FFFFFF] md:bg-[#FDFBF9] border-b md:border-b-0 md:border-r border-[#EAE1DB] flex flex-col shrink-0 md:overflow-y-auto no-scrollbar">
                  {/* Product Image - Large Hero Display (Straus-style) */}
                  {(() => {
                    const isMilkshake = Boolean(product.name && product.name.toLowerCase().includes("shake"));
                    return (
                      <div className={`relative w-full h-[240px] sm:h-[270px] md:h-56 lg:h-64 shrink-0 overflow-hidden ${isMilkshake ? "bg-[#252322]" : "bg-[#F5EFEB]"}`}>
                        <img
                          src={product.img}
                          alt={product.name}
                          className={`w-full h-full object-cover transition-transform duration-500 hover:scale-105 ${
                            isMilkshake ? "object-top origin-top" : "object-center"
                          }`}
                          style={isMilkshake ? { objectPosition: "center 0%" } : undefined}
                        />
                      </div>
                    );
                  })()}

                  {/* Product Details */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-start">
                    <div>
                      <p className="text-[13px] text-[#999999] mb-1 font-normal select-none leading-5">
                        *Produsele din imagine sunt cu titlu de prezentare
                      </p>
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-sans text-[18px] sm:text-[20px] font-bold text-[#1A202C] leading-snug">
                          {product.name}
                        </h3>
                        <span className="font-sans text-[18px] font-bold text-[#D4A373] whitespace-nowrap">
                          {product.price} MDL
                        </span>
                      </div>
                      {product.desc && (
                        <p className="text-[#777777] text-[14px] leading-[21px] mt-1.5">
                          {product.desc}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN (Desktop) / BOTTOM SECTION (Mobile): Customization & Actions */}
                <div className="w-full md:w-[60%] lg:w-[62%] flex flex-col md:overflow-y-auto no-scrollbar bg-white">
                  {/* Desktop Close Button Header */}
                  <div className="hidden md:flex items-center justify-end px-5 pt-3 pb-1 bg-white shrink-0">
                    <button
                      type="button"
                      onClick={onClose}
                      aria-label="Închide fereastra"
                      className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full bg-[#F5EFEB] hover:bg-[#EAE1DB] text-[#1A1A1A] flex items-center justify-center transition-all cursor-pointer shadow-sm"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Toppings Body */}
                  <div className="p-4 md:px-6 md:py-3.5 flex-1 space-y-3">
                  {renderModifierGroups.length > 0 ? (
                    renderModifierGroups.map((group, groupIndex) => (
                      <div key={groupIndex} className="space-y-2">
                        {/* Group Header - Straus: 16px semi-bold */}
                        <div className="flex items-center justify-between pt-1">
                          <h4 className="text-[16px] font-semibold text-[#1A202C] leading-6">
                            {translateTopping(group.title, locale)}
                          </h4>
                          <span className="text-[12px] bg-[#F5EFEB] text-[#777777] px-2 py-0.5 rounded-full font-medium">
                            {t('optional')}
                          </span>
                        </div>

                        {/* Group Options List */}
                        <div className="flex flex-col border border-[#EAE1DB] rounded-[16px] overflow-hidden bg-white shadow-sm">
                          {group.options.map((topping: any, index: number) => {
                            const cleanToppingName = topping.name.replace(/^(Extra|Доп\.)\s+/i, '');
                            const translatedToppingName = translateTopping(cleanToppingName, locale);
                            const isSelected = selectedToppings.some((t) => t.name === topping.name || t.name === cleanToppingName);
                            return (
                              <div
                                key={topping.name}
                                onClick={(e) => toggleTopping(e, { name: cleanToppingName, price: topping.price })}
                                className={`group flex items-center justify-between py-2.5 px-3.5 md:py-3 md:px-4 cursor-pointer transition-all hover:bg-[#FAF8F5] select-none ${
                                  index !== group.options.length - 1 ? "border-b border-[#EAE1DB]" : ""
                                } ${isSelected ? "bg-[#FFFBF5]" : ""}`}
                              >
                                <div className="flex flex-row items-center gap-3">
                                  <div className={`w-5 h-5 rounded-[4px] flex items-center justify-center transition-all border shrink-0 ${
                                    isSelected ? "bg-[#D4A853] border-[#D4A853] shadow-sm" : "border-[#C5BCB1] bg-white"
                                  }`}>
                                    {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                                  </div>
                                  <span className={`text-[16px] leading-6 ${isSelected ? "font-bold text-[#1A202C]" : "font-medium text-[#1A202C]"}`}>
                                    {translatedToppingName}
                                  </span>
                                </div>
                                <span className={`text-[16px] font-medium leading-6 ${isSelected ? "text-[#D4A373] font-bold" : "text-[#777777]"}`}>
                                  (+{topping.price} MDL)
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-[#777777] text-[14px]">
                      {locale === 'ro' ? 'Acest produs nu necesită personalizare.' : locale === 'ru' ? 'Этот товар не требует настройки.' : 'No customization options for this item.'}
                    </div>
                  )}
                </div>
              </div>
            </div>

              {/* Fixed Bottom CTA & Quantity Footer - Straus: Pinned at the bottom outside scroll container */}
              <div className="p-4 md:px-6 md:py-4 border-t border-[#EAE1DB] bg-[#FFFFFF] shrink-0 shadow-[0_-4px_20px_rgba(26,26,26,0.03)] z-30">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[14px] font-medium text-[#777777]">
                    {t('quantity')}
                  </span>
                  <div className="flex items-center bg-[#FFFAF5] border border-[#EAE1DB] rounded-full p-0.5 shadow-inner">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setQuantity((q) => Math.max(1, q - 1));
                      }}
                      className="w-8 h-8 rounded-full bg-[#FFFFFF] text-[#1A202C] flex items-center justify-center hover:bg-[#EAE1DB]/50 transition-colors shadow-sm cursor-pointer border border-[#EAE1DB]"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 md:w-10 text-center font-bold text-[16px] text-[#1A202C]">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setQuantity((q) => q + 1);
                      }}
                      className="w-8 h-8 rounded-full bg-[#FFFFFF] text-[#1A202C] flex items-center justify-center hover:bg-[#EAE1DB]/50 transition-colors shadow-sm cursor-pointer border border-[#EAE1DB]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full min-h-[48px] bg-[#D4A373] hover:bg-[#7D562D] text-white py-3 px-6 rounded-full font-semibold text-[16px] normal-case tracking-normal transition-all duration-300 flex items-center justify-between cursor-pointer shadow-[0_4px_14px_rgba(212,163,115,0.4)] active:scale-[0.98]"
                >
                  <span>{t('addToCart')}</span>
                  <span className="bg-white/20 backdrop-blur-sm text-white px-3.5 py-1 rounded-full text-[15px] font-bold">
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

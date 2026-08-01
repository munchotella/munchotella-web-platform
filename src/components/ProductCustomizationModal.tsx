"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Check, Sparkles } from "lucide-react";
import { useCart, ToppingOption } from "@/context/CartContext";

export type ProductItem = {
  id: number;
  name: string;
  price: number;
  desc?: string;
  img: string;
  category?: string;
};

const AVAILABLE_TOPPINGS: ToppingOption[] = [
  { name: "Extra Nutella®", price: 15 },
  { name: "Extra Ciocolată Albă", price: 15 },
  { name: "Fistic Mărunțit & Sos", price: 20 },
  { name: "Porție de Fructe Fresh", price: 15 },
  { name: "Bilă de Înghețată", price: 20 },
  { name: "Extra Biscuiți Oreo", price: 10 },
  { name: "Extra Alune Prăjite", price: 10 },
];

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
  const [selectedToppings, setSelectedToppings] = useState<ToppingOption[]>([]);
  const [quantity, setQuantity] = useState(1);

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
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <h4 className="text-[16px] font-bold text-[#1A1A1A]">
                    Personalizează-ți desertul
                  </h4>
                  <span className="text-[12px] bg-[#EAE1DB]/50 text-[#50453B] px-2 py-0.5 rounded-full font-medium ml-auto">Opțional</span>
                </div>

                <div className="flex flex-col border border-[#EAE1DB] rounded-[20px] overflow-hidden bg-white mb-6">
                  {AVAILABLE_TOPPINGS.map((topping, index) => {
                    const isSelected = selectedToppings.some((t) => t.name === topping.name);
                    return (
                      <div
                        key={topping.name}
                        onClick={(e) => toggleTopping(e, topping)}
                        className={`group flex items-center justify-between p-4 cursor-pointer transition-colors hover:bg-[#F9F9FB] select-none ${
                          index !== AVAILABLE_TOPPINGS.length - 1 ? "border-b border-[#EAE1DB]" : ""
                        } ${isSelected ? "bg-[#FFFCF6]" : ""}`}
                      >
                        <div className="flex flex-row items-center gap-3">
                          <span className={`text-[17px] ${isSelected ? "font-bold text-[#1A1A1A]" : "font-medium text-[#1A120B]"}`}>
                            {topping.name}
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
            </div>

            {/* Fixed Bottom CTA & Quantity Footer */}
            <div className="p-5 sm:p-6 border-t border-[#EAE1DB] bg-[#FFFFFF] shrink-0 shadow-[0_-4px_20px_rgba(26,26,26,0.03)]">
              <div className="flex items-center justify-between mb-5">
                <span className="text-[15px] font-semibold text-[#50453B]">
                  Cantitate
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
                <span>Adaugă în Coș</span>
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

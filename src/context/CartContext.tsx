"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type ToppingOption = {
  name: string;
  price: number;
};

export type CartItem = {
  cartItemId: string; // Unique identifier (id + selected toppings + customization)
  id: string | number; // Suportă ID-uri Mongoose (string)
  name: string;
  basePrice: number;
  price: number; // Unit price (basePrice + sum(toppings))
  image: string;
  quantity: number;
  selectedToppings?: ToppingOption[];
  customization?: string; // Mentiuni/preferinte client (ex: "Fără arahide")
};

type AddToCartInput = {
  id: string | number;
  name: string;
  price: number; // base price or calculated price
  image: string;
  selectedToppings?: ToppingOption[];
  quantity?: number;
  customization?: string;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (input: AddToCartInput) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  clearCart: () => void;
  replaceCart: (newItems: CartItem[]) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

import { useToast } from "@/context/ToastContext";
import { useTranslations } from "next-intl";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const t = useTranslations("Cart");
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { showToast } = useToast();

  // Load from localStorage or URL query parameters on mount
  useEffect(() => {
    let initialItems: CartItem[] = [];
    const saved = typeof window !== 'undefined' ? localStorage.getItem("munchotella_cart") : null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        initialItems = parsed.map((item: any) => ({
          ...item,
          cartItemId: item.cartItemId || `${item.id}-${(item.selectedToppings || []).map((t: any) => t.name).sort().join('-')}${item.customization ? '-' + item.customization : ''}`,
          basePrice: item.basePrice || item.price,
        }));
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }

    // Auto-hydration from URL params (e.g. from Instagram Bot Link: ?preloadedCart=...&openCart=true)
    if (typeof window !== 'undefined') {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const preloadedParam = urlParams.get('preloadedCart');
        const openCartParam = urlParams.get('openCart');
        const notesParam = urlParams.get('notes');

        if (preloadedParam) {
          let decodedJson = "";
          try {
            decodedJson = decodeURIComponent(escape(atob(preloadedParam)));
          } catch (_) {
            decodedJson = decodeURIComponent(preloadedParam);
          }
          const preloadedList = JSON.parse(decodedJson);
          if (Array.isArray(preloadedList) && preloadedList.length > 0) {
            const formattedPreloaded = preloadedList.map((item: any) => ({
              cartItemId: `${item.id || item.name}-${item.customization || ''}-${Date.now()}`,
              id: item.id || item.name,
              name: item.name,
              basePrice: Number(item.price || item.basePrice || 0),
              price: Number(item.price || item.basePrice || 0),
              image: item.image || "https://cdn.prod.website-files.com/6512d4990c0eb6724e204777/651fb37a2693b04934ff4e38_Nutella%20Mini%20waffles%20100%20lei.png",
              quantity: Number(item.quantity || 1),
              selectedToppings: item.selectedToppings || [],
              customization: item.customization || notesParam || undefined,
            }));
            initialItems = formattedPreloaded;
            localStorage.setItem("munchotella_cart", JSON.stringify(formattedPreloaded));
          }
        }

        if (openCartParam === 'true') {
          setTimeout(() => {
            setIsCartOpen(true);
          }, 400);
        }
      } catch (err) {
        console.error("Error processing preloaded cart from URL:", err);
      }
    }

    setItems(initialItems);
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem("munchotella_cart", JSON.stringify(items));
  }, [items]);

  const addToCart = (input: AddToCartInput) => {
    const toppings = input.selectedToppings || [];
    const toppingsKey = toppings.map((t) => t.name).sort().join("-");
    const custKey = input.customization ? `-${input.customization}` : "";
    const cartItemId = `${input.id}-${toppingsKey}${custKey}`;
    const toppingsCost = toppings.reduce((sum, t) => sum + t.price, 0);
    const unitPrice = input.price + (toppingsCost > 0 && input.price === input.price ? toppingsCost : 0);
    const qty = input.quantity || 1;

    setItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.cartItemId === cartItemId);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + qty,
        };
        return updated;
      }
      return [
        ...prev,
        {
          cartItemId,
          id: input.id,
          name: input.name,
          basePrice: input.price,
          price: unitPrice,
          image: input.image,
          quantity: qty,
          selectedToppings: toppings,
          customization: input.customization,
        },
      ];
    });
    
    // În loc să deschidem tot coșul invaziv, doar arătăm un Toast fluid
    showToast(t('addedToCartToast', { name: input.name }));
  };

  const removeFromCart = (cartItemId: string) => {
    setItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const replaceCart = (newItems: CartItem[]) => {
    setItems(newItems);
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.cartItemId === cartItemId) {
          const newQuantity = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        totalItems,
        totalPrice,
        isCartOpen,
        setIsCartOpen,
        clearCart,
        replaceCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

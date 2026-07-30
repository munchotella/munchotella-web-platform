"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type ToppingOption = {
  name: string;
  price: number;
};

export type CartItem = {
  cartItemId: string; // Unique identifier (id + selected toppings)
  id: string | number; // Suportă ID-uri Mongoose (string)
  name: string;
  basePrice: number;
  price: number; // Unit price (basePrice + sum(toppings))
  image: string;
  quantity: number;
  selectedToppings?: ToppingOption[];
};

type AddToCartInput = {
  id: string | number;
  name: string;
  price: number; // base price or calculated price
  image: string;
  selectedToppings?: ToppingOption[];
  quantity?: number;
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

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { showToast } = useToast();

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("munchotella_cart");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migration helper for old cart items without cartItemId
        const migrated = parsed.map((item: any) => ({
          ...item,
          cartItemId: item.cartItemId || `${item.id}-${(item.selectedToppings || []).map((t: any) => t.name).sort().join('-')}`,
          basePrice: item.basePrice || item.price,
        }));
        setItems(migrated);
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem("munchotella_cart", JSON.stringify(items));
  }, [items]);

  const addToCart = (input: AddToCartInput) => {
    const toppings = input.selectedToppings || [];
    const toppingsKey = toppings.map((t) => t.name).sort().join("-");
    const cartItemId = `${input.id}-${toppingsKey}`;
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
        },
      ];
    });
    
    // În loc să deschidem tot coșul invaziv, doar arătăm un Toast fluid
    showToast(`${input.name} adăugat în coș!`);
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

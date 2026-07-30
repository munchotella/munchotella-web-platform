"use client";

import React from "react";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";
import { GoogleMapsProvider } from "@/context/GoogleMapsContext";
import CartDrawer from "@/components/CartDrawer";
import AuthModal from "@/components/auth/AuthModal";
import ForceChangePasswordModal from "@/components/auth/ForceChangePasswordModal";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <GoogleMapsProvider>
        <AuthProvider>
          <CartProvider>
            {children}
            <CartDrawer />
            <AuthModal />
            <ForceChangePasswordModal />
          </CartProvider>
        </AuthProvider>
      </GoogleMapsProvider>
    </ToastProvider>
  );
}

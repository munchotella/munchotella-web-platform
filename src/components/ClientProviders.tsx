"use client";

import React from "react";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";
import { GoogleMapsProvider } from "@/context/GoogleMapsContext";
import CartDrawer from "@/components/CartDrawer";
import MobileCartBar from "@/components/MobileCartBar";
import AuthModal from "@/components/auth/AuthModal";
import ForceChangePasswordModal from "@/components/auth/ForceChangePasswordModal";
import { initMetaTracking } from "@/utils/metaTracking";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    initMetaTracking();
  }, []);
  return (
    <ToastProvider>
      <GoogleMapsProvider>
        <AuthProvider>
          <CartProvider>
            {children}
            <CartDrawer />
            <MobileCartBar />
            <AuthModal />
            <ForceChangePasswordModal />
          </CartProvider>
        </AuthProvider>
      </GoogleMapsProvider>
    </ToastProvider>
  );
}

"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";

interface Toast {
  id: number;
  message: string;
}

interface ToastContextType {
  showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let toastCount = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string) => {
    const id = ++toastCount;
    setToasts((prev) => [...prev, { id, message }]);
    
    // Auto remove after 3s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-4 sm:bottom-6 left-4 sm:left-auto right-4 sm:right-6 z-[150] flex flex-col gap-2.5 sm:gap-3 pointer-events-none max-w-sm w-auto">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="bg-[#1A120B] text-white px-4 sm:px-5 py-3.5 sm:py-4 rounded-2xl shadow-2xl flex items-center gap-3 pointer-events-auto border border-white/10 w-full sm:w-auto"
            >
              <div className="bg-[#D4A853]/20 text-[#D4A853] p-1.5 rounded-full shrink-0">
                <CheckCircle2 size={18} />
              </div>
              <span className="text-[13px] sm:text-[14px] font-medium mr-2 flex-1">{toast.message}</span>
              <button 
                onClick={() => removeToast(toast.id)}
                aria-label="Închide notificarea"
                className="text-white/40 hover:text-white transition-colors p-1 min-w-[32px] min-h-[32px] flex items-center justify-center cursor-pointer ml-auto shrink-0"
              >
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

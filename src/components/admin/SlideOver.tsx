"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

interface SlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function SlideOver({ isOpen, onClose, title, children }: SlideOverProps) {
  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop with elegant blur */}
      <div 
        className="absolute inset-0 bg-[#1A120B]/20 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Slide Panel */}
      <div 
        className="relative w-full max-w-md h-full bg-[#FAF7F2] border-l border-[#E8E2D9] shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out translate-x-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E8E2D9] bg-[#FFFCF6]">
          <h2 className="font-headline-md text-2xl text-[#1A120B]">{title}</h2>
          <button 
            onClick={onClose}
            className="p-2 text-[#1A120B]/50 hover:text-[#1A120B] hover:bg-[#E8E2D9]/50 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#FAF7F2]">
          {children}
        </div>
      </div>
    </div>
  );
}

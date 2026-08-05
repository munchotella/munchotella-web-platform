"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function Concept2() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", updateMousePosition);
    return () => window.removeEventListener("mousemove", updateMousePosition);
  }, []);

  return (
    <main className="min-h-screen bg-background text-heading font-sans relative overflow-hidden">
      
      {/* Background layer (Colorful Video Placeholder) */}
      <div className="absolute inset-0 w-full h-full bg-[#1A120B]">
        <img 
          src="/fruits_crepe_start.png" 
          alt="Colorful Crepe" 
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
           <h1 className="text-[10rem] font-serif font-bold text-white tracking-tighter mix-blend-overlay">MUNCHOTELLA</h1>
        </div>
      </div>

      {/* Foreground Layer (The Mask) */}
      <motion.div 
        className="absolute inset-0 w-full h-full bg-background flex items-center justify-center pointer-events-none"
        style={{
          WebkitMaskImage: `radial-gradient(circle 250px at ${mousePosition.x}px ${mousePosition.y}px, transparent 100%, black 100%)`,
          maskImage: `radial-gradient(circle 250px at ${mousePosition.x}px ${mousePosition.y}px, transparent 100%, black 100%)`
        }}
        transition={{ type: "tween", ease: "backOut", duration: 0 }}
      >
        <div className="flex flex-col items-center">
          <p className="text-primary font-serif italic text-2xl mb-4">move your mouse to explore</p>
          <h1 className="text-[10rem] font-serif font-bold text-heading tracking-tighter">MUNCHOTELLA</h1>
        </div>
      </motion.div>

    </main>
  );
}

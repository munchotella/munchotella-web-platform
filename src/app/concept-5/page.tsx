"use client";

import React from "react";
import { motion } from "framer-motion";

export default function Concept5() {
  const items = [
    { id: 1, title: "The Fruits Crepe", span: "col-span-2 row-span-2" },
    { id: 2, title: "Mini Waffles", span: "col-span-1 row-span-1" },
    { id: 3, title: "Coffee", span: "col-span-1 row-span-1" },
    { id: 4, title: "Our Story", span: "col-span-2 row-span-1" },
  ];

  return (
    <main className="min-h-screen bg-background text-heading font-sans p-8 flex flex-col items-center">
      
      <header className="w-full max-w-7xl mb-12 flex justify-between items-end">
        <h1 className="text-5xl font-serif font-bold">MUNCHOTELLA</h1>
        <p className="text-foreground">Select your craving</p>
      </header>

      <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[250px]">
        {items.map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`relative rounded-3xl overflow-hidden cursor-pointer group bg-card border border-primary/10 ${item.span}`}
          >
            {/* Image Placeholder (Video ideally) */}
            <img 
              src="/fruits_crepe_start.png" 
              alt={item.title} 
              className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-500"
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            
            <div className="absolute bottom-8 left-8">
              <h2 className="text-3xl font-serif text-white">{item.title}</h2>
              <div className="w-0 h-[2px] bg-primary group-hover:w-full transition-all duration-500 mt-2" />
            </div>
          </motion.div>
        ))}
      </div>

    </main>
  );
}

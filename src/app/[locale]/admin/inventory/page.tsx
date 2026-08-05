"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, PackageX, CheckCircle2, Filter } from "lucide-react";

export default function SmartStockPage() {
  const [items, setItems] = useState([
    { id: 1, name: "Croissant cu Ciocolată", category: "Patiserie", inStock: true, stockCount: 15 },
    { id: 2, name: "Tartă cu Fructe", category: "Desert", inStock: false, stockCount: 0 },
    { id: 3, name: "Cappuccino", category: "Cafea", inStock: true, stockCount: "Nelimitat" },
    { id: 4, name: "Cheesecake", category: "Desert", inStock: true, stockCount: 4 },
  ]);

  const toggleStock = (id: number) => {
    setItems(items.map(item => item.id === id ? { ...item, inStock: !item.inStock } : item));
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)] tracking-tight">Stoc Inteligent</h1>
          <p className="text-[var(--foreground)]/60 mt-1">Gestionează disponibilitatea produselor în timp real pe toate platformele.</p>
        </div>
        <div className="flex bg-[var(--primary)]/10 text-[var(--primary)] px-4 py-2 rounded-xl text-sm font-bold border border-[var(--primary)]/20">
          Sync Activ: App + Web + Instagram
        </div>
      </div>

      <div className="bg-[var(--card)] p-6 rounded-2xl border border-[var(--primary)]/10 shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground)]/40" />
            <input 
              type="text" 
              placeholder="Caută un produs..." 
              className="w-full bg-[var(--background)] border border-[var(--primary)]/10 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] text-[var(--foreground)]"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-[var(--primary)]/20 rounded-xl text-[var(--foreground)]/70 hover:bg-[var(--primary)]/5 transition-colors font-medium text-sm">
            <Filter className="w-4 h-4" />
            Toate Categoriile
          </button>
        </div>

        {/* Table / List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--primary)]/10 text-[var(--foreground)]/50 text-sm">
                <th className="py-3 px-4 font-medium">Produs</th>
                <th className="py-3 px-4 font-medium">Categorie</th>
                <th className="py-3 px-4 font-medium">Stoc Estimat</th>
                <th className="py-3 px-4 font-medium text-right">Disponibilitate Rapidă</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={item.id} 
                  className="border-b border-[var(--primary)]/5 hover:bg-[var(--primary)]/5 transition-colors"
                >
                  <td className="py-4 px-4 font-bold text-[var(--foreground)]">{item.name}</td>
                  <td className="py-4 px-4 text-[var(--foreground)]/70 text-sm">{item.category}</td>
                  <td className="py-4 px-4 text-[var(--foreground)]/70 text-sm">{item.stockCount}</td>
                  <td className="py-4 px-4 text-right">
                    <button 
                      onClick={() => toggleStock(item.id)}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all shadow-sm ${
                        item.inStock 
                          ? "bg-[#FCF9F4] text-[#D4A853] hover:bg-[#F4EBD9] border border-[#E8E2D9]" 
                          : "bg-red-100 text-red-700 hover:bg-red-200 border border-red-200"
                      }`}
                    >
                      {item.inStock ? <CheckCircle2 className="w-4 h-4" /> : <PackageX className="w-4 h-4" />}
                      {item.inStock ? "În Stoc" : "Epuizat"}
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

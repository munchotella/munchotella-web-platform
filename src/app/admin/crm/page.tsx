"use client";

import React from "react";
import { motion } from "framer-motion";
import { Users, Search, Star, MessageCircle, Gift } from "lucide-react";

export default function CRMPage() {
  const clients = [
    { id: 1, name: "Andrei Popa", phone: "+373 60 123 456", orders: 12, totalSpent: "2,450 MDL", lastOrder: "Azi", status: "Fidel" },
    { id: 2, name: "Maria Ionescu", phone: "+373 69 987 654", orders: 5, totalSpent: "850 MDL", lastOrder: "Acum 2 zile", status: "Activ" },
    { id: 3, name: "Ion Vasile", phone: "+373 79 111 222", orders: 1, totalSpent: "120 MDL", lastOrder: "Acum 2 săptămâni", status: "Nou" },
    { id: 4, name: "Elena Rusu", phone: "+373 68 555 444", orders: 24, totalSpent: "5,600 MDL", lastOrder: "Ieri", status: "VIP" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)] tracking-tight">Clienți (Mini-CRM)</h1>
          <p className="text-[var(--foreground)]/60 mt-1">Gestionează baza de clienți, recompensează fidelitatea și crește retenția.</p>
        </div>
      </div>

      <div className="bg-[var(--card)] p-6 rounded-2xl border border-[var(--primary)]/10 shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground)]/40" />
            <input 
              type="text" 
              placeholder="Caută după nume sau telefon..." 
              className="w-full bg-[var(--background)] border border-[var(--primary)]/10 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] text-[var(--foreground)]"
            />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-[var(--background)] border border-[var(--primary)]/20 rounded-xl text-[var(--primary)] font-bold text-sm hover:border-[var(--primary)] transition-colors">
              <Gift className="w-4 h-4" /> Cadou Automat
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-[var(--primary)] rounded-xl text-white font-bold text-sm hover:bg-[var(--color-chocolate)] transition-colors shadow-md">
              <MessageCircle className="w-4 h-4" /> Trimite SMS/Push
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-[var(--primary)]/10 text-[var(--foreground)]/50 text-sm">
                <th className="py-3 px-4 font-medium">Client</th>
                <th className="py-3 px-4 font-medium">Telefon / IG</th>
                <th className="py-3 px-4 font-medium">Comenzi</th>
                <th className="py-3 px-4 font-medium">Total Cheltuit</th>
                <th className="py-3 px-4 font-medium">Ultima Comandă</th>
                <th className="py-3 px-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client, i) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={client.id} 
                  className="border-b border-[var(--primary)]/5 hover:bg-[var(--primary)]/5 transition-colors cursor-pointer"
                >
                  <td className="py-4 px-4 font-bold text-[var(--foreground)] flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center font-bold">
                      {client.name.charAt(0)}
                    </div>
                    {client.name}
                  </td>
                  <td className="py-4 px-4 text-[var(--foreground)]/70 text-sm">{client.phone}</td>
                  <td className="py-4 px-4 text-[var(--foreground)]/70 font-medium">{client.orders}</td>
                  <td className="py-4 px-4 font-bold text-[var(--primary)]">{client.totalSpent}</td>
                  <td className="py-4 px-4 text-[var(--foreground)]/70 text-sm">{client.lastOrder}</td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      client.status === 'VIP' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                      client.status === 'Fidel' ? 'bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20' :
                      'bg-gray-100 text-gray-700 border border-gray-200'
                    }`}>
                      {client.status === 'VIP' && <Star className="w-3 h-3 fill-current" />}
                      {client.status}
                    </span>
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

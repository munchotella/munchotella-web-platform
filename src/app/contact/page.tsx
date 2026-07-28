"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Phone, MapPin, Clock, Send, ShoppingBag, CheckCircle2, ArrowUpRight, MessageSquare, Heart, ThumbsUp, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import { AnimateIn } from "@/components/ui/AnimateIn";
import MapSection from "@/components/MapSection";
export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", phone: "", message: "" });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setFormData({ name: "", phone: "", message: "" });
      setIsSubmitted(false);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1A120B] font-sans selection:bg-[#D4A853] selection:text-white">


      {/* Main Content Layout */}
      <main className="max-w-[1400px] mx-auto px-6 md:px-12 pt-32 pb-16">
        
        {/* Top Section: Info & Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start mb-24">
          
          {/* Left Column: Direct Info */}
          <div className="lg:col-span-5 space-y-10">
            <AnimateIn direction="up">
              <div>
                <span className="text-[11px] font-bold uppercase text-[#D4A853] tracking-widest mb-3 block">Suntem Aici</span>
                <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#1A120B] mb-5 leading-tight">
                  Hai să vorbim.
                </h2>
                <p className="text-[#736A60] font-light text-base leading-relaxed max-w-md">
                  Vino pentru deserturi premium preparate pe loc sau scrie-ne pentru evenimente și comenzi speciale.
                </p>
              </div>
            </AnimateIn>

            <AnimateIn direction="up" delay={0.1}>
              <div className="space-y-4">
                {/* Adresă */}
                <div className="bg-[#FFFCF6] p-6 rounded-2xl border border-[#E8E2D9] shadow-sm hover:border-[#D4A853]/60 transition-all flex items-start gap-5">
                  <div className="w-12 h-12 rounded-full bg-[#D4A853]/10 text-[#D4A853] flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-serif text-lg font-bold text-[#1A120B] mb-1">Adresa Localului</h4>
                    <p className="text-[#736A60] text-sm font-light mb-3">Strada Nicolae Testemițeanu 21/1, Chișinău</p>
                    <a
                      href="https://www.google.com/maps/search/?api=1&query=Munchotella+Strada+Nicolae+Testemi%C8%9Beanu+21%2F1+Chisinau"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[#D4A853] hover:text-[#1A120B] transition-colors"
                    >
                      <span>Deschide Harta</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
                {/* Info Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                  <div className="bg-[#FFFCF6] p-6 rounded-2xl border border-[#E8E2D9] shadow-sm flex flex-col items-start gap-4 hover:border-[#D4A853]/60 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-[#1A120B]/5 text-[#1A120B] flex items-center justify-center">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[#736A60] text-xs uppercase tracking-widest font-bold mb-1">Telefon & Email</p>
                      <a href="tel:079006499" className="font-serif text-lg font-bold text-[#1A120B] hover:text-[#D4A853] transition-colors block">
                        079 006 499
                      </a>
                      <a href="mailto:munchotella@gmail.com" className="text-[#736A60] text-sm hover:text-[#D4A853] transition-colors mt-1 block">
                        munchotella@gmail.com
                      </a>
                    </div>
                  </div>
                  
                  <div className="bg-[#FFFCF6] p-6 rounded-2xl border border-[#E8E2D9] shadow-sm flex flex-col items-start gap-4 hover:border-[#D4A853]/60 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-[#1A120B]/5 text-[#1A120B] flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[#736A60] text-xs uppercase tracking-widest font-bold mb-1">Program</p>
                      <p className="font-serif text-[15px] font-bold text-[#1A120B]">
                        Luni - Duminică: 16:00 - 00:00
                      </p>
                      <p className="text-[#D4A853] text-[13px] font-bold mt-1">Miercuri: Închis</p>
                    </div>
                  </div>
                </div>
              </div>
            </AnimateIn>
          </div>
          
          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <AnimateIn direction="up" delay={0.15}>
              <div className="bg-[#FFFCF6] p-8 md:p-10 rounded-3xl border border-[#E8E2D9] shadow-md h-full flex flex-col justify-center">
                <div className="mb-8">
                  <h3 className="font-serif text-3xl font-bold text-[#1A120B] mb-2">Suntem Aici</h3>
                  <p className="text-[#736A60] font-light text-sm">
                    Fie că vrei o comandă mai mare pentru o petrecere sau doar ai o întrebare, scrie-ne și îți răspundem cât mai repede!
                  </p>
                </div>

                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-[#FCF9F4] border border-[#E8E2D9] text-[#D4A853] p-8 rounded-2xl text-center space-y-3 my-4"
                  >
                    <CheckCircle2 className="w-12 h-12 text-[#D4A853] mx-auto" />
                    <h4 className="font-serif text-2xl font-bold">Mesaj Trimis!</h4>
                    <p className="text-sm font-light">Echipa Munchotella va reveni în cel mai scurt timp posibil.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-widest text-[#736A60] mb-2 pl-1">Nume Complet</label>
                        <input
                          type="text"
                          required
                          placeholder="Numele tău"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full bg-white border border-[#E8E2D9] rounded-2xl px-5 py-4 outline-none focus:border-[#D4A853] focus:ring-1 focus:ring-[#D4A853] transition-all text-[#1A120B] text-sm shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-widest text-[#736A60] mb-2 pl-1">Număr Telefon</label>
                        <input
                          type="tel"
                          required
                          placeholder="079 000 000"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full bg-white border border-[#E8E2D9] rounded-2xl px-5 py-4 outline-none focus:border-[#D4A853] focus:ring-1 focus:ring-[#D4A853] transition-all text-[#1A120B] text-sm shadow-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-widest text-[#736A60] mb-2 pl-1">Mesaj</label>
                      <textarea
                        rows={4}
                        required
                        placeholder="Scrie mesajul tău..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full bg-white border border-[#E8E2D9] rounded-2xl p-5 outline-none focus:border-[#D4A853] focus:ring-1 focus:ring-[#D4A853] transition-all text-[#1A120B] text-sm shadow-sm resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-[#1A120B] hover:bg-[#D4A853] text-[#FFFDF8] hover:text-[#1A120B] font-bold text-[13px] uppercase tracking-widest py-4 rounded-2xl transition-all duration-300 min-h-[56px] flex items-center justify-center gap-3 cursor-pointer shadow-md"
                    >
                      <span>Trimite Mesajul</span>
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>
            </AnimateIn>
          </div>
        </div>

        {/* Social Media Showcase (Bento Grid) */}
        <AnimateIn direction="up" delay={0.2}>
          <div className="mb-24 pt-8 border-t border-[#E8E2D9]/60">
            <div className="text-center mb-10">
              <span className="text-[11px] font-bold uppercase text-[#D4A853] tracking-widest mb-3 block">Comunitatea Noastră</span>
              <h3 className="font-serif text-3xl font-bold text-[#1A120B]">Munchotella pe Social Media</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              
              {/* Instagram Screenshot Card */}
              <a href="https://www.instagram.com/munchotella.md/" target="_blank" rel="noopener noreferrer" className="block cursor-pointer group relative rounded-3xl overflow-hidden aspect-[4/5] bg-gradient-to-br from-[#f09433] via-[#e6683c] to-[#bc1888] p-1 hover:-translate-y-2 transition-all duration-500 shadow-md hover:shadow-xl">
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10" />
                <div className="w-full h-full bg-[#1A120B] rounded-[22px] overflow-hidden relative">
                  <img src="https://cdn.prod.website-files.com/6512d4990c0eb6724e204777/651fb3799de38d298ead5916_Waffle%20sticks%2095%20lei.png" alt="Instagram" className="w-full h-full object-cover opacity-70 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700" />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A120B] via-transparent to-transparent z-20 flex flex-col justify-between p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 to-fuchsia-600 p-[2px]">
                        <div className="w-full h-full bg-[#1A120B] rounded-full border border-black flex items-center justify-center font-serif text-white font-bold text-xs">M</div>
                      </div>
                      <span className="text-white font-bold text-sm drop-shadow-md">@munchotella.md</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-white">
                        <Heart className="w-6 h-6 fill-white text-white" />
                        <MessageSquare className="w-6 h-6 text-white" />
                        <Send className="w-6 h-6 text-white" />
                      </div>
                      <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white text-[10px] font-bold tracking-widest uppercase border border-white/30 hover:bg-white hover:text-black transition-colors">Urmărește</div>
                    </div>
                  </div>
                </div>
              </a>

              {/* TikTok Screenshot Card */}
              <a href="https://www.tiktok.com/@munchotella" target="_blank" rel="noopener noreferrer" className="block cursor-pointer group relative rounded-3xl overflow-hidden aspect-[4/5] bg-black p-1 hover:-translate-y-2 transition-all duration-500 shadow-md hover:shadow-xl">
                <div className="w-full h-full rounded-[22px] overflow-hidden relative border border-white/10">
                  <img src="https://cdn.prod.website-files.com/6512d4990c0eb6724e204777/651fb37a95a6d8f14054865f_Delux%20mini%20waffle%20110%20lei.png" alt="TikTok" className="w-full h-full object-cover opacity-70 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700" />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/40 z-20 flex flex-col justify-between p-6">
                    <div className="flex justify-between items-start">
                       <span className="text-white font-bold text-sm drop-shadow-md flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm">
                         <span className="text-[#00f2fe] font-serif font-black tracking-tighter text-lg leading-none">T</span>
                         TikTok
                       </span>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <span className="text-white font-bold text-sm drop-shadow-md">@munchotella</span>
                      <p className="text-white/90 text-xs line-clamp-2 leading-relaxed">Procesul nostru de preparare ✨ Cel mai bun desert din Chișinău! #waffles</p>
                      <div className="mt-3 flex items-center gap-3">
                         <div className="bg-[#fe2c55] px-5 py-2 rounded-full text-white text-[10px] font-bold tracking-widest uppercase shadow-md hover:bg-[#e0264b] transition-colors">Urmărește</div>
                      </div>
                    </div>
                  </div>
                </div>
              </a>

              {/* Facebook Card */}
              <a href="https://www.facebook.com/munchotella" target="_blank" rel="noopener noreferrer" className="block cursor-pointer group relative rounded-3xl overflow-hidden aspect-[4/5] bg-gradient-to-br from-[#1877F2] to-[#0E5A99] p-1 hover:-translate-y-2 transition-all duration-500 shadow-md hover:shadow-xl">
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10" />
                <div className="w-full h-full bg-[#1A120B] rounded-[22px] overflow-hidden relative">
                  <img src="https://cdn.prod.website-files.com/6512d4990c0eb6724e204777/651fc347c507e0f40eb6c49c_Delux%20crepe%20120%20lei.png" alt="Facebook" className="w-full h-full object-cover opacity-70 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700" />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A120B] via-[#1A120B]/40 to-transparent z-20 flex flex-col justify-between p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white p-[2px]">
                        <div className="w-full h-full bg-[#1877F2] rounded-full flex items-center justify-center font-serif text-white font-bold text-xl leading-none pt-1 pr-0.5">f</div>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-white font-bold text-sm drop-shadow-md leading-tight">Munchotella</span>
                        <span className="text-white/80 text-[10px]">Restaurant de deserturi</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-4 text-white">
                        <ThumbsUp className="w-6 h-6 text-white" />
                        <MessageSquare className="w-6 h-6 text-white" />
                        <Share2 className="w-6 h-6 text-white" />
                      </div>
                      <div className="bg-[#1877F2] px-4 py-2 rounded-full text-white text-[10px] font-bold tracking-widest uppercase shadow-md hover:bg-[#166fe5] transition-colors">Urmărește</div>
                    </div>
                  </div>
                </div>
              </a>
              
            </div>
          </div>
        </AnimateIn>

      </main>

      {/* Map Embed Section at Bottom (Full Width) */}
      <AnimateIn direction="up">
        <MapSection />
      </AnimateIn>
    </div>
  );
}

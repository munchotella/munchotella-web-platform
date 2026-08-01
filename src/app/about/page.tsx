"use client";

import React from "react";
import Link from "next/link";
import { AnimateIn } from "@/components/ui/AnimateIn";
import MagneticButton from "@/components/ui/MagneticButton";

export default function AboutPage() {
  return (
    <div className="bg-[#fcf9f4] text-[#1c1c19] font-sans antialiased overflow-x-hidden selection:bg-[#d4af37] selection:text-white">

      {/* Cinematic Hero Section */}
      <section className="relative h-[80vh] md:h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 w-full h-full z-0">
          {/* We will use a high-end luxury dark image placeholder for the kitchen atmosphere */}
          <div className="absolute inset-0 bg-black/80 z-10" />
          <img 
            src="/dubai_pistachio_crepe_ref.png" 
            alt="Munchotella Dubai Pistachio Crepe" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto mt-20">
          <AnimateIn direction="up">
            <span className="text-[12px] font-bold uppercase text-[#d4af37] tracking-[0.2em] mb-6 block">Povestea Noastră</span>
          </AnimateIn>
          <AnimateIn direction="up" delay={0.2}>
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-normal text-white mb-6 tracking-tight leading-[1.1]">
              Pasiune pentru <br/> Gustul Autentic
            </h1>
          </AnimateIn>
          <AnimateIn direction="up" delay={0.4}>
            <p className="text-white/90 text-lg md:text-xl max-w-2xl mx-auto font-sans font-light leading-relaxed">
              Ne-am propus să aducem în Chișinău acel gust pe care să-l ții minte. Pregătim fiecare waffle și clătită de la zero, în fiecare dimineață, din dorința simplă de a-ți oferi un desert sincer, cald și delicios.
            </p>
          </AnimateIn>
        </div>
      </section>

      {/* Story Section: Authentic Ingredients */}
      <section className="py-24 md:py-32 bg-[#fcf9f4]">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center">
            <AnimateIn direction="left">
              <div className="relative h-[500px] md:h-[700px] w-full overflow-hidden rounded-sm border border-[#e5e2dd]">
                <img 
                  src="/Crepe_served_on_white_plate_202607191727.jpeg" 
                  alt="Crepe Served" 
                  className="w-full h-full object-cover"
                />
              </div>
            </AnimateIn>
            
            <AnimateIn direction="right">
              <div>
                <span className="text-[12px] font-bold uppercase text-[#93a67f] tracking-widest mb-4 block">Fără scurtături</span>
                <h2 className="font-serif text-4xl md:text-5xl font-medium text-[#3d3028] mb-8 leading-[1.2]">
                  Ingrediente pe bune și aluat proaspăt
                </h2>
                <div className="space-y-6 text-[16px] text-[#4e4540] font-sans leading-relaxed">
                  <p>
                    Nu ne zgârcim când vine vorba de calitatea ingredientelor. Pentru crema de fistic, am ales să aducem fistic autentic din Sicilia, fără arome artificiale sau coloranți, tocmai pentru a păstra acel gust natural și bogat.
                  </p>
                  <p>
                    De asemenea, preparăm aluatul proaspăt în fiecare dimineață, chiar în locația noastră. Nu folosim prafuri la sac sau pre-mixuri cu apă. Facem totul după rețeta noastră proprie, cu ouă, lapte și multă răbdare.
                  </p>
                </div>
              </div>
            </AnimateIn>
          </div>
        </div>
      </section>

      {/* Meet the Pastry Chef */}
      <section className="py-24 md:py-32 bg-[#ffffff] border-y border-[#e5e2dd]">
        <div className="max-w-[1000px] mx-auto px-4 md:px-8 text-center">
          <AnimateIn direction="up">
            <span className="text-[12px] font-bold uppercase text-[#d4af37] tracking-widest mb-4 block">Echipa Noastră</span>
            <h2 className="font-serif text-4xl md:text-5xl font-medium text-[#3d3028] mb-16 leading-[1.2]">
              Oamenii din spatele Munchotella
            </h2>
          </AnimateIn>
          
          <AnimateIn direction="up" delay={0.2}>
            <div className="relative w-48 h-48 md:w-64 md:h-64 mx-auto mb-10 overflow-hidden rounded-full border-4 border-[#fcf9f4] shadow-2xl shadow-black/10">
              <img 
                src="/fruits_crepe_start.png" 
                alt="Munchotella Fruits Crepe" 
                className="w-full h-full object-cover"
              />
            </div>
          </AnimateIn>
          
          <AnimateIn direction="up" delay={0.3}>
            <blockquote className="font-serif text-2xl md:text-3xl text-[#1c1c19] italic mb-8 max-w-3xl mx-auto leading-normal">
              "Munchotella s-a născut dintr-o poftă simplă de a mânca un desert cu adevărat bun, cu multă ciocolată și ingrediente de calitate. Nu am vrut să reinventăm roata, am vrut doar să facem cel mai bun waffle pe care l-ai mâncat vreodată."
            </blockquote>
            <p className="text-[12px] font-bold uppercase text-[#4e4540] tracking-widest">
              — Familia Munchotella
            </p>
          </AnimateIn>
        </div>
      </section>

      {/* Minimalist Timeline */}
      <section className="py-24 md:py-32 bg-[#fcf9f4]">
        <div className="max-w-[800px] mx-auto px-4 md:px-8">
          <AnimateIn direction="up">
            <div className="text-center mb-20">
              <h2 className="font-serif text-4xl font-medium text-[#3d3028]">Evoluția Munchotella</h2>
            </div>
          </AnimateIn>

          <div className="space-y-16 border-l border-[#d2c4bd] pl-8 md:pl-12 ml-4 md:ml-0 relative">
            <AnimateIn direction="up" delay={0.1}>
              <div className="relative">
                <div className="absolute -left-[41px] md:-left-[57px] top-1 w-4 h-4 rounded-full bg-[#d4af37] border-4 border-[#fcf9f4]"></div>
                <span className="text-[12px] font-bold text-[#d4af37] tracking-widest mb-2 block">2023</span>
                <h3 className="font-serif text-2xl font-bold text-[#1c1c19] mb-3">Cum ne-a venit ideea</h3>
                <p className="text-[16px] text-[#4e4540] leading-relaxed">
                  Totul a început simplu: ne-am dat seama că în Chișinău e greu să găsești o clătită cu adevărat bună, plină de ciocolată originală, nu doar cu creme ieftine și diluate.
                </p>
              </div>
            </AnimateIn>

            <AnimateIn direction="up" delay={0.2}>
              <div className="relative">
                <div className="absolute -left-[41px] md:-left-[57px] top-1 w-4 h-4 rounded-full bg-[#d4af37] border-4 border-[#fcf9f4]"></div>
                <span className="text-[12px] font-bold text-[#d4af37] tracking-widest mb-2 block">2024</span>
                <h3 className="font-serif text-2xl font-bold text-[#1c1c19] mb-3">Primele rețete</h3>
                <p className="text-[16px] text-[#4e4540] leading-relaxed">
                  Au urmat luni de zile petrecute în bucătărie, stricând kilograme întregi de aluat, până când am găsit proporția perfectă pentru ca waffla să iasă ușor crocantă la exterior, dar foarte pufoasă în interior.
                </p>
              </div>
            </AnimateIn>

            <AnimateIn direction="up" delay={0.3}>
              <div className="relative">
                <div className="absolute -left-[41px] md:-left-[57px] top-1 w-4 h-4 rounded-full bg-[#3d3028] border-4 border-[#fcf9f4]"></div>
                <span className="text-[12px] font-bold text-[#3d3028] tracking-widest mb-2 block">Astăzi</span>
                <h3 className="font-serif text-2xl font-bold text-[#1c1c19] mb-3">Azi la Munchotella</h3>
                <p className="text-[16px] text-[#4e4540] leading-relaxed">
                  Te așteptăm în locația noastră, unde pregătim fiecare comandă pe loc, exact în fața ta. Misiunea noastră a rămas aceeași: să-ți facem ziua mai dulce, cu un desert corect.
                </p>
              </div>
            </AnimateIn>
          </div>
          
          <div className="mt-24 text-center">
            <Link href="/menu">
              <MagneticButton className="bg-[#55463E] text-white text-[12px] font-bold uppercase tracking-widest px-8 py-4 hover:bg-[#3d3028] transition-colors duration-300">
                Vezi Meniul Nostru
              </MagneticButton>
            </Link>
          </div>
        </div>
      </section>



    </div>
  );
}

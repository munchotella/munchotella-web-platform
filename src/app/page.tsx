"use client";

import React from "react";
import CinematicScrollHero from "@/components/CinematicScrollHero";
import { AnimateIn } from "@/components/ui/AnimateIn";
import MagneticButton from "@/components/ui/MagneticButton";
import ScrollyTellingProcess from "@/components/ui/ScrollyTellingProcess";
import MapSection from "@/components/MapSection";

import { Star } from "lucide-react";
import StickyBottomBar from "@/components/StickyBottomBar";
import { useCart } from "@/context/CartContext";

import ProductCustomizationModal, { ProductItem } from "@/components/ProductCustomizationModal";
import ProductCard from "@/components/ProductCard";
import LiveStoreStatus from "@/components/LiveStoreStatus";

export default function MunchotellaBoutique() {
  const { addToCart } = useCart();
  const [selectedProduct, setSelectedProduct] = React.useState<ProductItem | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const handleOpenCustomization = (item: any) => {
    setSelectedProduct({
      id: item.id,
      name: item.name,
      price: typeof item.price === "number" ? item.price : parseFloat(item.price),
      desc: item.desc,
      img: item.img,
    });
    setIsModalOpen(true);
  };

  return (
    <div className="bg-background text-on-background font-sans antialiased selection:bg-accent-gold selection:text-white">
      <ProductCustomizationModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <StickyBottomBar />

      {/* Hero Section */}
      <CinematicScrollHero />

      {/* Info Banner Ribbon */}
      <div className="bg-[#1A120B] text-[#D4A853] py-4 border-y border-[#D4A853]/20 relative z-20 shadow-lg">
        <div className="max-w-[1200px] mx-auto px-4 flex flex-wrap items-center justify-center gap-6 md:gap-12 text-xs font-bold uppercase tracking-widest text-center">
          <div className="flex items-center space-x-2.5">
            <span className="material-symbols-outlined text-sm text-[#D4A853]">location_on</span>
            <span className="text-[#FFFDF8]">Strada Nicolae Testemițeanu 21/1, Chișinău</span>
          </div>
          <span className="hidden md:inline text-white/30">•</span>
          <LiveStoreStatus />
          <span className="hidden md:inline text-white/30">•</span>
          <div className="flex items-center space-x-2.5">
            <span className="material-symbols-outlined text-sm text-[#D4A853]">star</span>
            <span className="text-[#FFFDF8]">4.4 ★ Evaluare pe Google Maps</span>
          </div>
        </div>
      </div>

      {/* Menu Preview Section */}
      <section className="py-24 md:py-32 bg-[#FAF7F2] relative z-10" id="menu">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8">
          <AnimateIn direction="up">
            <div className="text-center mb-16">
              <span className="text-[12px] font-bold uppercase text-[#D4A853] tracking-widest mb-2 block">Ai poftă de ceva cu adevărat bun?</span>
              <h2 className="font-serif text-4xl md:text-5xl font-semibold text-primary">Preferatele Clienților Noștri</h2>
            </div>
          </AnimateIn>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <AnimateIn direction="up" delay={0.1} className="h-full">
              <ProductCard
                item={{
                  id: 20,
                  name: "Delux Crepe",
                  price: 165,
                  desc: "Clătită fină franțuzească umplută generos cu Nutella®, ciocolată albă belgiană, Oreo, biscuiți Lotus, arahide și Kinder Bueno.",
                  img: "https://cdn.prod.website-files.com/6512d4990c0eb6724e204777/651fc347c507e0f40eb6c49c_Delux%20crepe%20120%20lei.png",
                  badge: "Top Seller",
                }}
                onSelect={handleOpenCustomization}
              />
            </AnimateIn>

            <AnimateIn direction="up" delay={0.2} className="h-full">
              <ProductCard
                item={{
                  id: 2,
                  name: "Delux Mini Waffle",
                  price: 160,
                  desc: "16 mini waffles fragede stropite cu Nutella® caldă, ciocolată albă belgiană și toppinguri la alegere (Oreo & Kinder Bueno).",
                  img: "https://cdn.prod.website-files.com/6512d4990c0eb6724e204777/651fb37a95a6d8f14054865f_Delux%20mini%20waffle%20110%20lei.png",
                  badge: "Specialitatea Casei",
                }}
                onSelect={handleOpenCustomization}
              />
            </AnimateIn>

            <AnimateIn direction="up" delay={0.3} className="h-full">
              <ProductCard
                item={{
                  id: 4,
                  name: "Lotus Mini Waffle",
                  price: 200,
                  desc: "Mini waffles fragede scufundate în crema fină Lotus Biscoff caramelizată și presărate cu biscuiți crocanți sfărâmați.",
                  img: "https://cdn.prod.website-files.com/6512d4990c0eb6724e204777/651fb37a1dbf645960e17923_Lotus%20mini%20waffle%20105%20lei.png",
                }}
                onSelect={handleOpenCustomization}
              />
            </AnimateIn>
          </div>
          
          <div className="mt-16 text-center">
            <a href="/menu" className="inline-flex items-center justify-center space-x-2 border-b-2 border-primary text-primary text-[14px] font-bold uppercase tracking-wider hover:text-[#D4A853] hover:border-[#D4A853] transition-colors duration-300 pb-1">
              <span>Vezi tot meniul</span>
              <span className="material-symbols-outlined text-sm">arrow_outward</span>
            </a>
            
            {/* Features Section (Scrollytelling Editorial Process) */}
            </div>
          </div>
        </section>
        
        <ScrollyTellingProcess />

      {/* Testimonials Section (Real Google Maps Scraped Reviews) */}
      <section className="py-24 md:py-32 bg-[#FAF7F2] relative z-10" id="testimonials">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 text-center">
          <AnimateIn direction="up">

            <h2 className="font-serif text-4xl md:text-5xl font-medium text-[#1A120B] mb-16">Ce spun clienții noștri pe Google</h2>
          </AnimateIn>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
            {/* Review 1 */}
            <AnimateIn direction="up" delay={0.1}>
              <div className="bg-white p-6 rounded-2xl border border-[#1A120B]/10 relative h-full flex flex-col hover:border-[#D4A853] transition-all duration-300 shadow-sm hover:shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#D4A853] text-[#D4A853]" />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-[#1A120B]/40 uppercase tracking-widest">Google Review</span>
                </div>
                <p className="text-[#1A120B]/80 font-medium text-[15px] leading-relaxed mb-6 italic flex-grow">
                  "Absolutely best ☺️ No dieting here ✊ It was my first time trying pure Nutella based desserts and I love it so much also I recommend their iced mint lemonade too..."
                </p>
                <div className="mt-auto pt-4 border-t border-[#1A120B]/10 flex items-center justify-between">
                  <div>
                    <p className="text-[#1A120B] font-bold text-[14px]">Dr. Nawar</p>
                    <p className="text-[#D4A853] text-[11px] uppercase tracking-widest font-semibold">Local Guide • Google Maps</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#D4A853]/20 text-[#D4A853] flex items-center justify-center font-bold text-xs">
                    DN
                  </div>
                </div>
              </div>
            </AnimateIn>

            {/* Review 2 */}
            <AnimateIn direction="up" delay={0.2}>
              <div className="bg-white p-6 rounded-2xl border border-[#1A120B]/10 relative h-full flex flex-col hover:border-[#D4A853] transition-all duration-300 shadow-sm hover:shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#D4A853] text-[#D4A853]" />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-[#1A120B]/40 uppercase tracking-widest">Google Review</span>
                </div>
                <p className="text-[#1A120B]/80 font-medium text-[15px] leading-relaxed mb-6 italic flex-grow">
                  "I tried the Waffle delux, and it was heavenly - crisp on the outside, fluffy inside, and generously topped!! Staff is super friendly. Loved the experience!"
                </p>
                <div className="mt-auto pt-4 border-t border-[#1A120B]/10 flex items-center justify-between">
                  <div>
                    <p className="text-[#1A120B] font-bold text-[14px]">Krishna Rajendran</p>
                    <p className="text-[#D4A853] text-[11px] uppercase tracking-widest font-semibold">Client Verificat • Google</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#D4A853]/20 text-[#D4A853] flex items-center justify-center font-bold text-xs">
                    KR
                  </div>
                </div>
              </div>
            </AnimateIn>

            {/* Review 3 */}
            <AnimateIn direction="up" delay={0.3}>
              <div className="bg-white p-6 rounded-2xl border border-[#1A120B]/10 relative h-full flex flex-col hover:border-[#D4A853] transition-all duration-300 shadow-sm hover:shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#D4A853] text-[#D4A853]" />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-[#1A120B]/40 uppercase tracking-widest">Google Review</span>
                </div>
                <p className="text-[#1A120B]/80 font-medium text-[15px] leading-relaxed mb-6 italic flex-grow">
                  "Very great place. From all Chișinău, this is the place with the best sweet food. Waffle exotic and Nutella mini waffles are the best!"
                </p>
                <div className="mt-auto pt-4 border-t border-[#1A120B]/10 flex items-center justify-between">
                  <div>
                    <p className="text-[#1A120B] font-bold text-[14px]">Rusu Victoria</p>
                    <p className="text-[#D4A853] text-[11px] uppercase tracking-widest font-semibold">Client Chișinău • Google</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#D4A853]/20 text-[#D4A853] flex items-center justify-center font-bold text-xs">
                    RV
                  </div>
                </div>
              </div>
            </AnimateIn>

            {/* Review 4 */}
            <AnimateIn direction="up" delay={0.4}>
              <div className="bg-white p-6 rounded-2xl border border-[#1A120B]/10 relative h-full flex flex-col hover:border-[#D4A853] transition-all duration-300 shadow-sm hover:shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#D4A853] text-[#D4A853]" />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-[#1A120B]/40 uppercase tracking-widest">Google Review</span>
                </div>
                <p className="text-[#1A120B]/80 font-medium text-[15px] leading-relaxed mb-6 italic flex-grow">
                  "The most delicious place in chisinau, Luv it !!! I advice everyone to try it, Best service with lovely manager and workers 🥰"
                </p>
                <div className="mt-auto pt-4 border-t border-[#1A120B]/10 flex items-center justify-between">
                  <div>
                    <p className="text-[#1A120B] font-bold text-[14px]">Tatiana Moraru</p>
                    <p className="text-[#D4A853] text-[11px] uppercase tracking-widest font-semibold">Client Chișinău • Google</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#D4A853]/20 text-[#D4A853] flex items-center justify-center font-bold text-xs">
                    TM
                  </div>
                </div>
              </div>
            </AnimateIn>
          </div>

          <div className="mt-12 text-center">
            <a 
              href="https://www.google.com/maps/search/?api=1&query=Munchotella+Strada+Nicolae+Testemi%C8%9Beanu+21%2F1+Chisinau" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-3 bg-[#D4A853] hover:bg-[#C09640] text-[#1A120B] font-bold text-xs uppercase tracking-widest px-8 py-4 rounded-full transition-all duration-300 shadow-xl cursor-pointer min-h-[44px] hover:scale-105"
            >
              <span>Lasă o Notă de 5 Stele pe Google Maps</span>
              <div className="flex space-x-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-[#1A120B] text-[#1A120B]" />
                ))}
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <MapSection />


    </div>
  );
}

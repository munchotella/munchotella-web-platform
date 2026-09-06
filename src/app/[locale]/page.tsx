"use client";

import React from "react";
import CinematicScrollHero from "@/components/CinematicScrollHero";
import { AnimateIn } from "@/components/ui/AnimateIn";
import MagneticButton from "@/components/ui/MagneticButton";
import ScrollyTellingProcess from "@/components/ui/ScrollyTellingProcess";
import MapSection from "@/components/MapSection";

import { Star, MapPin, ArrowUpRight } from "lucide-react";
import StickyBottomBar from "@/components/StickyBottomBar";
import { useCart } from "@/context/CartContext";

import ProductCustomizationModal, { ProductItem } from "@/components/ProductCustomizationModal";
import ProductCard from "@/components/ProductCard";
import LiveStoreStatus from "@/components/LiveStoreStatus";
import { useTranslations } from "next-intl";

export default function MunchotellaBoutique() {
  const t = useTranslations("Homepage");
  const { addToCart } = useCart();
  const [selectedProduct, setSelectedProduct] = React.useState<ProductItem | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const [featuredItems, setFeaturedItems] = React.useState<any[]>([
    {
      id: 20,
      name: "Delux Crepe",
      price: 165,
      desc: t('deluxCrepeDesc'),
      img: "https://cdn.prod.website-files.com/6512d4990c0eb6724e204777/651fc347c507e0f40eb6c49c_Delux%20crepe%20120%20lei.png",
      badge: t('badgeTopSeller'),
      rawCategory: "crepes"
    },
    {
      id: 2,
      name: "Delux Mini Waffle",
      price: 160,
      desc: t('deluxWaffleDesc'),
      img: "https://cdn.prod.website-files.com/6512d4990c0eb6724e204777/651fb37a95a6d8f14054865f_Delux%20mini%20waffle%20110%20lei.png",
      badge: t('badgeSpecialty'),
      rawCategory: "waffles"
    },
    {
      id: 4,
      name: "Lotus Mini Waffle",
      price: 200,
      desc: t('lotusMiniWaffleDesc'),
      img: "https://cdn.prod.website-files.com/6512d4990c0eb6724e204777/651fb37a1dbf645960e17923_Lotus%20mini%20waffle%20105%20lei.png",
      rawCategory: "waffles"
    }
  ]);

  React.useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch("https://munchotella-api.onrender.com/api/menu");
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          const liveDeluxCrepe = data.data.find((i: any) => i.name.toLowerCase().includes("delux crepe"));
          const liveDeluxWaffle = data.data.find((i: any) => i.name.toLowerCase().includes("delux mini waffle"));
          const liveLotusWaffle = data.data.find((i: any) => i.name.toLowerCase().includes("lotus mini waffle"));
          
          const newFeatured = [];
          if (liveDeluxCrepe) newFeatured.push({ ...liveDeluxCrepe, id: liveDeluxCrepe._id, img: liveDeluxCrepe.imageUrl || liveDeluxCrepe.image, badge: t('badgeTopSeller'), rawCategory: liveDeluxCrepe.category });
          else newFeatured.push(featuredItems[0]);

          if (liveDeluxWaffle) newFeatured.push({ ...liveDeluxWaffle, id: liveDeluxWaffle._id, img: liveDeluxWaffle.imageUrl || liveDeluxWaffle.image, badge: t('badgeSpecialty'), rawCategory: liveDeluxWaffle.category });
          else newFeatured.push(featuredItems[1]);

          if (liveLotusWaffle) newFeatured.push({ ...liveLotusWaffle, id: liveLotusWaffle._id, img: liveLotusWaffle.imageUrl || liveLotusWaffle.image, rawCategory: liveLotusWaffle.category });
          else newFeatured.push(featuredItems[2]);

          setFeaturedItems(newFeatured);
        }
      } catch (err) {}
    };
    fetchFeatured();
  }, [t]);

  const handleOpenCustomization = (item: any) => {
    setSelectedProduct({
      id: item.id,
      name: item.name,
      price: typeof item.price === "number" ? item.price : parseFloat(item.price),
      desc: item.desc || item.description,
      img: item.img,
      category: item.category,
      rawCategory: item.rawCategory,
      modifiers: item.modifiers,
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

      {/* Hero Section */}
      <CinematicScrollHero />

      {/* Info Banner Ribbon */}
      <div className="bg-[#1A120B] text-[#D4A853] py-4 border-y border-[#D4A853]/20 relative z-20 shadow-lg">
        <div className="max-w-[1400px] mx-auto px-4 flex flex-col lg:flex-row lg:flex-nowrap lg:whitespace-nowrap items-center justify-center gap-4 lg:gap-8 text-[11px] lg:text-xs font-bold uppercase tracking-widest text-center">
          <div className="flex items-center space-x-2.5">
            <MapPin className="w-3.5 h-3.5 text-[#D4A853] shrink-0" />
            <span className="text-[#FFFDF8]">{t('location')}</span>
          </div>
          <span className="hidden md:inline text-white/30">•</span>
          <LiveStoreStatus />
          <span className="hidden md:inline text-white/30">•</span>
          <div className="flex items-center space-x-2.5">
            <Star className="w-3.5 h-3.5 text-[#D4A853] fill-[#D4A853] shrink-0" />
            <span className="text-[#FFFDF8]">{t('rating')}</span>
          </div>
        </div>
      </div>

      {/* Menu Preview Section */}
      <section className="py-24 md:py-32 bg-[#FAF7F2] relative z-10" id="menu">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8">
          <AnimateIn direction="up">
            <div className="text-center mb-16">
              <span className="text-[12px] font-bold uppercase text-[#D4A853] tracking-widest mb-2 block">{t('craving')}</span>
              <h2 className="font-serif text-4xl md:text-5xl font-semibold text-primary">{t('favorites')}</h2>
            </div>
          </AnimateIn>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredItems.map((item, index) => (
              <AnimateIn key={item.id} direction="up" delay={0.1 * (index + 1)} className="h-full">
                <ProductCard
                  item={item}
                  onSelect={handleOpenCustomization}
                />
              </AnimateIn>
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <a href="/menu" className="inline-flex items-center justify-center space-x-2 border-b-2 border-primary text-primary text-[14px] font-bold uppercase tracking-wider hover:text-[#D4A853] hover:border-[#D4A853] transition-colors duration-300 pb-1">
              <span>{t('viewMenu')}</span>
              <ArrowUpRight className="w-4 h-4" />
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

            <h2 className="font-serif text-4xl md:text-5xl font-medium text-[#1A120B] mb-16">{t('reviewsTitle')}</h2>
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
                  {t('review1Text')}
                </p>
                <div className="mt-auto pt-4 border-t border-[#1A120B]/10 flex items-center justify-between">
                  <div>
                    <p className="text-[#1A120B] font-bold text-[14px]">Dr. Nawar</p>
                    <p className="text-[#D4A853] text-[11px] uppercase tracking-widest font-semibold">{t('verified')}</p>
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
                  {t('review2Text')}
                </p>
                <div className="mt-auto pt-4 border-t border-[#1A120B]/10 flex items-center justify-between">
                  <div>
                    <p className="text-[#1A120B] font-bold text-[14px]">Krishna Rajendran</p>
                    <p className="text-[#D4A853] text-[11px] uppercase tracking-widest font-semibold">{t('verified')}</p>
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
                  {t('review3Text')}
                </p>
                <div className="mt-auto pt-4 border-t border-[#1A120B]/10 flex items-center justify-between">
                  <div>
                    <p className="text-[#1A120B] font-bold text-[14px]">Rusu Victoria</p>
                    <p className="text-[#D4A853] text-[11px] uppercase tracking-widest font-semibold">{t('verified')}</p>
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
                  {t('review4Text')}
                </p>
                <div className="mt-auto pt-4 border-t border-[#1A120B]/10 flex items-center justify-between">
                  <div>
                    <p className="text-[#1A120B] font-bold text-[14px]">Tatiana Moraru</p>
                    <p className="text-[#D4A853] text-[11px] uppercase tracking-widest font-semibold">{t('verified')}</p>
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
              <span>{t('leaveReviewBtn')}</span>
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

      {/* Static Mobile Cart Action (previously StickyBottomBar) */}
      <StickyBottomBar />

    </div>
  );
}

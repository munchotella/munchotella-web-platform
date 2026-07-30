"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { ShoppingBag, ChevronLeft, Star, Leaf, Droplets } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import MagneticButton from "@/components/ui/MagneticButton";

// Mock database
const products = {
  "crepe-dubai": {
    id: "crepe-dubai",
    name: "Crepe Dubai",
    price: 265,
    description: "O experiență culinară de lux. Clătită franțuzească fină, umplută cu o cascadă generoasă de cremă pură de fistic sicilian 100% și cataif crocant. O textură divină ce îmbină catifelarea fisticului cu un crunch inconfundabil.",
    image: "/images/crepe-dubai.jpg", // placeholder for real image
    bgImage: "/images/hero-pistachio.jpg",
    ingredients: ["Clătită fină", "Cremă de fistic 100%", "Cataif crocant", "Ciocolată belgiană"],
    story: "Inspirat din inima emiratelor, Crepe Dubai este mai mult decât un desert — este o capodoperă a texturilor. Folosim fistic recoltat manual din Sicilia, măcinat lent pentru a păstra uleiurile esențiale care îi dau culoarea verde smarald și gustul intens.",
    rating: 4.9,
    reviews: 128
  },
  "lotus-waffle": {
    id: "lotus-waffle",
    name: "Lotus Mini Waffle",
    price: 160,
    description: "Mini waffles pufoase la interior și crocante la exterior, înecate în untură caramelizată de Lotus Biscoff și ciocolată albă belgiană.",
    image: "/images/lotus-waffle.jpg",
    bgImage: "/images/hero-lotus.jpg",
    ingredients: ["Aluat proaspăt", "Pastă Lotus Biscoff", "Ciocolată albă", "Biscuiți fărâmițați"],
    story: "Secretul nostru stă în aluatul lăsat la dospit peste noapte și copt exact 3 minute. Când pasta caldă de biscuiți atinge waffle-ul fierbinte, se creează acea peliculă caramelizată perfectă.",
    rating: 4.8,
    reviews: 94
  }
};

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart, setIsCartOpen } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch
    const id = typeof params?.id === 'string' ? params.id : '';
    const found = (products as any)[id];
    
    setTimeout(() => {
      setProduct(found || products["crepe-dubai"]); // Fallback for demo
      setLoading(false);
    }, 500);
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFCF6] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#D4A853] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=600&auto=format&fit=crop" // Mock image
    });
  };

  return (
    <main className="min-h-screen bg-[#FFFCF6]">
      <Navbar />
      
      {/* Editorial Hero Section */}
      <section className="relative pt-20 lg:pt-0 lg:min-h-screen flex flex-col lg:flex-row">
        
        {/* Left: Product Info (Sticky on Desktop) */}
        <div className="w-full lg:w-1/2 p-8 md:p-16 lg:p-24 flex flex-col justify-center bg-[#FFFCF6] z-10">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#1A120B]/60 hover:text-[#D4A853] transition-colors mb-12 w-fit"
          >
            <ChevronLeft size={20} />
            <span className="font-medium text-sm tracking-wide uppercase">Înapoi la meniu</span>
          </button>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 text-[#D4A853] mb-4">
              <Star size={16} fill="currentColor" />
              <span className="font-bold">{product.rating}</span>
              <span className="text-[#1A120B]/40 text-sm">({product.reviews} recenzii)</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-serif text-[#1A120B] mb-6 leading-tight">
              {product.name}
            </h1>
            
            <p className="text-2xl text-[#D4A853] font-bold mb-8">
              {product.price} MDL
            </p>

            <p className="text-lg text-[#1A120B]/70 leading-relaxed mb-10 max-w-lg">
              {product.description}
            </p>

            <MagneticButton 
              onClick={handleAddToCart}
              className="w-full md:w-auto px-10 py-5 bg-[#1A120B] text-white rounded-full font-bold text-lg hover:bg-[#D4A853] transition-colors group"
            >
              <ShoppingBag size={22} className="group-hover:-translate-y-1 transition-transform" />
              <span>Adaugă în coș</span>
            </MagneticButton>
          </motion.div>
        </div>

        {/* Right: Immersive Image Gallery */}
        <div className="w-full lg:w-1/2 min-h-[50vh] lg:min-h-screen relative overflow-hidden bg-[#1A120B]">
          <motion.div
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute inset-0"
          >
            {/* Using a rich placeholder image for demo since we don't have local assets mounted */}
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=1200&auto=format&fit=crop')` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A120B] via-transparent to-transparent opacity-80"></div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Storytelling Section */}
      <section className="py-24 bg-[#1A120B] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
        <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center relative z-10">
          
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-4xl md:text-5xl font-serif text-[#FDF9F1]">Povestea Texturilor</h2>
            <p className="text-white/70 text-lg leading-relaxed">
              {product.story}
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-6"
          >
            <div className="bg-white/5 border border-white/10 p-8 rounded-[32px] backdrop-blur-sm text-center">
              <Leaf size={32} className="text-[#D4A853] mx-auto mb-4" />
              <h4 className="font-bold text-lg mb-2">Ingrediente Premium</h4>
              <p className="text-sm text-white/50">Fără compromisuri la calitate.</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-8 rounded-[32px] backdrop-blur-sm text-center mt-8">
              <Droplets size={32} className="text-[#D4A853] mx-auto mb-4" />
              <h4 className="font-bold text-lg mb-2">Preparare Manuală</h4>
              <p className="text-sm text-white/50">Fiecare desert este creat pe loc.</p>
            </div>
          </motion.div>

        </div>
      </section>

      <Footer />
    </main>
  );
}

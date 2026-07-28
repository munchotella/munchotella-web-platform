"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function Concept4() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const floatTextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: wrapperRef.current,
        start: "top top",
        end: "+=200%",
        scrub: 1,
        pin: true,
      }
    });

    // Parallax layering
    tl.to(imageRef.current, { y: -200, scale: 1.1 }, 0)
      .to(textRef.current, { y: 150, opacity: 0 }, 0)
      .to(floatTextRef.current, { y: -400, opacity: 1 }, 0);

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <main className="bg-background text-heading font-sans">
      <div ref={wrapperRef} className="h-screen w-full relative overflow-hidden flex items-center justify-center">
        
        {/* Background Layer */}
        <h1 ref={textRef} className="absolute z-0 text-[12vw] font-serif font-bold text-card-foreground/10 whitespace-nowrap">
          PREMIUM DESSERTS
        </h1>

        {/* Middle Layer (Product) */}
        <img 
          ref={imageRef}
          src="/fruits_crepe_start.png" 
          alt="Product" 
          className="relative z-10 w-[600px] h-auto rounded-full mix-blend-multiply"
        />

        {/* Foreground Layer (Floating Text) */}
        <div ref={floatTextRef} className="absolute z-20 top-[100vh] opacity-0 flex flex-col items-center">
          <p className="text-primary font-serif italic text-3xl">Unmatched Quality</p>
          <button className="mt-8 bg-heading text-background px-8 py-3 rounded-full uppercase tracking-widest text-sm hover:bg-primary transition-colors">
            Order Now
          </button>
        </div>

      </div>
    </main>
  );
}

"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function Concept1() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoWrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Pin the whole section
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: "+=150%",
        pin: true,
        scrub: true,
        animation: gsap.timeline()
          .to(videoWrapperRef.current, {
            scale: 0.4,
            borderRadius: "2rem",
            y: "-10vh",
            duration: 1,
            ease: "power2.inOut"
          })
          .to(titleRef.current, {
            opacity: 0,
            y: -50,
            duration: 0.5
          }, "<")
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground font-sans">
      <div ref={containerRef} className="h-screen w-full relative flex items-center justify-center overflow-hidden">
        
        {/* Background that shrinks */}
        <div ref={videoWrapperRef} className="absolute inset-0 w-full h-full bg-black z-0 overflow-hidden transform-origin-center">
          <img 
            src="/fruits_crepe_start.png" 
            alt="Cinematic Video Placeholder"
            className="w-full h-full object-cover opacity-60"
          />
        </div>

        {/* Foreground Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full pointer-events-none">
          <h1 ref={titleRef} className="text-6xl md:text-[8rem] font-serif font-medium text-white tracking-tighter mix-blend-overlay">
            MUNCHOTELLA
          </h1>
        </div>

      </div>

      <section className="h-screen bg-background flex flex-col items-center justify-center p-12">
        <h2 className="text-4xl font-serif text-heading mb-6">The Menu Revealed</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
          {[1,2,3].map((i) => (
            <div key={i} className="aspect-square bg-card rounded-3xl border border-primary/10 flex items-center justify-center">
              Item {i}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

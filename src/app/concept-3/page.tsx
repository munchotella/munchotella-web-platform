"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function Concept3() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoSideRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top",
      end: "bottom bottom",
      pin: videoSideRef.current,
    });

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <main ref={containerRef} className="bg-background text-heading font-sans relative flex">
      
      {/* Left Side: Scrolling Content */}
      <div className="w-1/2 min-h-screen py-32 px-16 flex flex-col gap-[50vh]">
        
        <section className="h-screen flex flex-col justify-center">
          <p className="text-primary font-serif italic text-2xl mb-4">Chapter 1</p>
          <h1 className="text-7xl font-serif font-bold mb-8">The Art of the Crepe</h1>
          <p className="text-xl text-foreground max-w-md leading-relaxed">
            Every morning, we fold perfection. Our crepes are made with organic flour and farm-fresh eggs, delivering an authentic Parisian experience right to your door.
          </p>
        </section>

        <section className="h-screen flex flex-col justify-center">
          <p className="text-primary font-serif italic text-2xl mb-4">Chapter 2</p>
          <h1 className="text-7xl font-serif font-bold mb-8">Mini Waffles</h1>
          <p className="text-xl text-foreground max-w-md leading-relaxed">
            Bite-sized luxury. Drizzled in warm Belgian chocolate and topped with fresh strawberries and 100% Sicilian pistachio.
          </p>
        </section>
        
        <section className="h-screen flex flex-col justify-center">
          <h1 className="text-5xl font-serif font-bold mb-8 text-primary">Place your order</h1>
        </section>

      </div>

      {/* Right Side: Sticky Visual (Video Placeholder) */}
      <div className="w-1/2">
        <div ref={videoSideRef} className="h-screen w-full relative overflow-hidden bg-black">
          <img 
            src="/fruits_crepe_start.png" 
            alt="Cinematic View" 
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/30" />
        </div>
      </div>

    </main>
  );
}

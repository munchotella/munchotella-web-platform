"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const steps = [
  {
    num: "01",
    title: "Ciocolată Autentică",
    desc: "Nu facem compromisuri la gust. Folosim doar Nutella® originală, Kinder, Oreo și fructe tăiate fix înainte de livrare pentru o experiență intensă și inconfundabilă.",
  },
  {
    num: "02",
    title: "Frământat Manual",
    desc: "Lăsăm aluatul la maturat în fiecare dimineață pentru a ne asigura că primești acea crustă crocantă la exterior și textura irezistibil de pufoasă la interior.",
  },
  {
    num: "03",
    title: "Ajunge la tine cald",
    desc: "Ambalajele noastre termice protejează desertul pe drum, ca tu să te bucuri de el exact așa cum l-am scos noi din aparat, proaspăt și aburind.",
  },
];

export default function ScrollyTellingProcess() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Step 1 mappings
  const opacity1 = useTransform(scrollYProgress, [0, 0.1, 0.25, 0.3], [0, 1, 1, 0]);
  const y1 = useTransform(scrollYProgress, [0, 0.1, 0.25, 0.3], [50, 0, 0, -50]);
  const scale1 = useTransform(scrollYProgress, [0, 0.1, 0.25, 0.3], [0.9, 1, 1, 1.1]);

  // Step 2 mappings
  const opacity2 = useTransform(scrollYProgress, [0.3, 0.4, 0.55, 0.6], [0, 1, 1, 0]);
  const y2 = useTransform(scrollYProgress, [0.3, 0.4, 0.55, 0.6], [50, 0, 0, -50]);
  const scale2 = useTransform(scrollYProgress, [0.3, 0.4, 0.55, 0.6], [0.9, 1, 1, 1.1]);

  // Step 3 mappings
  const opacity3 = useTransform(scrollYProgress, [0.6, 0.7, 0.85, 0.95], [0, 1, 1, 0]);
  const y3 = useTransform(scrollYProgress, [0.6, 0.7, 0.85, 0.95], [50, 0, 0, -50]);
  const scale3 = useTransform(scrollYProgress, [0.6, 0.7, 0.85, 0.95], [0.9, 1, 1, 1.1]);

  // Background video zoom effect for cinematic feel
  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const videoBlur = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], ["blur(0px)", "blur(4px)", "blur(4px)", "blur(0px)"]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0.4, 0.7, 0.7, 0.4]);

  // Video Opacity Cross-fading
  const vid1Opacity = useTransform(scrollYProgress, [0, 0.3, 0.4, 1], [1, 1, 0, 0]);
  const vid2Opacity = useTransform(scrollYProgress, [0, 0.3, 0.4, 0.6, 0.7, 1], [0, 0, 1, 1, 0, 0]);
  const vid3Opacity = useTransform(scrollYProgress, [0, 0.6, 0.7, 1], [0, 0, 1, 1]);

  return (
    <section ref={containerRef} className="relative h-[400vh] w-full bg-[#1A120B]">
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        
        {/* Background Video Layer 1 - Ciocolata */}
        <motion.div 
          className="absolute inset-0 w-full h-full z-0"
          style={{ opacity: vid1Opacity, scale: videoScale, filter: videoBlur }}
        >
          <video autoPlay loop muted playsInline className="w-full h-full object-cover object-center">
            {/* Fallback to process video if step1.mp4 is missing */}
            <source src="/videos/step1.mp4" type="video/mp4" onError={(e) => (e.currentTarget.src = "/videos/munchotella_philosophy_process.mp4")} />
          </video>
        </motion.div>

        {/* Background Video Layer 2 - Framantat */}
        <motion.div 
          className="absolute inset-0 w-full h-full z-0"
          style={{ opacity: vid2Opacity, scale: videoScale, filter: videoBlur }}
        >
          <video autoPlay loop muted playsInline className="w-full h-full object-cover object-center">
            <source src="/videos/step2.mp4" type="video/mp4" onError={(e) => (e.currentTarget.src = "/videos/munchotella_philosophy_process.mp4")} />
          </video>
        </motion.div>

        {/* Background Video Layer 3 - Cald */}
        <motion.div 
          className="absolute inset-0 w-full h-full z-0"
          style={{ opacity: vid3Opacity, scale: videoScale, filter: videoBlur }}
        >
          <video autoPlay loop muted playsInline className="w-full h-full object-cover object-center">
            <source src="/videos/step3.mp4" type="video/mp4" onError={(e) => (e.currentTarget.src = "/videos/munchotella_philosophy_process.mp4")} />
          </video>
        </motion.div>

        {/* Dynamic Dark Overlay for text readability */}
        <motion.div 
          className="absolute inset-0 bg-[#1A120B] z-10"
          style={{ opacity: overlayOpacity }}
        />
        
        {/* Progress Line Indicator */}
        <div className="absolute left-6 md:left-12 top-1/2 -translate-y-1/2 h-[40vh] w-[2px] bg-white/10 z-30 hidden md:block rounded-full overflow-hidden">
          <motion.div 
            className="w-full bg-[#D4A853]"
            style={{ height: "100%", scaleY: scrollYProgress, transformOrigin: "top" }}
          />
        </div>

        {/* Content Container */}
        <div className="relative z-20 w-full max-w-[1000px] px-6 mx-auto h-full flex flex-col items-center justify-center text-center">
          
          <div className="absolute top-24 md:top-32 w-full text-center left-0 right-0 z-30">
             <motion.h2 
               className="font-serif text-3xl md:text-5xl font-bold text-[#FFFDF8]"
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
             >
               Cum preparăm desertul tău?
             </motion.h2>
          </div>

          <div className="relative w-full flex items-center justify-center flex-grow">
            
            {/* STEP 1 */}
            <motion.div 
              className="absolute inset-0 flex flex-col items-center justify-center px-4"
              style={{ opacity: opacity1, y: y1, scale: scale1 }}
            >
              <span className="font-serif text-7xl md:text-9xl font-bold text-[#D4A853]/20 mb-6 drop-shadow-2xl tracking-tighter block">{steps[0].num}</span>
              <h3 className="font-serif text-4xl md:text-6xl font-bold text-[#FFFDF8] mb-6 tracking-tight drop-shadow-lg">{steps[0].title}</h3>
              <p className="text-lg md:text-2xl text-white/80 leading-relaxed font-light max-w-2xl drop-shadow-md">
                {steps[0].desc}
              </p>
            </motion.div>

            {/* STEP 2 */}
            <motion.div 
              className="absolute inset-0 flex flex-col items-center justify-center px-4"
              style={{ opacity: opacity2, y: y2, scale: scale2 }}
            >
              <span className="font-serif text-7xl md:text-9xl font-bold text-[#D4A853]/20 mb-6 drop-shadow-2xl tracking-tighter block">{steps[1].num}</span>
              <h3 className="font-serif text-4xl md:text-6xl font-bold text-[#FFFDF8] mb-6 tracking-tight drop-shadow-lg">{steps[1].title}</h3>
              <p className="text-lg md:text-2xl text-white/80 leading-relaxed font-light max-w-2xl drop-shadow-md">
                {steps[1].desc}
              </p>
            </motion.div>

            {/* STEP 3 */}
            <motion.div 
              className="absolute inset-0 flex flex-col items-center justify-center px-4"
              style={{ opacity: opacity3, y: y3, scale: scale3 }}
            >
              <span className="font-serif text-7xl md:text-9xl font-bold text-[#D4A853]/20 mb-6 drop-shadow-2xl tracking-tighter block">{steps[2].num}</span>
              <h3 className="font-serif text-4xl md:text-6xl font-bold text-[#FFFDF8] mb-6 tracking-tight drop-shadow-lg">{steps[2].title}</h3>
              <p className="text-lg md:text-2xl text-white/80 leading-relaxed font-light max-w-2xl drop-shadow-md">
                {steps[2].desc}
              </p>
            </motion.div>

          </div>
        </div>

      </div>
    </section>
  );
}

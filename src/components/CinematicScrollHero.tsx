"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import MagneticButton from "@/components/ui/MagneticButton";

const HERO_PLAYLIST = [
  {
    src: "/videos/mini_waffle_video_hero.mp4",
    poster: "/delux_mini_waffle_official.png",
    title: "Delux Mini Waffles",
    subtitle: "Pufoase, Nutella, Fistic & Oreo"
  },
  {
    src: "/Munchotella_Commercial_1785537195299.mp4",
    poster: "/royal_sushi_official.png",
    title: "Royal Sushi Banana",
    subtitle: "Clătite Subțiri, Nutella & Fructe Proaspete"
  },
  {
    src: "/videos/waffles_biscoff.mp4",
    poster: "/lotus_biscoff_waffle_ref.png",
    title: "Delux & Lotus Mini Waffles",
    subtitle: "Pastă Biscoff Caramelizată & Ciocolată Albă"
  }
];

export default function CinematicScrollHero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  const currentTrack = HERO_PLAYLIST[currentTrackIndex];

  const handleVideoEnded = () => {
    setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % HERO_PLAYLIST.length);
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch((err) => {
        console.warn("Video playback autoplay blocked/ready:", err);
      });
    }
  }, [currentTrackIndex]);

  return (
    <section className="relative bg-[#1A120B] h-screen w-full overflow-hidden flex flex-col items-center justify-center">
      {/* Background Video Layer with Seamless Playlist */}
      <div className="absolute inset-0 w-full h-full z-0">
        <video
          ref={videoRef}
          key={currentTrack.src}
          autoPlay
          muted
          playsInline
          preload="auto"
          poster={currentTrack.poster}
          onEnded={handleVideoEnded}
          className="w-full h-full object-cover object-center opacity-90 transition-opacity duration-700"
        >
          <source src={currentTrack.src} type="video/mp4" />
        </video>

        {/* UI Safe Zone Gradient Overlay (Dark Left Vignette for Text Legibility) */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1A120B]/95 via-[#1A120B]/55 to-transparent w-full md:w-3/5 pointer-events-none z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A120B] via-transparent to-[#1A120B]/40 pointer-events-none z-10" />
      </div>

      {/* Hero UI Content (Left Aligned for Optimal UI Safe Zone) */}
      <div className="relative z-20 max-w-[1200px] w-full mx-auto px-6 md:px-12 h-full flex flex-col justify-center text-left pt-20">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } },
          }}
          className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-[68px] font-bold tracking-tight text-[#FFFDF8] leading-[1.1] max-w-2xl mb-6"
        >
          <div className="overflow-hidden pb-2">
            <motion.div
              variants={{
                hidden: { y: "100%", rotateZ: 3, opacity: 0 },
                visible: { y: 0, rotateZ: 0, opacity: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
              }}
            >
              Artă dulce,
            </motion.div>
          </div>
          <div className="overflow-hidden pb-2 mt-2">
            <motion.div
              variants={{
                hidden: { y: "100%", rotateZ: 3, opacity: 0 },
                visible: { y: 0, rotateZ: 0, opacity: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
              }}
              className="italic font-normal text-[#D4A853]"
            >
              preparată cu pasiune
            </motion.div>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, filter: "blur(10px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ delay: 1, duration: 1, ease: "easeOut" }}
          className="text-[#E8E2D9] text-base md:text-lg max-w-lg leading-relaxed mb-8 font-light"
        >
          Waffles și clătite proaspăt preparate cu ingrediente premium — Nutella®, Kinder Bueno, Lotus Biscoff și fructe proaspete.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="flex flex-wrap items-center gap-4"
        >
          <MagneticButton>
            <a
              href="#menu"
              className="bg-[#D4A853] hover:bg-[#C09640] text-[#1A120B] font-bold text-sm uppercase tracking-wider px-8 py-4 rounded-full transition-all duration-300 shadow-xl shadow-[#D4A853]/20 flex items-center space-x-2 group cursor-pointer"
            >
              <span>Descoperă Meniul</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </MagneticButton>
        </motion.div>
      </div>

      {/* Playlist Indicator */}
      {HERO_PLAYLIST.length > 1 && (
        <div className="absolute bottom-8 right-8 z-20 flex items-center space-x-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
          {HERO_PLAYLIST.map((track, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentTrackIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentTrackIndex ? "w-8 bg-[#D4A853]" : "w-2 bg-white/40 hover:bg-white/70"
              }`}
              aria-label={`Select shot ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* Smooth Transition Mask to Body */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#FAF7F2] to-transparent z-20 pointer-events-none" />
    </section>
  );
}

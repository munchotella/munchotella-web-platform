"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import MagneticButton from "@/components/ui/MagneticButton";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

const HERO_PLAYLIST = [
  {
    src: "/videos/hero_waffle_v2.mp4",
    poster: "/images/posters/hero_waffle_poster.webp",
    titleKey: "video1Title",
    subtitleKey: "video1Subtitle"
  },
  {
    src: "/videos/hero_sushi_v2.mp4",
    poster: "/images/posters/hero_sushi_poster.webp",
    titleKey: "video2Title",
    subtitleKey: "video2Subtitle"
  },
  {
    src: "/videos/hero_biscoff_v2.mp4",
    poster: "/images/posters/hero_biscoff_poster.webp",
    titleKey: "video3Title",
    subtitleKey: "video3Subtitle"
  }
];

export default function CinematicScrollHero() {
  const t = useTranslations("Hero");
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const currentTrackIndexRef = useRef(0);
  const [pendingTrackIndex, setPendingTrackIndex] = useState<number | null>(null);
  const [isAutoplayBlocked, setIsAutoplayBlocked] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const switchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    currentTrackIndexRef.current = currentTrackIndex;
  }, [currentTrackIndex]);

  // Double-Buffered Seamless Frame-Ready Swap
  const switchToTrack = (nextIndex: number) => {
    if (nextIndex === currentTrackIndex) return;

    const nextVideo = videoRefs.current[nextIndex];
    if (!nextVideo) {
      setCurrentTrackIndex(nextIndex);
      return;
    }

    // Set pending state to update UI indicator immediately
    setPendingTrackIndex(nextIndex);

    // Prepare incoming video in background (behind active video)
    nextVideo.muted = true;
    nextVideo.defaultMuted = true;
    if (nextVideo.preload !== "auto") {
      nextVideo.preload = "auto";
    }
    nextVideo.currentTime = 0;

    let swapped = false;
    const triggerSwap = () => {
      if (swapped) return;
      swapped = true;

      nextVideo.removeEventListener("timeupdate", checkFrameReady);
      nextVideo.removeEventListener("playing", triggerSwap);

      const prevIndex = currentTrackIndex;
      setCurrentTrackIndex(nextIndex);
      setPendingTrackIndex(null);

      // Gracefully pause previous videos only AFTER crossfade completes (750ms)
      if (switchTimeoutRef.current) clearTimeout(switchTimeoutRef.current);
      switchTimeoutRef.current = setTimeout(() => {
        videoRefs.current.forEach((vid, idx) => {
          if (vid && idx !== nextIndex) {
            vid.pause();
          }
        });
      }, 750);
    };

    const checkFrameReady = () => {
      // Incoming video has actively rendered frames: safe to swap!
      if (nextVideo.currentTime > 0.05) {
        triggerSwap();
      }
    };

    nextVideo.addEventListener("timeupdate", checkFrameReady);
    nextVideo.addEventListener("playing", triggerSwap);

    const playPromise = nextVideo.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn("Incoming track play warning:", err);
        // Fallback swap if browser blocked play
        setTimeout(triggerSwap, 300);
      });
    }

    // Safety fallback: if timeupdate doesn't fire within 1.2s, swap anyway
    setTimeout(triggerSwap, 1200);
  };

  const handleVideoEnded = (idx: number) => {
    if (idx === currentTrackIndex) {
      const nextIndex = (currentTrackIndex + 1) % HERO_PLAYLIST.length;
      switchToTrack(nextIndex);
    }
  };

  const handleManualUnlock = () => {
    const activeVideo = videoRefs.current[currentTrackIndex] || videoRefs.current[0];
    if (activeVideo) {
      activeVideo.muted = true;
      activeVideo.defaultMuted = true;
      activeVideo.play().then(() => {
        setIsAutoplayBlocked(false);
      }).catch((err) => {
        console.warn("Manual unlock failed:", err);
      });
    }
  };

  useEffect(() => {
    let unmounted = false;

    // 1. Initial attempt to play track 0
    const firstVideo = videoRefs.current[0];
    if (firstVideo) {
      firstVideo.muted = true;
      firstVideo.defaultMuted = true;
      const playPromise = firstVideo.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            if (!unmounted) setIsAutoplayBlocked(false);
          })
          .catch((err) => {
            console.warn("Initial autoplay blocked by cellular policy:", err);
            if (!unmounted) setIsAutoplayBlocked(true);
          });
      }
    }

    // 2. Health check: if after 1.5s video is still paused, show fallback pill
    const healthCheckTimer = setTimeout(() => {
      const activeVideo = videoRefs.current[0];
      if (activeVideo && activeVideo.paused && !unmounted) {
        setIsAutoplayBlocked(true);
      }
    }, 1500);

    // 3. Persistent User Activation listener (taps, clicks, pointerdown)
    const handleUserInteraction = () => {
      const activeVideo = videoRefs.current[currentTrackIndexRef.current] || videoRefs.current[0];
      if (activeVideo && activeVideo.paused) {
        activeVideo.muted = true;
        activeVideo.defaultMuted = true;
        activeVideo.play().then(() => {
          if (!unmounted) setIsAutoplayBlocked(false);
          cleanupListeners();
        }).catch(() => {
          // Keep listener until user gesture satisfies policy
        });
      } else if (activeVideo && !activeVideo.paused) {
        if (!unmounted) setIsAutoplayBlocked(false);
        cleanupListeners();
      }
    };

    const cleanupListeners = () => {
      window.removeEventListener("pointerdown", handleUserInteraction);
      window.removeEventListener("touchend", handleUserInteraction);
      window.removeEventListener("click", handleUserInteraction);
    };

    window.addEventListener("pointerdown", handleUserInteraction, { passive: true });
    window.addEventListener("touchend", handleUserInteraction, { passive: true });
    window.addEventListener("click", handleUserInteraction, { passive: true });

    // 4. Predictive pre-buffering: 4s after mount, preload metadata for track 1
    const bufferTimer = setTimeout(() => {
      if (videoRefs.current[1] && videoRefs.current[1].preload !== "auto") {
        videoRefs.current[1].preload = "metadata";
      }
    }, 4000);

    return () => {
      unmounted = true;
      clearTimeout(healthCheckTimer);
      clearTimeout(bufferTimer);
      if (switchTimeoutRef.current) clearTimeout(switchTimeoutRef.current);
      cleanupListeners();
    };
  }, []);

  return (
    <section className="relative bg-[#1A120B] min-h-[100dvh] h-[100dvh] w-full overflow-hidden flex flex-col items-center justify-center">
      {/* Background Video Layer with Double-Buffered Zero-Glitch Swap */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
        {HERO_PLAYLIST.map((track, idx) => {
          const isActive = idx === currentTrackIndex;
          const isPending = idx === pendingTrackIndex;

          return (
            <video
              key={track.src}
              src={track.src}
              ref={(el) => {
                videoRefs.current[idx] = el;
              }}
              autoPlay={idx === 0}
              muted
              defaultMuted
              playsInline
              preload={idx === 0 ? "auto" : "none"}
              poster={idx === 0 ? track.poster : undefined}
              onEnded={() => handleVideoEnded(idx)}
              className={`absolute inset-0 w-full h-full object-cover object-center pointer-events-none transition-opacity duration-700 ${
                isActive
                  ? "opacity-90 z-10"
                  : "opacity-0 z-0 pointer-events-none"
              }`}
            />
          );
        })}

        {/* UI Safe Zone Gradient Overlay (Dark Left Vignette for Text Legibility) */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1A120B]/95 via-[#1A120B]/55 to-transparent w-full md:w-3/5 pointer-events-none z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A120B] via-transparent to-[#1A120B]/40 pointer-events-none z-10" />
      </div>

      {/* Autoplay Cellular Fallback Badge */}
      <AnimatePresence>
        {isAutoplayBlocked && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 12 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-24 sm:bottom-12 left-6 sm:left-12 z-30"
          >
            <button
              onClick={handleManualUnlock}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-black/70 backdrop-blur-md border border-[#D4A853]/60 text-[#FAF7F2] text-xs uppercase tracking-wider font-semibold shadow-xl shadow-black/50 cursor-pointer hover:bg-black/90 transition-all hover:scale-105"
            >
              <span className="w-2 h-2 rounded-full bg-[#D4A853] animate-ping" />
              <Play className="w-3.5 h-3.5 text-[#D4A853] fill-[#D4A853]" />
              <span>{t('tapToPlay')}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero UI Content (Left Aligned for Optimal UI Safe Zone) */}
      <div className="relative z-20 max-w-[1200px] w-full mx-auto px-5 sm:px-6 md:px-12 h-full flex flex-col justify-center text-left pt-16 sm:pt-20">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
          }}
          className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-[68px] font-bold tracking-tight text-[#FFFDF8] leading-[1.1] max-w-2xl mb-4 sm:mb-6"
        >
          <div className="overflow-hidden pb-1 sm:pb-2">
            <motion.div
              variants={{
                hidden: { y: "100%", rotateZ: 3, opacity: 0 },
                visible: { y: 0, rotateZ: 0, opacity: 1, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
              }}
            >
              {t('title1')}
            </motion.div>
          </div>
          <div className="overflow-hidden pb-1 sm:pb-2 mt-1 sm:mt-2">
            <motion.div
              variants={{
                hidden: { y: "100%", rotateZ: 3, opacity: 0 },
                visible: { y: 0, rotateZ: 0, opacity: 1, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
              }}
              className="italic font-normal text-[#D4A853]"
            >
              {t('title2')}
            </motion.div>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-[#E8E2D9] text-sm sm:text-base md:text-lg max-w-lg leading-relaxed mb-6 sm:mb-8 font-light"
        >
          {t('subtitle')}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-wrap items-center gap-4"
        >
          <MagneticButton>
            <Link
              href="/menu"
              className="bg-[#D4A853] hover:bg-[#C09640] text-[#1A120B] font-bold text-xs sm:text-sm uppercase tracking-wider px-7 sm:px-8 py-3.5 sm:py-4 rounded-full transition-all duration-300 shadow-xl shadow-[#D4A853]/20 flex items-center space-x-2 group cursor-pointer min-h-[44px]"
            >
              <span>{t('cta')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </MagneticButton>
        </motion.div>
      </div>

      {/* Playlist Indicator */}
      {HERO_PLAYLIST.length > 1 && (
        <div className="absolute bottom-8 right-8 z-20 flex items-center bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
          {HERO_PLAYLIST.map((track, idx) => {
            const isSelected = idx === (pendingTrackIndex !== null ? pendingTrackIndex : currentTrackIndex);
            return (
              <button
                key={idx}
                onClick={() => switchToTrack(idx)}
                className="p-2 min-h-[36px] flex items-center justify-center cursor-pointer"
                aria-label={`Select shot ${idx + 1}`}
              >
                <span
                  className={`h-2 rounded-full transition-all duration-300 block ${
                    isSelected ? "w-8 bg-[#D4A853]" : "w-2 bg-white/40 hover:bg-white/70"
                  }`}
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Smooth Transition Mask to Body */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#FAF7F2] to-transparent z-20 pointer-events-none" />
    </section>
  );
}

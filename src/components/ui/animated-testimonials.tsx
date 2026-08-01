"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import MagneticButton from "./MagneticButton";

type Testimonial = {
  quote: string;
  name: string;
  designation: string;
  src: string;
};

export const AnimatedTestimonials = ({
  testimonials,
  autoplay = false,
}: {
  testimonials: Testimonial[];
  autoplay?: boolean;
}) => {
  const [active, setActive] = useState(0);

  const handleNext = () => {
    setActive((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const isActive = (index: number) => {
    return index === active;
  };

  useEffect(() => {
    if (autoplay) {
      const interval = setInterval(handleNext, 5000);
      return () => clearInterval(interval);
    }
  }, [autoplay, testimonials.length]);

  const randomRotateY = () => {
    return Math.floor(Math.random() * 21) - 10;
  };

  return (
    <div className="max-w-sm md:max-w-6xl mx-auto antialiased font-sans px-4 md:px-8 lg:px-12 py-20 bg-[#1A120B]">
      <div className="relative grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 items-center">
        <div>
          <div className="relative h-80 md:h-[500px] w-full">
            <AnimatePresence>
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.src}
                  initial={{
                    opacity: 0,
                    scale: 0.9,
                    z: -100,
                    rotate: randomRotateY(),
                  }}
                  animate={{
                    opacity: isActive(index) ? 1 : 0.7,
                    scale: isActive(index) ? 1 : 0.95,
                    z: isActive(index) ? 0 : -100,
                    rotate: isActive(index) ? 0 : randomRotateY(),
                    zIndex: isActive(index)
                      ? 999
                      : testimonials.length + 2 - index,
                    y: isActive(index) ? [0, -40, 0] : 0,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.9,
                    z: 100,
                    rotate: randomRotateY(),
                  }}
                  transition={{
                    duration: 0.4,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 origin-bottom"
                >
                  <Image
                    src={testimonial.src}
                    alt={testimonial.name}
                    draggable={false}
                    fill
                    className="h-full w-full rounded-3xl object-cover object-center border border-white/10"
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
        <div className="flex justify-between flex-col py-4 h-full md:pl-10">
          <motion.div
            key={active}
            initial={{
              y: 20,
              opacity: 0,
            }}
            animate={{
              y: 0,
              opacity: 1,
            }}
            exit={{
              y: -20,
              opacity: 0,
            }}
            transition={{
              duration: 0.2,
              ease: "easeInOut",
            }}
          >
            <h3 className="text-3xl md:text-5xl font-serif font-bold text-[#E8E2D9]">
              {testimonials[active].name}
            </h3>
            <p className="text-sm md:text-base text-[#D4A853] mt-2 mb-8 uppercase tracking-widest font-bold">
              {testimonials[active].designation}
            </p>
            <motion.p className="text-lg md:text-2xl text-white/70 mt-8 font-light italic leading-relaxed">
              {testimonials[active].quote.split(" ").map((word, index) => (
                <motion.span
                  key={index}
                  initial={{
                    filter: "blur(10px)",
                    opacity: 0,
                    y: 5,
                  }}
                  animate={{
                    filter: "blur(0px)",
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.2,
                    ease: "easeInOut",
                    delay: 0.02 * index,
                  }}
                  className="inline-block"
                >
                  {word}&nbsp;
                </motion.span>
              ))}
            </motion.p>
          </motion.div>
          <div className="flex gap-4 mt-12">
            <MagneticButton>
              <button
                onClick={handlePrev}
                className="h-14 w-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group/button hover:border-[#D4A853] hover:bg-white/10 transition-all duration-300"
              >
                <ArrowLeft className="h-6 w-6 text-white/50 group-hover/button:text-[#D4A853] transition-colors" />
              </button>
            </MagneticButton>
            <MagneticButton>
              <button
                onClick={handleNext}
                className="h-14 w-14 rounded-full bg-[#D4A853]/10 border border-[#D4A853]/30 flex items-center justify-center group/button hover:border-[#D4A853] hover:bg-[#D4A853]/20 transition-all duration-300"
              >
                <ArrowRight className="h-6 w-6 text-[#D4A853] group-hover/button:text-white transition-colors" />
              </button>
            </MagneticButton>
          </div>
        </div>
      </div>
    </div>
  );
};

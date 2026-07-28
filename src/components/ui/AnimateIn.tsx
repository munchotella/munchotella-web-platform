"use client";

import React, { useEffect, useRef } from "react";
import { motion, useInView, useAnimation } from "framer-motion";

export function AnimateIn({ 
  children, 
  delay = 0, 
  direction = "up",
  className = "" 
}: { 
  children: React.ReactNode, 
  delay?: number,
  direction?: "up" | "down" | "left" | "right" | "none",
  className?: string
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  const variants: any = {
    hidden: { 
      opacity: 0, 
      y: direction === "up" ? 40 : direction === "down" ? -40 : 0,
      x: direction === "left" ? 40 : direction === "right" ? -40 : 0,
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      x: 0,
      transition: { 
        duration: 0.8, 
        ease: [0.21, 0.47, 0.32, 0.98], // Custom cubic-bezier for premium feel
        delay: delay 
      } 
    }
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

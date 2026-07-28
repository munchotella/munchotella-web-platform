"use client";

import { motion } from "framer-motion";
import React from "react";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ 
        ease: [0.22, 1, 0.36, 1], // Liquid smooth easing (Custom cubic-bezier)
        duration: 0.8 
      }}
    >
      {children}
    </motion.div>
  );
}

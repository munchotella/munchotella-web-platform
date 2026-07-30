"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface NumberTickerProps {
  value: number;
  className?: string;
}

export default function NumberTicker({ value, className = "" }: NumberTickerProps) {
  const [previousValue, setPreviousValue] = useState(value);
  const [direction, setDirection] = useState(1); // 1 = up, -1 = down

  useEffect(() => {
    if (value > previousValue) setDirection(1);
    else if (value < previousValue) setDirection(-1);
    setPreviousValue(value);
  }, [value, previousValue]);

  return (
    <div className={`relative overflow-hidden inline-flex items-center justify-center ${className}`}>
      <AnimatePresence mode="popLayout" custom={direction}>
        <motion.span
          key={value}
          custom={direction}
          initial={{ y: direction * 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: direction * -15, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute"
        >
          {value}
        </motion.span>
      </AnimatePresence>
      {/* Invisible span just to reserve the right amount of width/height */}
      <span className="invisible">{value}</span>
    </div>
  );
}

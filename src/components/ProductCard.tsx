"use client";

import React, { useRef } from "react";
import { Plus } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

type ProductCardProps = {
  item: {
    id: number;
    name: string;
    price: string | number;
    numericPrice?: number;
    desc?: string;
    img: string;
    category?: string;
    badge?: string;
  };
  onSelect: (item: any) => void;
};

export default function ProductCard({ item, onSelect }: ProductCardProps) {
  const displayPrice = typeof item.price === "number" ? `${item.price} MDL` : item.price;
  const ingredients = item.desc ? item.desc.split(",").map(i => i.trim()).filter(i => i.length > 0 && !i.toLowerCase().includes("pieces")).slice(0, 3) : [];

  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      onClick={() => onSelect(item)}
      className="bg-[#FFFFFF] rounded-[12px] shadow-[0_2px_8px_rgba(26,26,26,0.04)] hover:shadow-[0_20px_40px_rgba(26,26,26,0.12)] active:scale-[0.98] transition-all duration-300 flex flex-col h-full group cursor-pointer border border-[#EAE1DB]/30 overflow-hidden relative"
    >
      {/* Top Heavy Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F9F9FB]">
        <img
          src={item.img}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {item.badge && (
          <span className="absolute top-3 left-3 bg-[#1A1A1A]/80 backdrop-blur-md text-[#FFFFFF] text-[11px] font-bold tracking-wide px-2.5 py-1 rounded-md shadow-sm">
            {item.badge}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-grow p-4">
        <div className="flex justify-between items-start gap-2 mb-1.5">
          <h3 className="font-sans text-[16px] font-bold text-[#1A1A1A] leading-tight line-clamp-2">
            {item.name}
          </h3>
          <span className="font-sans text-[15px] font-bold text-[#1A1A1A] whitespace-nowrap mt-0.5">
            {displayPrice}
          </span>
        </div>

        {/* Clean Ingredients Description */}
        {ingredients.length > 0 && (
          <p className="text-[#82756A] text-[13px] leading-relaxed line-clamp-2 mb-4">
            {ingredients.join(", ")}
          </p>
        )}

        {/* High Conversion Add Button (Minimalist Gray Pill) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(item);
          }}
          className="w-full bg-[#1A120B] hover:bg-[#D4A853] text-white hover:text-[#1A120B] font-bold text-[14px] py-2.5 rounded-full transition-colors duration-300 flex items-center justify-center gap-2 mt-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Comandă Acum</span>
        </button>
      </div>
    </motion.div>
  );
}

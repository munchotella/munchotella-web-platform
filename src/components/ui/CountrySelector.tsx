"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Country, defaultCountry } from "@/data/countries";

interface CountrySelectorProps {
  selectedCountry?: Country;
  onSelect?: (country: Country) => void;
  className?: string;
  buttonClassName?: string;
}

export default function CountrySelector({ 
  selectedCountry = defaultCountry, 
  className = "",
  buttonClassName = ""
}: CountrySelectorProps) {
  const t = useTranslations("Global");
  const country = selectedCountry || defaultCountry;

  return (
    <div className={`relative z-10 shrink-0 select-none ${className}`}>
      {/* Badge fix exclusiv Republica Moldova */}
      <div
        title={t('moldovaOnlyTooltip')}
        className={`h-full flex items-center gap-1.5 px-3.5 py-3.5 bg-[#FAF7F2] border-r border-[#E8E2D9] rounded-l-xl text-sm font-bold text-[#1A120B] shrink-0 ${buttonClassName}`}
      >
        <span className="text-base leading-none" role="img" aria-label="Moldova">
          {country.flag || "🇲🇩"}
        </span>
        <span className="font-semibold text-xs tracking-tight text-[#1A120B]">
          {country.dialCode || "+373"}
        </span>
      </div>
    </div>
  );
}

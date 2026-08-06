"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, Check } from "lucide-react";
import { ALL_COUNTRIES, Country, getCountryName } from "@/data/countries";
import { useLocale } from "next-intl";

interface CountrySelectorProps {
  selectedCountry: Country;
  onSelect: (country: Country) => void;
}

const SEARCH_PLACEHOLDERS: Record<string, string> = {
  ro: "Caută țară sau cod...",
  en: "Search country or code...",
  ru: "Поиск страны или кода..."
};

const NO_RESULTS: Record<string, string> = {
  ro: "Nicio țară găsită",
  en: "No country found",
  ru: "Страна не найдена"
};

export default function CountrySelector({ selectedCountry, onSelect }: CountrySelectorProps) {
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when opening
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearchQuery("");
    }
  }, [isOpen]);

  const filteredCountries = ALL_COUNTRIES.filter(country => {
    const q = searchQuery.toLowerCase().trim();
    const localizedName = getCountryName(country, locale).toLowerCase();
    return (
      localizedName.includes(q) ||
      country.nameEn.toLowerCase().includes(q) ||
      country.dialCode.includes(q) ||
      country.code.toLowerCase().includes(q)
    );
  });

  const searchPlaceholder = SEARCH_PLACEHOLDERS[locale] || SEARCH_PLACEHOLDERS.ro;
  const noResultsText = NO_RESULTS[locale] || NO_RESULTS.ro;

  return (
    <div ref={containerRef} className="relative z-30">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="h-full flex items-center gap-1.5 px-3 py-3 bg-[#FCF9F4] hover:bg-[#F5EFDF] border-r border-[#E8E2D9] rounded-l-2xl transition-colors text-sm font-bold text-[#1A120B] shrink-0 outline-none"
      >
        <span className="text-base">{selectedCountry.flag}</span>
        <span>{selectedCountry.dialCode}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-[#D4A853] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Searchable Dropdown Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-[#E8E2D9] overflow-hidden z-50 flex flex-col max-h-80"
          >
            {/* Search Header */}
            <div className="p-3 border-b border-[#E8E2D9] bg-[#FCF9F4] sticky top-0 z-10">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-[#736A60] absolute left-3 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-[#E8E2D9] rounded-xl pl-9 pr-3 py-2 text-xs text-[#1A120B] outline-none focus:border-[#D4A853] transition-all"
                />
              </div>
            </div>

            {/* Country List */}
            <div className="overflow-y-auto flex-1 p-1 divide-y divide-[#F5F2EC]">
              {filteredCountries.length === 0 ? (
                <div className="p-4 text-center text-xs text-[#736A60]">
                  {noResultsText}
                </div>
              ) : (
                filteredCountries.map((country) => {
                  const isSelected = selectedCountry.code === country.code && selectedCountry.dialCode === country.dialCode;
                  const displayName = getCountryName(country, locale);
                  return (
                    <button
                      key={`${country.code}-${country.dialCode}`}
                      type="button"
                      onClick={() => {
                        onSelect(country);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-colors hover:bg-[#FCF9F4] text-left ${
                        isSelected ? 'bg-[#FCF9F4] font-bold text-[#1A120B]' : 'text-[#4E4540]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate pr-2">
                        <span className="text-base leading-none">{country.flag}</span>
                        <span className="truncate">{displayName}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="font-mono text-[#D4A853] font-bold">{country.dialCode}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#D4A853]" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

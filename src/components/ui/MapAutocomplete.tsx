"use client";

import React, { useState, useEffect, useRef } from "react";
import { MapPin } from "lucide-react";

interface MapAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelected: (lat: number, lng: number, address: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export default function MapAutocomplete({
  value,
  onChange,
  onPlaceSelected,
  placeholder = "Caută adresa...",
  className = "",
  required = false
}: MapAutocompleteProps) {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://munchotella-app.onrender.com/api";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchPredictions = async (input: string) => {
    if (!input || input.length < 2) {
      setPredictions([]);
      setShowDropdown(false);
      return;
    }

    // Try Native Google Maps JS SDK Places Service first
    if (typeof window !== "undefined" && window.google?.maps?.places?.AutocompleteService) {
      try {
        setLoading(true);
        const service = new window.google.maps.places.AutocompleteService();
        service.getPlacePredictions(
          {
            input,
            componentRestrictions: { country: "md" },
          },
          (results, status) => {
            setLoading(false);
            if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
              setPredictions(
                results.map((p) => ({
                  place_id: p.place_id,
                  description: p.description,
                  main_text: p.structured_formatting?.main_text || p.description,
                  secondary_text: p.structured_formatting?.secondary_text || "",
                }))
              );
              setShowDropdown(true);
            }
          }
        );
        return;
      } catch (e) {
        console.warn("Client-side Autocomplete failed, trying API fallback...", e);
      }
    }

    // Fallback to backend API
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/maps/autocomplete?input=${encodeURIComponent(input)}`);
      const data = await res.json();
      if (data.success && data.predictions) {
        setPredictions(data.predictions);
        setShowDropdown(true);
      }
    } catch (err) {
      console.error("Autocomplete error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    
    debounceTimer.current = setTimeout(() => {
      fetchPredictions(val);
    }, 300);
  };

  const handleSelect = async (place_id: string, description: string) => {
    onChange(description);
    setShowDropdown(false);
    setPredictions([]);

    // Try Native Geocoder first
    if (typeof window !== "undefined" && window.google?.maps?.Geocoder) {
      try {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ placeId: place_id }, (results, status) => {
          if (status === "OK" && results && results[0]) {
            const loc = results[0].geometry.location;
            onPlaceSelected(loc.lat(), loc.lng(), results[0].formatted_address || description);
            return;
          }
        });
        return;
      } catch (e) {
        console.warn("Client-side Geocode failed, using API fallback...", e);
      }
    }

    try {
      const res = await fetch(`${API_URL}/maps/geocode?place_id=${place_id}`);
      const data = await res.json();
      
      if (data.success && data.data) {
        onPlaceSelected(data.data.lat, data.data.lng, data.data.formatted_address || description);
      }
    } catch (err) {
      console.error("Geocode error:", err);
    }
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <MapPin className="absolute left-4 top-3.5 w-4 h-4 text-[#D4A853] z-10 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={className}
        required={required}
        autoComplete="off"
        onFocus={() => {
          if (predictions.length > 0) setShowDropdown(true);
        }}
      />
      
      {showDropdown && predictions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-[#E8E2D9] rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {predictions.map((p) => (
            <div
              key={p.place_id}
              onClick={() => handleSelect(p.place_id, p.description)}
              className="px-4 py-3 hover:bg-[#FFFCF6] cursor-pointer border-b border-[#E8E2D9] last:border-b-0 flex items-start gap-3 transition-colors"
            >
              <MapPin className="w-4 h-4 text-[#736A60] mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-bold text-[#1A120B]">{p.main_text}</p>
                {p.secondary_text && (
                  <p className="text-xs text-[#736A60]">{p.secondary_text}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {loading && (
        <div className="absolute right-4 top-3.5">
          <div className="w-4 h-4 border-2 border-[#D4A853] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useRef, useEffect } from "react";
import { MapPin } from "lucide-react";
import { Autocomplete } from "@react-google-maps/api";
import { useGoogleMaps } from "@/context/GoogleMapsContext";

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
  const { isLoaded, loadError } = useGoogleMaps();
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  
  // Keep local value in sync with prop for typing
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const onLoad = (autocompleteObj: google.maps.places.Autocomplete) => {
    setAutocomplete(autocompleteObj);
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const address = place.formatted_address || place.name || "";
        
        setInputValue(address);
        onChange(address);
        onPlaceSelected(lat, lng, address);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    onChange(e.target.value);
  };

  if (loadError) {
    return <div className="text-red-500">Eroare la încărcarea hărții Google.</div>;
  }

  return (
    <div className="relative w-full">
      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D4A853] z-10 pointer-events-none" />
      
      {isLoaded ? (
        <Autocomplete
          onLoad={onLoad}
          onPlaceChanged={onPlaceChanged}
          options={{
            componentRestrictions: { country: "md" } // Restrict to Moldova
          }}
        >
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder={placeholder}
            className={className}
            required={required}
            autoComplete="off"
          />
        </Autocomplete>
      ) : (
        <div className="relative w-full">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Se încarcă Google Maps..."
            className={className}
            disabled
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-[#D4A853] border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect, useRef } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { Autocomplete } from "@react-google-maps/api";
import { useGoogleMaps } from "@/context/GoogleMapsContext";

export interface PlaceSelectionMeta {
  isGenericCity?: boolean;
  types?: string[];
  place?: google.maps.places.PlaceResult;
}

interface MapAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelected: (lat: number, lng: number, address: string, meta?: PlaceSelectionMeta) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

/**
 * Verifică dacă locul returnat de Google Maps este doar o localitate/oraș generic (ex: "Chișinău, Moldova")
 * fără detalii de stradă sau stabiliment concret.
 */
function checkIfGenericCity(place: google.maps.places.PlaceResult | google.maps.GeocoderResult, formattedAddress: string): boolean {
  const types = place.types || [];
  
  // Tipuri concrete de destinație precisă:
  const concreteTypes = [
    'street_address', 
    'premise', 
    'subpremise', 
    'route', 
    'establishment', 
    'point_of_interest',
    'hospital',
    'hotel',
    'school',
    'university',
    'shopping_mall'
  ];
  const hasConcreteType = types.some(t => concreteTypes.includes(t));

  // Tipuri generice de nivel înalt (oraș, raion, țară):
  const broadTypes = [
    'locality', 
    'political', 
    'administrative_area_level_1', 
    'administrative_area_level_2', 
    'country'
  ];
  const hasOnlyBroadTypes = types.length > 0 && types.every(t => broadTypes.includes(t));

  // Verificare textuală de siguranță: dacă textul adresei este exclusiv numele orașului
  const clean = formattedAddress.trim().toLowerCase().replace(/,\s*moldova$/i, '').trim();
  const knownCities = ['chișinău', 'chisinau', 'bălți', 'balti', 'orhei', 'strășeni', 'straseni', 'ialoveni', 'ungheni', 'cahul', 'soroca', 'tiraspol', 'bender'];
  const isJustCityName = knownCities.includes(clean);

  if ((hasOnlyBroadTypes && !hasConcreteType) || isJustCityName) {
    return true;
  }

  return false;
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
  const [isGeocoding, setIsGeocoding] = useState(false);
  
  // Keep local value in sync with prop for typing
  const [inputValue, setInputValue] = useState(value);
  const lastResolvedAddressRef = useRef("");

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const onLoad = (autocompleteObj: google.maps.places.Autocomplete) => {
    setAutocomplete(autocompleteObj);
  };

  const geocodeFallback = (rawAddress: string) => {
    if (!rawAddress || rawAddress.trim().length < 3) return;
    if (rawAddress.trim() === lastResolvedAddressRef.current.trim()) return;
    if (typeof window === "undefined" || !window.google?.maps?.Geocoder) return;

    setIsGeocoding(true);
    const geocoder = new window.google.maps.Geocoder();
    const queryAddress = rawAddress.toLowerCase().includes("chișinău") || rawAddress.toLowerCase().includes("chisinau")
      ? rawAddress
      : `${rawAddress}, Chișinău, Moldova`;

    geocoder.geocode(
      {
        address: queryAddress,
        componentRestrictions: { country: "md" }
      },
      (results, status) => {
        setIsGeocoding(false);
        if (status === "OK" && results && results[0] && results[0].geometry?.location) {
          const loc = results[0].geometry.location;
          const lat = loc.lat();
          const lng = loc.lng();
          const resolvedAddress = results[0].formatted_address || rawAddress;
          const isGenericCity = checkIfGenericCity(results[0], resolvedAddress);

          lastResolvedAddressRef.current = resolvedAddress;
          setInputValue(resolvedAddress);
          onChange(resolvedAddress);
          onPlaceSelected(lat, lng, resolvedAddress, { isGenericCity, types: results[0].types });
        }
      }
    );
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (place && place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const address = place.formatted_address || place.name || "";
        const isGenericCity = checkIfGenericCity(place, address);

        lastResolvedAddressRef.current = address;
        setInputValue(address);
        onChange(address);
        onPlaceSelected(lat, lng, address, { isGenericCity, types: place.types, place });
      } else if (place && place.name) {
        // Caz când utilizatorul a tastat/lipit text și a apăsat Enter fără click pe dropdown
        geocodeFallback(place.name);
      } else if (inputValue) {
        geocodeFallback(inputValue);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    onChange(e.target.value);
  };

  const handleBlur = () => {
    if (inputValue && inputValue.trim().length >= 3 && inputValue.trim() !== lastResolvedAddressRef.current.trim()) {
      geocodeFallback(inputValue);
    }
  };

  if (loadError) {
    return <div className="text-red-500">Eroare la încărcarea hărții Google.</div>;
  }

  return (
    <div className="relative w-full">
      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D4A853] z-10 pointer-events-none" />
      
      {isLoaded ? (
        <div className="relative w-full">
          <Autocomplete
            onLoad={onLoad}
            onPlaceChanged={onPlaceChanged}
            options={{
              componentRestrictions: { country: "md" }, // Restrict to Moldova
              fields: ["address_components", "formatted_address", "geometry", "name", "types"]
            }}
          >
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder={placeholder}
              className={className}
              required={required}
              autoComplete="off"
            />
          </Autocomplete>
          {isGeocoding && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10 flex items-center gap-1 bg-white/90 px-2 py-0.5 rounded-md shadow-sm border border-[#E8E2D9]">
              <Loader2 className="w-3.5 h-3.5 text-[#D4A853] animate-spin" />
              <span className="text-[10px] font-semibold text-[#736A60]">Localizare...</span>
            </div>
          )}
        </div>
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

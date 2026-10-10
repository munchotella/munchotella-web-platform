"use client";

import React, { useState, useEffect, useRef } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { Autocomplete } from "@react-google-maps/api";
import { useGoogleMaps } from "@/context/GoogleMapsContext";
import { useTranslations } from "next-intl";

export interface PlaceSelectionMeta {
  isGenericCity?: boolean;
  types?: string[];
  place?: google.maps.places.PlaceResult;
  source?: string;
}

interface MapAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelected: (lat: number, lng: number, address: string, meta?: PlaceSelectionMeta) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

// Coordonate Boutique Munchotella (Nicolae Testemițanu 21/1, Chișinău)
const RESTAURANT_LOCATION = { lat: 46.996452, lng: 28.834809 };

// Bounding box pentru Chișinău și împrejurimi (bias pentru Google Places)
const CHISINAU_BOUNDS = {
  north: 47.12,
  south: 46.90,
  east: 29.00,
  west: 28.70,
};

function getStraightDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function hasFractionOrSubnumber(text: string): boolean {
  return /\b\d+\s*[\/-]\s*\d+\b/.test(text) || /\b\d+[a-zA-Z]\b/.test(text);
}

function isExplicitSuburb(text: string): boolean {
  const lower = text.toLowerCase();
  const suburbs = [
    'trușeni', 'truseni', 'tohatin', 'bubuieci', 'băcioi', 'bacioi', 'sângera', 'sangera',
    'colonița', 'colonita', 'cricova', 'vadul lui vodă', 'vatra', 'ghidighici', 'durlești', 'durlesti',
    'codru', 'stăuceni', 'stauceni', 'dumbrava', 'bălți', 'balti', 'orhei', 'cahul', 'ungheni',
    'soroca', 'strășeni', 'straseni', 'criuleni', 'aneni', 'cimișlia', 'cimislia', 'mereni'
  ];
  return suburbs.some(s => lower.includes(s));
}

/**
 * Apelează proxy-ul backend de geocodare de precizie (Map.md Simpals -> OpenStreetMap -> Google rescue)
 */
async function fetchPrecisionGeocode(rawAddress: string): Promise<{ lat: number; lng: number; formatted_address: string; isGenericCity?: boolean; source?: string } | null> {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://munchotella-api.onrender.com/api";
    const res = await fetch(`${API_URL}/maps/geocode?address=${encodeURIComponent(rawAddress)}`, {
      headers: { 'Accept': 'application/json' }
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data && typeof json.data.lat === 'number' && typeof json.data.lng === 'number') {
        const clean = (json.data.formatted_address || rawAddress).trim().toLowerCase().replace(/,\s*moldova$/i, '').trim();
        const knownCities = ['chișinău', 'chisinau', 'bălți', 'balti', 'orhei', 'strășeni', 'straseni', 'ialoveni', 'ungheni', 'cahul', 'soroca', 'tiraspol', 'bender'];
        const isGenericCity = knownCities.includes(clean);

        return {
          lat: json.data.lat,
          lng: json.data.lng,
          formatted_address: json.data.formatted_address || rawAddress,
          isGenericCity,
          source: json.data.source || 'backend'
        };
      }
    }
  } catch (err) {
    console.warn("[MapAutocomplete] Precision geocode network error:", err);
  }
  return null;
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
  placeholder,
  className = "",
  required = false
}: MapAutocompleteProps) {
  const t = useTranslations("MapPicker");
  const displayPlaceholder = placeholder || t("defaultAddressPlaceholder");
  const { isLoaded, loadError } = useGoogleMaps();
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  
  // Keep local value in sync with prop for typing
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const userTypedInputRef = useRef(value);
  const lastResolvedAddressRef = useRef("");

  useEffect(() => {
    setInputValue(value);
    userTypedInputRef.current = value;
  }, [value]);

  const onLoad = (autocompleteObj: google.maps.places.Autocomplete) => {
    setAutocomplete(autocompleteObj);
  };

  const geocodeFallback = async (rawAddress: string) => {
    if (!rawAddress || rawAddress.trim().length < 3) return;
    if (rawAddress.trim() === lastResolvedAddressRef.current.trim()) return;

    setIsGeocoding(true);

    // 1. Încercăm mai întâi geocodarea de precizie prin backend (Map.md -> OSM) dacă are fracții sau e căutare text
    const precision = await fetchPrecisionGeocode(rawAddress);
    if (precision) {
      setIsGeocoding(false);
      lastResolvedAddressRef.current = precision.formatted_address;
      userTypedInputRef.current = precision.formatted_address;
      setInputValue(precision.formatted_address);
      if (inputRef.current) inputRef.current.value = precision.formatted_address;
      onChange(precision.formatted_address);
      onPlaceSelected(precision.lat, precision.lng, precision.formatted_address, {
        isGenericCity: precision.isGenericCity,
        source: precision.source
      });
      return;
    }

    // 2. Fallback la Google Geocoder dacă backend-ul nu este disponibil
    if (typeof window === "undefined" || !window.google?.maps?.Geocoder) {
      setIsGeocoding(false);
      return;
    }

    const geocoder = new window.google.maps.Geocoder();
    const queryAddress = rawAddress.toLowerCase().includes("chișinău") || rawAddress.toLowerCase().includes("chisinau")
      ? rawAddress
      : `${rawAddress}, Chișinău, Moldova`;

    geocoder.geocode(
      {
        address: queryAddress,
        componentRestrictions: { country: "md" },
        bounds: CHISINAU_BOUNDS
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
          userTypedInputRef.current = resolvedAddress;
          setInputValue(resolvedAddress);
          if (inputRef.current) inputRef.current.value = resolvedAddress;
          onChange(resolvedAddress);
          onPlaceSelected(lat, lng, resolvedAddress, { isGenericCity, types: results[0].types });
        }
      }
    );
  };

  const onPlaceChanged = async () => {
    if (autocomplete !== null) {
      const userTyped = (userTypedInputRef.current || "").trim();
      const place = autocomplete.getPlace();
      const address = place?.formatted_address || place?.name || "";
      const rawQuery = userTyped || address || inputRef.current?.value || "";

      // 1. Dacă textul tastat conține o fracție (ex: 115/1, 24/2, 86/4, 67a) sau Google a extras o fracție:
      // Map.md deține planul cadastral complet al Chișinăului și rezolvă adresa exactă!
      const hasFraction = hasFractionOrSubnumber(userTyped) || hasFractionOrSubnumber(address);

      if (hasFraction && (userTyped || address)) {
        setIsGeocoding(true);
        const precision = await fetchPrecisionGeocode(userTyped || address);
        setIsGeocoding(false);
        if (precision) {
          lastResolvedAddressRef.current = precision.formatted_address;
          userTypedInputRef.current = precision.formatted_address;
          setInputValue(precision.formatted_address);
          if (inputRef.current) inputRef.current.value = precision.formatted_address;
          onChange(precision.formatted_address);
          onPlaceSelected(precision.lat, precision.lng, precision.formatted_address, {
            isGenericCity: precision.isGenericCity,
            source: precision.source
          });
          return;
        }
      }

      if (place && place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const straightDist = getStraightDistanceKm(RESTAURANT_LOCATION.lat, RESTAURANT_LOCATION.lng, lat, lng);

        // 2. Protecție împotriva săririi în suburbii / alte localități (Tohatin, Trușeni, Strășeni):
        // Dacă Google returnează o adresă la > 7.5 km aerieni sau fără "Chișinău" în adresa formatată,
        // dar utilizatorul NU a cerut explicit acea suburbie:
        const addressLower = address.toLowerCase();
        const userLower = userTyped.toLowerCase();
        const isOutsideChisinau = straightDist > 7.5 || (!addressLower.includes("chișinău") && !addressLower.includes("chisinau"));
        const explicitLocality = isExplicitSuburb(userLower);

        if (isOutsideChisinau && !explicitLocality && (userTyped || rawQuery)) {
          setIsGeocoding(true);
          const precision = await fetchPrecisionGeocode(userTyped || rawQuery);
          setIsGeocoding(false);
          if (precision) {
            const precisionDist = getStraightDistanceKm(RESTAURANT_LOCATION.lat, RESTAURANT_LOCATION.lng, precision.lat, precision.lng);
            if (precisionDist <= 7.5) {
              lastResolvedAddressRef.current = precision.formatted_address;
              userTypedInputRef.current = precision.formatted_address;
              setInputValue(precision.formatted_address);
              if (inputRef.current) inputRef.current.value = precision.formatted_address;
              onChange(precision.formatted_address);
              onPlaceSelected(precision.lat, precision.lng, precision.formatted_address, {
                isGenericCity: precision.isGenericCity,
                source: precision.source
              });
              return;
            }
          }
        }

        const isGenericCity = checkIfGenericCity(place, address);

        lastResolvedAddressRef.current = address;
        userTypedInputRef.current = address;
        setInputValue(address);
        if (inputRef.current) inputRef.current.value = address;
        onChange(address);
        onPlaceSelected(lat, lng, address, { isGenericCity, types: place.types, place });
      } else if (rawQuery) {
        geocodeFallback(rawQuery);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    userTypedInputRef.current = val;
    setInputValue(val);
    onChange(val);
  };

  const handleBlur = () => {
    const liveVal = (userTypedInputRef.current || inputRef.current?.value || inputValue || "").trim();
    if (liveVal && liveVal.length >= 3 && liveVal !== lastResolvedAddressRef.current.trim()) {
      geocodeFallback(liveVal);
    }
  };

  if (loadError) {
    return <div className="text-red-500">{t("loadError")}</div>;
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
              fields: ["address_components", "formatted_address", "geometry", "name", "types"],
              bounds: CHISINAU_BOUNDS,
              strictBounds: false
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder={displayPlaceholder}
              className={className}
              required={required}
              autoComplete="off"
            />
          </Autocomplete>
          {isGeocoding && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10 flex items-center gap-1 bg-white/90 px-2 py-0.5 rounded-md shadow-sm border border-[#E8E2D9]">
              <Loader2 className="w-3.5 h-3.5 text-[#D4A853] animate-spin" />
              <span className="text-[10px] font-semibold text-[#736A60]">{t("locating")}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="relative w-full">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder={t("loadingMaps")}
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

"use client";

import React, { useState, useEffect, useRef } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { Autocomplete } from "@react-google-maps/api";
import { useGoogleMaps } from "@/context/GoogleMapsContext";
import { useTranslations } from "next-intl";

export interface PlaceSelectionMeta {
  isGenericCity?: boolean;
  isStreetWithoutNumber?: boolean;
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

// Bounding box urban pentru Chișinău (exclude Băcioi la sud de 46.948 pentru a prioritiza bulevardele din oraș)
const CHISINAU_BOUNDS = {
  north: 47.08,
  south: 46.948,
  east: 28.93,
  west: 28.74,
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
  const lower = (text || "").toLowerCase();
  const suburbs = [
    'trușeni', 'truseni', 'tohatin', 'bubuieci', 'băcioi', 'bacioi', 'sângera', 'sangera', 'sîngera', 'singera',
    'colonița', 'colonita', 'cricova', 'vadul lui vodă', 'vatra', 'ghidighici', 'durlești', 'durlesti',
    'codru', 'stăuceni', 'stauceni', 'dumbrava', 'grătiești', 'gratiesti', 'ciorescu', 'revaca', 'dobrogea',
    'bălți', 'balti', 'orhei', 'cahul', 'ungheni', 'soroca', 'strășeni', 'straseni', 'criuleni', 'aneni',
    'cimișlia', 'cimislia', 'mereni', 'ialoveni'
  ];
  return suburbs.some(s => lower.includes(s));
}

function checkPlaceInSuburb(
  place: google.maps.places.PlaceResult | google.maps.GeocoderResult | undefined,
  formattedAddress: string,
  lat: number
): boolean {
  if (isExplicitSuburb(formattedAddress)) return true;
  if (lat < 46.948) return true; // La sud de Porțile Orașului (comuna Băcioi / Sângera / Revaca)
  const comps = place?.address_components || [];
  for (const comp of comps) {
    if (isExplicitSuburb(comp.long_name || "") || isExplicitSuburb(comp.short_name || "")) {
      return true;
    }
  }
  return false;
}

/**
 * Verifică dacă utilizatorul a selectat doar numele unei străzi / unui bulevard fără număr de casă sau bloc.
 * Exclude reperele cunoscute (hoteluri, mall-uri, spitale, universități).
 */
export function checkIfStreetWithoutNumber(
  formattedAddress: string,
  userTyped: string,
  types?: string[]
): boolean {
  const cleanText = `${formattedAddress} ${userTyped}`
    .replace(/\bMD\s*-\s*\d{4}\b/gi, "") // ignoră codul poștal MD-2001
    .replace(/,\s*(?:chișinău|chisinau|moldova).*/gi, "")
    .trim();

  // Dacă există deja un număr de clădire / bloc în text, adresa este completă
  if (/\d/.test(cleanText)) {
    return false;
  }

  const poiTypes = [
    'establishment',
    'point_of_interest',
    'hospital',
    'hotel',
    'lodging',
    'school',
    'university',
    'shopping_mall',
    'Store',
    'park',
    'airport',
    'transit_station',
  ];
  if (types && types.some(t => poiTypes.includes(t))) {
    return false;
  }

  const lowerFull = `${formattedAddress} ${userTyped}`.toLowerCase();
  const landmarkKeywords = [
    'hotel', 'mall', 'malldova', 'spital', 'clinica', 'universitat', 'usmf', 'utm', 'usm', 'asem', 'ulim',
    'parc', 'gara', 'autogara', 'aeroport', 'kaufland', 'linella', 'nr1', 'pegas', 'atrium', 'sun city',
    'unic', 'gemeni', 'patria', 'stadion', 'arena', 'piata', 'piața', 'liceu', 'colegiu', 'gradinita', 'grădinița'
  ];
  if (landmarkKeywords.some(k => lowerFull.includes(k))) {
    return false;
  }

  return true;
}

/**
 * Apelează proxy-ul backend de geocodare de precizie (Map.md Simpals -> OpenStreetMap -> Google rescue)
 */
async function fetchPrecisionGeocode(rawAddress: string): Promise<{ lat: number; lng: number; formatted_address: string; isGenericCity?: boolean; isStreetWithoutNumber?: boolean; source?: string } | null> {
  try {
    const API_URL = "https://munchotella-api.onrender.com/api";
    const res = await fetch(`${API_URL}/maps/geocode?address=${encodeURIComponent(rawAddress)}`, {
      headers: { 'Accept': 'application/json' }
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data && typeof json.data.lat === 'number' && typeof json.data.lng === 'number') {
        const formatted = json.data.formatted_address || rawAddress;
        const clean = formatted.trim().toLowerCase().replace(/,\s*moldova$/i, '').trim();
        const knownCities = ['chișinău', 'chisinau', 'bălți', 'balti', 'orhei', 'strășeni', 'straseni', 'ialoveni', 'ungheni', 'cahul', 'soroca', 'tiraspol', 'bender'];
        const isGenericCity = knownCities.includes(clean);
        const isStreetWithoutNumber = !isGenericCity && checkIfStreetWithoutNumber(formatted, rawAddress);

        return {
          lat: json.data.lat,
          lng: json.data.lng,
          formatted_address: formatted,
          isGenericCity,
          isStreetWithoutNumber,
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
 * Rescue client-side pe zona strict urbană a Chișinăului dacă o stradă fără fracție (ex: "Ștefan Cel Mare")
 * a fost trimisă de Google în comuna Băcioi (lat < 46.948) sau în altă suburbie.
 */
async function rescueUrbanChisinauStreet(rawQuery: string): Promise<{ lat: number; lng: number; formatted_address: string; types?: string[] } | null> {
  if (typeof window === "undefined" || !window.google?.maps?.Geocoder) return null;
  const cleanStreet = rawQuery
    .replace(/,\s*(?:băcioi|bacioi|trușeni|truseni|tohatin|bubuieci|chișinău|chisinau|moldova).*/gi, "")
    .trim();
  if (!cleanStreet) return null;

  const geocoder = new window.google.maps.Geocoder();
  const urbanQuery = cleanStreet.toLowerCase().includes("ștefan cel mare") || cleanStreet.toLowerCase().includes("stefan cel mare")
    ? `Bulevardul Ștefan cel Mare și Sfânt ${cleanStreet.replace(/.*(?:ștefan cel mare și sfânt|stefan cel mare si sfant|ștefan cel mare|stefan cel mare)\s*/i, "")}, Sectorul Centru, Chișinău, Moldova`.replace(/\s+,/g, ",")
    : `${cleanStreet}, Sectorul Centru, Chișinău, Moldova`;

  return new Promise((resolve) => {
    geocoder.geocode(
      {
        address: urbanQuery,
        componentRestrictions: { country: "md" },
        bounds: CHISINAU_BOUNDS,
      },
      (results, status) => {
        if (status === "OK" && results && results[0]?.geometry?.location) {
          const loc = results[0].geometry.location;
          const rLat = loc.lat();
          const rLng = loc.lng();
          if (rLat >= 46.948 && rLat <= 47.08) {
            resolve({
              lat: rLat,
              lng: rLng,
              formatted_address: results[0].formatted_address || urbanQuery,
              types: results[0].types,
            });
            return;
          }
        }
        resolve(null);
      }
    );
  });
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

interface FractionSuggestion {
  lat: number;
  lng: number;
  formatted_address: string;
  isGenericCity?: boolean;
  isStreetWithoutNumber?: boolean;
  source?: string;
}

function parseAddressParts(formattedAddress: string): { streetPart: string; cityPart: string } {
  const commaIdx = formattedAddress.indexOf(',');
  if (commaIdx !== -1) {
    const streetPart = formattedAddress.slice(0, commaIdx).trim();
    const cityPart = formattedAddress.slice(commaIdx + 1).trim();
    return { streetPart, cityPart };
  }
  return { streetPart: formattedAddress, cityPart: "Chișinău, Moldova" };
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
  
  // Stare pentru sugestia inteligentă de fracție (Map.md)
  const [fractionSuggestion, setFractionSuggestion] = useState<FractionSuggestion | null>(null);
  const [isFetchingFraction, setIsFetchingFraction] = useState(false);

  // Keep local value in sync with prop for typing
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const userTypedInputRef = useRef(value);
  const lastResolvedAddressRef = useRef("");

  useEffect(() => {
    setInputValue(value);
    userTypedInputRef.current = value;
  }, [value]);

  const hasFraction = hasFractionOrSubnumber(inputValue);

  // Controlăm clasa pe document.body pentru a suprima .pac-container DOAR când utilizatorul tastează fracții,
  // fără a folosi taguri <style> în JSX care se hoist-uiesc în <head> în React 19 și blochează dropdown-ul permanent.
  useEffect(() => {
    if (typeof document !== "undefined") {
      if (hasFraction) {
        document.body.classList.add("munchotella-suppress-pac");
      } else {
        document.body.classList.remove("munchotella-suppress-pac");
      }
    }
    return () => {
      if (typeof document !== "undefined") {
        document.body.classList.remove("munchotella-suppress-pac");
      }
    };
  }, [hasFraction]);

  // Efect debounced pentru căutarea automată a adreselor cu fracții pe Map.md
  useEffect(() => {
    if (!hasFractionOrSubnumber(inputValue) || inputValue.trim().length < 4) {
      setFractionSuggestion(null);
      setIsFetchingFraction(false);
      return;
    }

    // Nu căutăm din nou dacă adresa curentă este deja cea rezolvată
    if (inputValue.trim().toLowerCase() === lastResolvedAddressRef.current.trim().toLowerCase()) {
      setFractionSuggestion(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsFetchingFraction(true);
      const precision = await fetchPrecisionGeocode(inputValue.trim());
      setIsFetchingFraction(false);
      if (precision && hasFractionOrSubnumber(userTypedInputRef.current)) {
        setFractionSuggestion(precision);
      } else {
        setFractionSuggestion(null);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [inputValue]);

  const onLoad = (autocompleteObj: google.maps.places.Autocomplete) => {
    setAutocomplete(autocompleteObj);
  };

  const selectFractionSuggestion = (suggestion: FractionSuggestion) => {
    lastResolvedAddressRef.current = suggestion.formatted_address;
    userTypedInputRef.current = suggestion.formatted_address;
    setInputValue(suggestion.formatted_address);
    if (inputRef.current) {
      inputRef.current.value = suggestion.formatted_address;
    }
    setFractionSuggestion(null);
    onChange(suggestion.formatted_address);
    onPlaceSelected(suggestion.lat, suggestion.lng, suggestion.formatted_address, {
      isGenericCity: suggestion.isGenericCity,
      isStreetWithoutNumber: suggestion.isStreetWithoutNumber,
      source: suggestion.source
    });
  };

  const geocodeFallback = async (rawAddress: string) => {
    if (!rawAddress || rawAddress.trim().length < 3) return;
    if (rawAddress.trim() === lastResolvedAddressRef.current.trim()) return;

    setIsGeocoding(true);
    const explicitLocality = isExplicitSuburb(rawAddress);

    // 1. Încercăm mai întâi geocodarea de precizie prin backend (Map.md -> OSM)
    const precision = await fetchPrecisionGeocode(rawAddress);
    if (precision && (explicitLocality || precision.lat >= 46.948)) {
      setIsGeocoding(false);
      lastResolvedAddressRef.current = precision.formatted_address;
      userTypedInputRef.current = precision.formatted_address;
      setInputValue(precision.formatted_address);
      if (inputRef.current) inputRef.current.value = precision.formatted_address;
      onChange(precision.formatted_address);
      onPlaceSelected(precision.lat, precision.lng, precision.formatted_address, {
        isGenericCity: precision.isGenericCity,
        isStreetWithoutNumber: precision.isStreetWithoutNumber,
        source: precision.source
      });
      return;
    }

    // 2. Fallback la Google Geocoder
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
      async (results, status) => {
        if (status === "OK" && results && results[0] && results[0].geometry?.location) {
          const loc = results[0].geometry.location;
          let lat = loc.lat();
          let lng = loc.lng();
          let resolvedAddress = results[0].formatted_address || rawAddress;
          let resolvedTypes = results[0].types;

          if (!explicitLocality && checkPlaceInSuburb(results[0], resolvedAddress, lat)) {
            const rescued = await rescueUrbanChisinauStreet(rawAddress);
            if (rescued) {
              lat = rescued.lat;
              lng = rescued.lng;
              resolvedAddress = rescued.formatted_address;
              resolvedTypes = rescued.types || resolvedTypes;
            }
          }

          setIsGeocoding(false);
          const isGenericCity = checkIfGenericCity(results[0], resolvedAddress);
          const isStreetWithoutNumber = !isGenericCity && checkIfStreetWithoutNumber(resolvedAddress, rawAddress, resolvedTypes);

          lastResolvedAddressRef.current = resolvedAddress;
          userTypedInputRef.current = resolvedAddress;
          setInputValue(resolvedAddress);
          if (inputRef.current) inputRef.current.value = resolvedAddress;
          onChange(resolvedAddress);
          onPlaceSelected(lat, lng, resolvedAddress, { isGenericCity, isStreetWithoutNumber, types: resolvedTypes });
        } else {
          setIsGeocoding(false);
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
      const hasFrac = hasFractionOrSubnumber(userTyped) || hasFractionOrSubnumber(address);

      if (hasFrac && (userTyped || address)) {
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
            isStreetWithoutNumber: false,
            source: precision.source
          });
          return;
        }
      }

      if (place && place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const straightDist = getStraightDistanceKm(RESTAURANT_LOCATION.lat, RESTAURANT_LOCATION.lng, lat, lng);

        // 2. Protecție împotriva săririi în suburbii / comune (Băcioi, Trușeni, Tohatin, Durlești, Strășeni):
        // Verificăm atât distanța (> 7.2 km aerieni), cât și address_components + lat < 46.948 (Băcioi),
        // atunci când utilizatorul NU a cerut explicit acea suburbie:
        const addressLower = address.toLowerCase();
        const userLower = userTyped.toLowerCase();
        const inSuburb = checkPlaceInSuburb(place, address, lat);
        const isOutsideChisinau =
          straightDist > 7.2 ||
          inSuburb ||
          (!addressLower.includes("chișinău") && !addressLower.includes("chisinau"));
        const explicitLocality = isExplicitSuburb(userLower);

        if (isOutsideChisinau && !explicitLocality && (userTyped || rawQuery)) {
          setIsGeocoding(true);
          const precision = await fetchPrecisionGeocode(userTyped || rawQuery);
          if (precision && precision.lat >= 46.948 && !isExplicitSuburb(precision.formatted_address)) {
            const precisionDist = getStraightDistanceKm(RESTAURANT_LOCATION.lat, RESTAURANT_LOCATION.lng, precision.lat, precision.lng);
            if (precisionDist <= 10.5 && (precisionDist < straightDist || inSuburb)) {
              setIsGeocoding(false);
              lastResolvedAddressRef.current = precision.formatted_address;
              userTypedInputRef.current = precision.formatted_address;
              setInputValue(precision.formatted_address);
              if (inputRef.current) inputRef.current.value = precision.formatted_address;
              onChange(precision.formatted_address);
              onPlaceSelected(precision.lat, precision.lng, precision.formatted_address, {
                isGenericCity: precision.isGenericCity,
                isStreetWithoutNumber: precision.isStreetWithoutNumber,
                source: precision.source
              });
              return;
            }
          }

          // Fallback client-side direct pe zona urbană Chișinău (ex: "Ștefan Cel Mare" sărit în Băcioi)
          if (inSuburb) {
            const rescued = await rescueUrbanChisinauStreet(userTyped || rawQuery);
            setIsGeocoding(false);
            if (rescued) {
              const isGenericCity = false;
              const isStreetWithoutNumber = checkIfStreetWithoutNumber(rescued.formatted_address, userTyped, rescued.types);
              lastResolvedAddressRef.current = rescued.formatted_address;
              userTypedInputRef.current = rescued.formatted_address;
              setInputValue(rescued.formatted_address);
              if (inputRef.current) inputRef.current.value = rescued.formatted_address;
              onChange(rescued.formatted_address);
              onPlaceSelected(rescued.lat, rescued.lng, rescued.formatted_address, {
                isGenericCity,
                isStreetWithoutNumber,
                types: rescued.types,
                source: "urban_chisinau_rescue"
              });
              return;
            }
          }
          setIsGeocoding(false);
        }

        const isGenericCity = checkIfGenericCity(place, address);
        const isStreetWithoutNumber = !isGenericCity && checkIfStreetWithoutNumber(address, userTyped, place.types);

        lastResolvedAddressRef.current = address;
        userTypedInputRef.current = address;
        setInputValue(address);
        if (inputRef.current) inputRef.current.value = address;
        onChange(address);
        onPlaceSelected(lat, lng, address, { isGenericCity, isStreetWithoutNumber, types: place.types, place });
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && fractionSuggestion) {
      e.preventDefault();
      e.stopPropagation();
      selectFractionSuggestion(fractionSuggestion);
    }
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

  const showFractionPopup = Boolean(
    fractionSuggestion &&
    inputValue.trim().toLowerCase() !== fractionSuggestion.formatted_address.trim().toLowerCase()
  );

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
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              placeholder={displayPlaceholder}
              className={className}
              required={required}
              autoComplete="off"
            />
          </Autocomplete>

          {/* Indicator fin de căutare / localizare */}
          {(isGeocoding || isFetchingFraction) && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10 flex items-center gap-1 bg-white/90 px-2 py-0.5 rounded-md shadow-sm border border-[#E8E2D9]">
              <Loader2 className="w-3.5 h-3.5 text-[#D4A853] animate-spin" />
              <span className="text-[10px] font-semibold text-[#736A60]">{t("locating")}</span>
            </div>
          )}

          {/* Pop-up inteligent pentru adrese cu fracție din Chișinău (Map.md) */}
          {showFractionPopup && fractionSuggestion && (
            <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white rounded-xl shadow-xl border border-[#E8E2D9] overflow-hidden">
              <div
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectFractionSuggestion(fractionSuggestion);
                }}
                className="p-3.5 flex items-center justify-between hover:bg-[#FAF7F2] cursor-pointer transition-colors group"
              >
                <div className="flex items-start gap-3 min-w-0 pr-2">
                  <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] border border-[#E8E2D9] flex items-center justify-center shrink-0 mt-0.5 group-hover:border-[#D4A853]/40 group-hover:bg-[#F5EFEB] transition-colors">
                    <MapPin className="w-4 h-4 text-[#D4A853]" />
                  </div>
                  <div className="min-w-0">
                    {(() => {
                      const { streetPart, cityPart } = parseAddressParts(fractionSuggestion.formatted_address);
                      return (
                        <>
                          <p className="text-sm font-semibold text-[#1A120B] truncate leading-snug">
                            {streetPart}
                          </p>
                          <p className="text-xs text-[#736A60] truncate mt-0.5">
                            {cityPart}
                          </p>
                        </>
                      );
                    })()}
                  </div>
                </div>
                <div className="shrink-0 pl-2">
                  <span className="inline-flex items-center text-[10px] font-semibold text-[#A0988E] uppercase tracking-wider bg-[#F5EFEB] px-2 py-1 rounded border border-[#E8E2D9]">
                    Enter ↵
                  </span>
                </div>
              </div>
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

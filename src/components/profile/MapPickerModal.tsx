"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { GoogleMap } from "@react-google-maps/api";
import { useGoogleMaps } from "@/context/GoogleMapsContext";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { MapPin, X, Check, Navigation, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Locate } from "lucide-react";

import MapAutocomplete from "@/components/ui/MapAutocomplete";

interface MapPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLat?: number;
  initialLng?: number;
  initialAddress?: string;
  onSelectLocation: (location: { address: string; lat: number; lng: number }) => void;
}

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

// Chișinău coordinates as default center
const defaultCenter = {
  lat: 47.0105,
  lng: 28.8638,
};

const retroMapStyles = [
  { elementType: "geometry", stylers: [{ color: "#ebe3cd" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#523735" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f5f1e6" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#c9b2a6" }] },
  { featureType: "administrative.land_parcel", elementType: "geometry.stroke", stylers: [{ color: "#dcd2be" }] },
  { featureType: "administrative.land_parcel", elementType: "labels.text.fill", stylers: [{ color: "#ae9e90" }] },
  { featureType: "landscape.natural", elementType: "geometry", stylers: [{ color: "#dfd2ae" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#dfd2ae" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#93817c" }] },
  { featureType: "poi.park", elementType: "geometry.fill", stylers: [{ color: "#a5b076" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#447530" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#f5f1e6" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#fdfcf8" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#f8c967" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#e9bc62" }] },
  { featureType: "road.highway.controlled_access", elementType: "geometry", stylers: [{ color: "#e98d58" }] },
  { featureType: "road.highway.controlled_access", elementType: "geometry.stroke", stylers: [{ color: "#db8555" }] },
  { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#806b63" }] },
  { featureType: "transit.line", elementType: "geometry", stylers: [{ color: "#dfd2ae" }] },
  { featureType: "transit.line", elementType: "labels.text.fill", stylers: [{ color: "#8f7d77" }] },
  { featureType: "transit.line", elementType: "labels.text.stroke", stylers: [{ color: "#ebe3cd" }] },
  { featureType: "transit.station", elementType: "geometry", stylers: [{ color: "#dfd2ae" }] },
  { featureType: "water", elementType: "geometry.fill", stylers: [{ color: "#b9d3c2" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#92998d" }] }
];

export default function MapPickerModal({
  isOpen,
  onClose,
  initialLat,
  initialLng,
  initialAddress,
  onSelectLocation,
}: MapPickerModalProps) {
  const { isLoaded, loadError } = useGoogleMaps();

  const [position, setPosition] = useState({
    lat: initialLat || defaultCenter.lat,
    lng: initialLng || defaultCenter.lng,
  });
  const [addressText, setAddressText] = useState("");
  const [geocoding, setGeocoding] = useState(false);
  const mapRef = useRef<google.maps.Map | null>(null);

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    setGeocoding(true);

    if (typeof window !== "undefined" && window.google?.maps?.Geocoder) {
      try {
        const geocoder = new window.google.maps.Geocoder();
        const res = await new Promise<string | null>((resolve) => {
          geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === "OK" && results && results[0]) {
              resolve(results[0].formatted_address);
            } else {
              resolve(null);
            }
          });
        });

        if (res) {
          setAddressText(res);
          setGeocoding(false);
          return;
        }
      } catch (e) {
        console.warn("Google reverse geocode failed...", e);
      }
    }

    setAddressText(`Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`);
    setGeocoding(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const newLat = initialLat || defaultCenter.lat;
      const newLng = initialLng || defaultCenter.lng;
      setPosition({ lat: newLat, lng: newLng });
      
      if (initialAddress) {
        setAddressText(initialAddress);
      } else {
        reverseGeocode(newLat, newLng);
      }

      const timer = setTimeout(() => {
        if (mapRef.current && window.google?.maps?.event) {
          window.google.maps.event.trigger(mapRef.current, "resize");
          mapRef.current.setCenter({ lat: newLat, lng: newLng });
        }
      }, 350);

      return () => clearTimeout(timer);
    }
  }, [isOpen, initialLat, initialLng, initialAddress, reverseGeocode]);

  const handlePan = (dLat: number, dLng: number) => {
    const newLat = position.lat + dLat;
    const newLng = position.lng + dLng;
    setPosition({ lat: newLat, lng: newLng });
    reverseGeocode(newLat, newLng);
  };

  const handleLocateMe = () => {
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      setGeocoding(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newLat = pos.coords.latitude;
          const newLng = pos.coords.longitude;
          setPosition({ lat: newLat, lng: newLng });
          reverseGeocode(newLat, newLng);
        },
        (err) => {
          console.warn("Geolocation denied or unavailable", err);
          setGeocoding(false);
        }
      );
    }
  };

  const handleDragEnd = () => {
    if (mapRef.current) {
      const center = mapRef.current.getCenter();
      if (center) {
        const newLat = center.lat();
        const newLng = center.lng();
        setPosition({ lat: newLat, lng: newLng });
        reverseGeocode(newLat, newLng);
      }
    }
  };

  const handleConfirm = () => {
    onSelectLocation({
      address: addressText || `Lat: ${position.lat.toFixed(4)}, Lng: ${position.lng.toFixed(4)}`,
      lat: position.lat,
      lng: position.lng,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Centered Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl h-[88vh] max-h-[720px] bg-[#FFFCF6] rounded-[28px] md:rounded-[32px] overflow-hidden flex flex-col shadow-2xl border border-[#E8E2D9] z-10"
        >
          {/* Header */}
          <div className="bg-[#FFFCF6] px-5 py-4 flex justify-between items-center shrink-0 border-b border-[#E8E2D9]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#D4A853]/15 flex items-center justify-center">
                <MapPin size={20} className="text-[#D4A853]" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#1A120B]">Selectează Locația de Livrare</h3>
                <p className="text-[11px] font-medium text-[#736A60]">Caută adresa sau mută harta pentru a fixa pinul</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white border border-[#E8E2D9] flex items-center justify-center text-[#736A60] hover:text-[#1A120B] hover:border-[#D4A853] transition-colors cursor-pointer shadow-sm"
            >
              <X size={18} />
            </button>
          </div>

          {/* Search Bar */}
          <div className="px-5 py-3 bg-white/70 backdrop-blur-md shrink-0 z-10 relative border-b border-[#E8E2D9]">
            <MapAutocomplete
              value={addressText}
              onChange={(val) => setAddressText(val)}
              onPlaceSelected={(lat, lng, address) => {
                setPosition({ lat, lng });
                setAddressText(address);
                if (mapRef.current) {
                  mapRef.current.panTo({ lat, lng });
                }
              }}
              placeholder="Caută adresa (stradă, număr, reper)..."
              className="w-full bg-white border border-[#E8E2D9] rounded-2xl pl-10 pr-4 py-3 text-sm text-[#1A120B] font-medium outline-none focus:border-[#D4A853] focus:ring-1 focus:ring-[#D4A853] transition-all shadow-sm"
            />
          </div>

          {/* Map Area */}
          <div className="flex-1 relative w-full bg-[#E8E2D9]/30 min-h-0">
            {/* Map Canvas */}
            <div className="w-full h-full relative">
              {isLoaded && !loadError ? (
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={position}
                  zoom={16}
                  options={{
                    disableDefaultUI: true,
                    zoomControl: false,
                    gestureHandling: "greedy",
                    styles: retroMapStyles
                  }}
                  onLoad={(map) => {
                    mapRef.current = map;
                    setTimeout(() => {
                      if (window.google?.maps?.event) {
                        window.google.maps.event.trigger(map, "resize");
                        map.setCenter(position);
                      }
                    }, 200);
                  }}
                  onDragEnd={handleDragEnd}
                  onClick={(e) => {
                    if (e.latLng) {
                      const newLat = e.latLng.lat();
                      const newLng = e.latLng.lng();
                      setPosition({ lat: newLat, lng: newLng });
                      reverseGeocode(newLat, newLng);
                    }
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#E8E2D9]/50 text-[#1A120B] font-medium text-sm p-4 text-center">
                  Se încarcă Google Maps...
                </div>
              )}
              
              {/* Center Target Pin Icon Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 pb-8">
                <div className="flex flex-col items-center">
                  <div className="bg-[#1A120B] text-[#D4A853] p-3 rounded-full shadow-2xl border-2 border-[#D4A853]">
                    <MapPin size={24} className="fill-[#1A120B]" />
                  </div>
                  <div className="w-3 h-3 bg-[#1A120B] rotate-45 -mt-1.5 border-r-2 border-b-2 border-[#D4A853]" />
                  <div className="w-6 h-2 bg-black/30 rounded-[100%] blur-[3px] mt-1" />
                </div>
              </div>

              {/* Floating Clean GPS Button */}
              <button
                type="button"
                title="Locația mea GPS"
                onClick={handleLocateMe}
                className="absolute right-4 bottom-4 z-20 w-11 h-11 bg-white hover:bg-[#D4A853] text-[#1A120B] rounded-full shadow-lg border border-[#E8E2D9] flex items-center justify-center transition-all cursor-pointer group"
              >
                <Locate size={18} className="group-hover:scale-110 transition-transform text-[#1A120B]" />
              </button>
            </div>
          </div>

          {/* Footer Address Confirmation */}
          <div className="px-5 py-4 bg-[#FFFCF6] border-t border-[#E8E2D9] shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] z-10 relative">
            <div className="flex-1 min-w-0 w-full">
              <p className="text-xs font-bold text-[#1A120B] truncate leading-tight">
                {geocoding ? "Se determină adresa..." : addressText || "Selectează o locație pe hartă"}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#D4A853] mt-0.5">
                📍 Pin fixat exact pe hartă
              </p>
            </div>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={geocoding || !position.lat}
              className="w-full sm:w-auto px-7 py-3.5 bg-[#1A120B] text-white rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#D4A853] hover:text-[#1A120B] transition-all disabled:opacity-50 cursor-pointer shadow-md shrink-0"
            >
              <Check size={16} />
              <span>Confirmă Adresa</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}




"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { GoogleMap } from "@react-google-maps/api";
import { useGoogleMaps } from "@/context/GoogleMapsContext";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, X, Check, ArrowLeft, Locate, Plus, Minus } from "lucide-react";
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
  const [isDragging, setIsDragging] = useState(false);
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
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [isOpen, initialLat, initialLng, initialAddress, reverseGeocode]);

  const handleLocateMe = () => {
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      setGeocoding(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newLat = pos.coords.latitude;
          const newLng = pos.coords.longitude;
          setPosition({ lat: newLat, lng: newLng });
          if (mapRef.current) {
            mapRef.current.panTo({ lat: newLat, lng: newLng });
          }
          reverseGeocode(newLat, newLng);
        },
        (err) => {
          console.warn("Geolocation denied or unavailable", err);
          setGeocoding(false);
        }
      );
    }
  };

  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.setZoom((mapRef.current.getZoom() || 16) + 1);
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.setZoom((mapRef.current.getZoom() || 16) - 1);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
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
      <div className="fixed inset-0 z-[99999] w-screen h-screen overflow-hidden bg-[#1A120B]">
        {/* Fullscreen Interactive Map Canvas */}
        <div className="absolute inset-0 w-full h-full">
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
              onDragStart={() => setIsDragging(true)}
              onDragEnd={handleDragEnd}
              onClick={(e) => {
                if (e.latLng) {
                  const newLat = e.latLng.lat();
                  const newLng = e.latLng.lng();
                  setPosition({ lat: newLat, lng: newLng });
                  if (mapRef.current) {
                    mapRef.current.panTo({ lat: newLat, lng: newLng });
                  }
                  reverseGeocode(newLat, newLng);
                }
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#FAF7F2] text-[#1A120B] font-medium text-sm p-4 text-center">
              Se încarcă Google Maps...
            </div>
          )}
        </div>

        {/* Center Target Luxury Pin */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 pb-8">
          <div className="flex flex-col items-center">
            <motion.div 
              animate={{ y: isDragging ? -14 : 0, scale: isDragging ? 1.1 : 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="bg-[#1A120B] text-[#D4A853] p-3 rounded-full shadow-[0_8px_25px_rgba(0,0,0,0.35)] border-2 border-[#D4A853]"
            >
              <MapPin size={28} className="fill-[#1A120B]" />
            </motion.div>
            <motion.div 
              animate={{ y: isDragging ? -14 : 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="w-3.5 h-3.5 bg-[#1A120B] rotate-45 -mt-2 border-r-2 border-b-2 border-[#D4A853]" 
            />
            <motion.div 
              animate={{ scale: isDragging ? 0.6 : 1, opacity: isDragging ? 0.3 : 0.6 }}
              transition={{ duration: 0.2 }}
              className="w-8 h-2.5 bg-black rounded-[100%] blur-[2px] mt-1" 
            />
          </div>
        </div>

        {/* Top Floating Glassmorphic Search & Navigation Bar */}
        <div className="absolute top-4 md:top-6 left-4 right-4 md:left-8 md:right-auto md:w-[500px] z-30">
          <div className="bg-[#FFFCF6]/95 backdrop-blur-xl border border-[#E8E2D9] rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#E8E2D9] flex items-center justify-center text-[#1A120B] hover:bg-[#D4A853] hover:text-[#1A120B] transition-all cursor-pointer shrink-0"
              title="Înapoi la Comandă"
            >
              <ArrowLeft size={18} />
            </button>

            <div className="flex-1 min-w-0">
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
                placeholder="Caută adresa sau reperul în Chișinău..."
                className="w-full bg-white border border-[#E8E2D9] rounded-xl pl-9 pr-3 py-2.5 text-sm text-[#1A120B] font-medium outline-none focus:border-[#D4A853] focus:ring-1 focus:ring-[#D4A853] transition-all"
              />
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-transparent flex items-center justify-center text-[#736A60] hover:text-[#1A120B] hover:bg-black/5 transition-colors cursor-pointer shrink-0"
              title="Închide"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Floating Controls: GPS & Zoom */}
        <div className="absolute right-4 md:right-8 bottom-36 md:bottom-32 z-30 flex flex-col gap-2.5">
          <button
            type="button"
            title="Locația mea curentă"
            onClick={handleLocateMe}
            className="w-12 h-12 bg-white/95 backdrop-blur-md hover:bg-[#D4A853] text-[#1A120B] rounded-2xl shadow-xl border border-[#E8E2D9] flex items-center justify-center transition-all cursor-pointer group active:scale-95"
          >
            <Locate size={20} className="group-hover:scale-110 transition-transform text-[#1A120B]" />
          </button>
          
          <div className="hidden sm:flex flex-col bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-[#E8E2D9] overflow-hidden">
            <button
              type="button"
              title="Mărește"
              onClick={handleZoomIn}
              className="w-12 h-10 flex items-center justify-center text-[#1A120B] hover:bg-[#D4A853]/20 border-b border-[#E8E2D9] transition-colors cursor-pointer"
            >
              <Plus size={18} />
            </button>
            <button
              type="button"
              title="Micșorează"
              onClick={handleZoomOut}
              className="w-12 h-10 flex items-center justify-center text-[#1A120B] hover:bg-[#D4A853]/20 transition-colors cursor-pointer"
            >
              <Minus size={18} />
            </button>
          </div>
        </div>

        {/* Bottom Floating Luxury Action Card */}
        <div className="absolute bottom-4 md:bottom-8 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-[540px] z-30">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-[#FFFCF6]/95 backdrop-blur-xl rounded-[24px] md:rounded-[28px] border border-[#E8E2D9] p-4 md:p-5 shadow-[0_16px_48px_rgba(0,0,0,0.25)] flex flex-col gap-3.5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-2 h-2 rounded-full bg-[#D4A853] animate-pulse"></span>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#D4A853]">
                    {geocoding ? "IDENTIFICARE ADRESĂ..." : "ADRESĂ LIVRARE SELECTATĂ"}
                  </p>
                </div>
                <h4 className="text-sm md:text-base font-serif font-bold text-[#1A120B] truncate leading-tight">
                  {geocoding ? "Se determină adresa exactă..." : addressText || "Selectează o locație pe hartă"}
                </h4>
                <p className="text-[11px] text-[#736A60] mt-0.5">
                  Trage harta sau mută pinul pe intrarea / scara ta
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={geocoding || !position.lat}
              className="w-full h-12 md:h-13 bg-[#1A120B] hover:bg-[#D4A853] text-white hover:text-[#1A120B] rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all disabled:opacity-50 cursor-pointer shadow-lg active:scale-[0.98]"
            >
              <Check size={18} />
              <span>Confirmă Această Adresă</span>
            </button>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}

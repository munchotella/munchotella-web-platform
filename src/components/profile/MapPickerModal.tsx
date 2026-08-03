"use client";

import React, { useState, useCallback } from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { useGoogleMaps } from "@/context/GoogleMapsContext";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, X, Check, Loader2 } from "lucide-react";

import MapAutocomplete from "@/components/ui/MapAutocomplete";

interface MapPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLat?: number;
  initialLng?: number;
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

export default function MapPickerModal({
  isOpen,
  onClose,
  initialLat,
  initialLng,
  onSelectLocation,
}: MapPickerModalProps) {
  const { isLoaded } = useGoogleMaps();

  const [position, setPosition] = useState({
    lat: initialLat || defaultCenter.lat,
    lng: initialLng || defaultCenter.lng,
  });
  const [addressText, setAddressText] = useState("");
  const [geocoding, setGeocoding] = useState(false);

  const reverseGeocode = useCallback((lat: number, lng: number) => {
    if (typeof window === "undefined" || !window.google) return;
    setGeocoding(true);
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      setGeocoding(false);
      if (status === "OK" && results && results[0]) {
        setAddressText(results[0].formatted_address);
      } else {
        setAddressText(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      }
    });
  }, []);

  const handleMarkerDragEnd = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    const newLat = e.latLng.lat();
    const newLng = e.latLng.lng();
    setPosition({ lat: newLat, lng: newLng });
    reverseGeocode(newLat, newLng);
  };

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    const newLat = e.latLng.lat();
    const newLng = e.latLng.lng();
    setPosition({ lat: newLat, lng: newLng });
    reverseGeocode(newLat, newLng);
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
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0, transition: { type: "spring", bounce: 0.4, duration: 0.6 } }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-3xl h-[80vh] bg-[#FFFCF6] rounded-[28px] overflow-hidden flex flex-col shadow-2xl relative border border-[#E8E2D9]"
        >
          {/* Header */}
          <div className="bg-[#1A120B] p-4 px-6 flex justify-between items-center text-white shrink-0">
            <div className="flex items-center gap-2">
              <MapPin size={20} className="text-[#D4A853]" />
              <h3 className="font-serif text-lg font-bold">Alege locația pe hartă</h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Map Area */}
          <div className="flex-1 relative w-full h-full bg-[#E8E2D9]/30">
            {/* Search Bar Floating Overlay */}
            <div className="absolute top-3 left-3 right-3 sm:left-6 sm:right-6 z-20">
              <MapAutocomplete
                value={addressText}
                onChange={(val) => setAddressText(val)}
                onPlaceSelected={(lat, lng, address) => {
                  setPosition({ lat, lng });
                  setAddressText(address);
                }}
                placeholder="Caută strada / adresa direct pe hartă..."
                className="w-full bg-white/95 backdrop-blur-md border border-[#D4A853]/40 rounded-2xl pl-10 pr-4 py-3 text-sm text-[#1A120B] font-medium outline-none focus:ring-2 focus:ring-[#D4A853] shadow-xl transition-all"
              />
            </div>

            {!isLoaded ? (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-[#1A120B]/60">
                <Loader2 size={32} className="animate-spin text-[#D4A853]" />
                <span className="text-sm font-medium">Se încarcă Google Maps...</span>
              </div>
            ) : (
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={position}
                zoom={15}
                onClick={handleMapClick}
                options={{
                  disableDefaultUI: false,
                  zoomControl: true,
                  streetViewControl: false,
                  mapTypeControl: false,
                }}
              >
                <Marker
                  position={position}
                  draggable={true}
                  onDragEnd={handleMarkerDragEnd}
                  animation={window.google?.maps?.Animation?.DROP}
                />
              </GoogleMap>
            )}

            {/* Instruction Badge */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#1A120B]/90 backdrop-blur-md text-white text-[11px] sm:text-xs font-medium px-4 py-2 rounded-full shadow-lg border border-[#D4A853]/30 pointer-events-none text-center">
              Trage pinul roșu sau dă click pe hartă pentru a fixa adresa
            </div>
          </div>

          {/* Footer Address Confirmation */}
          <div className="p-5 bg-white border-t border-[#E8E2D9] shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#D4A853]">Adresă selectată</span>
              <p className="text-sm font-bold text-[#1A120B] truncate mt-0.5">
                {geocoding ? "Se determină adresa..." : addressText || "Selectează o locație pe hartă"}
              </p>
              <p className="text-[11px] text-[#1A120B]/50 mt-0.5">
                Coordonate: {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
              </p>
            </div>

            <button
              onClick={handleConfirm}
              disabled={geocoding || !position.lat}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#1A120B] text-white rounded-full font-bold flex items-center justify-center gap-2 hover:bg-[#D4A853] hover:text-[#1A120B] transition-colors disabled:opacity-50"
            >
              <Check size={18} />
              <span>Confirmă Adresa</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

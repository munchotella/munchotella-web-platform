"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  initialAddress,
  onSelectLocation,
}: MapPickerModalProps) {
  const [position, setPosition] = useState({
    lat: initialLat || defaultCenter.lat,
    lng: initialLng || defaultCenter.lng,
  });
  const [addressText, setAddressText] = useState("");
  const [geocoding, setGeocoding] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    setGeocoding(true);

    // 1. OpenStreetMap Nominatim Reverse Geocoding with Address Details
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&lat=${lat}&lon=${lng}`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.address) {
          const addr = data.address;
          const road = addr.road || addr.pedestrian || addr.street || addr.footway || "";
          const houseNumber = addr.house_number || addr.building || "";
          const city = addr.city || addr.town || addr.village || addr.municipality || addr.suburb || "Chișinău";
          
          let mainText = "";
          if (road && houseNumber) {
            mainText = `${road} ${houseNumber}`;
          } else if (road) {
            mainText = road;
          } else {
            mainText = data.display_name?.split(",")[0] || "";
          }

          const cleanAddress = mainText ? `${mainText}, ${city}` : data.display_name;
          setAddressText(cleanAddress);
          setGeocoding(false);
          return;
        }
      }
    } catch (e) {
      console.warn("Nominatim reverse geocode failed, trying BigDataCloud...", e);
    }

    // 2. Try BigDataCloud Reverse Geocoding
    try {
      const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=ro`);
      if (response.ok) {
        const data = await response.json();
        const parts = [data.locality, data.city, data.countryName].filter(Boolean);
        if (parts.length > 0) {
          setAddressText(parts.join(", "));
          setGeocoding(false);
          return;
        }
      }
    } catch (e) {
      console.warn("BigDataCloud reverse geocode failed", e);
    }

    setAddressText(`Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`);
    setGeocoding(false);
  }, []);

  // Listen for Leaflet drag/pan messages from iframe
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === "MAP_MOVED") {
        const newLat = parseFloat(e.data.lat);
        const newLng = parseFloat(e.data.lng);
        if (!isNaN(newLat) && !isNaN(newLng)) {
          setPosition({ lat: newLat, lng: newLng });
          reverseGeocode(newLat, newLng);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [reverseGeocode]);

  // Sync position and trigger reverseGeocode when modal is opened or props change
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

      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage({ type: "SET_CENTER", lat: newLat, lng: newLng }, "*");
      }
    }
  }, [isOpen, initialLat, initialLng, initialAddress, reverseGeocode]);

  const updateMapCenter = (lat: number, lng: number) => {
    setPosition({ lat, lng });
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: "SET_CENTER", lat, lng }, "*");
    }
  };

  const handlePan = (dLat: number, dLng: number) => {
    const newLat = position.lat + dLat;
    const newLng = position.lng + dLng;
    updateMapCenter(newLat, newLng);
    reverseGeocode(newLat, newLng);
  };

  const handleLocateMe = () => {
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      setGeocoding(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newLat = pos.coords.latitude;
          const newLng = pos.coords.longitude;
          updateMapCenter(newLat, newLng);
          reverseGeocode(newLat, newLng);
        },
        (err) => {
          console.warn("Geolocation denied or unavailable", err);
          setGeocoding(false);
        }
      );
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

  const mapHtmlDoc = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        html, body, #map { width: 100%; height: 100%; margin: 0; padding: 0; background: #e8e2d9; }
        .leaflet-control-attribution { display: none !important; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map', { zoomControl: false, attributionControl: false }).setView([${position.lat}, ${position.lng}], 16);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19
        }).addTo(map);

        var isInternalMove = false;

        map.on('moveend', function() {
          if (isInternalMove) {
            isInternalMove = false;
            return;
          }
          var center = map.getCenter();
          window.parent.postMessage({ type: 'MAP_MOVED', lat: center.lat, lng: center.lng }, '*');
        });

        window.addEventListener('message', function(e) {
          if (e.data && e.data.type === 'SET_CENTER') {
            isInternalMove = true;
            map.setView([e.data.lat, e.data.lng], 16, { animate: true });
          }
        });
      </script>
    </body>
    </html>
  `;

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
                  setAddressText(address);
                  updateMapCenter(lat, lng);
                }}
                placeholder="Caută strada / adresa direct pe hartă..."
                className="w-full bg-white/95 backdrop-blur-md border border-[#D4A853]/40 rounded-2xl pl-10 pr-4 py-3 text-sm text-[#1A120B] font-medium outline-none focus:ring-2 focus:ring-[#D4A853] shadow-xl transition-all"
              />
            </div>

            {/* Map Canvas / Embed */}
            <div className="w-full h-full relative">
              <iframe
                ref={iframeRef}
                title="Interactive Location Picker Map"
                srcDoc={mapHtmlDoc}
                className="w-full h-full border-0"
              />
              
              {/* Center Target Pin Icon Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 pb-8">
                <div className="flex flex-col items-center animate-bounce">
                  <div className="bg-[#1A120B] text-[#D4A853] p-2.5 rounded-full shadow-2xl border-2 border-[#D4A853]">
                    <MapPin size={24} />
                  </div>
                  <div className="w-3 h-3 bg-[#1A120B] rotate-45 -mt-1.5 border-r-2 border-b-2 border-[#D4A853]" />
                  <div className="w-4 h-1.5 bg-black/40 rounded-full blur-[2px] mt-1" />
                </div>
              </div>

              {/* Floating Real-time Map Navigation D-Pad & GPS Button */}
              <div className="absolute right-4 bottom-14 z-20 flex flex-col items-center gap-1.5 bg-white/90 backdrop-blur-md p-2 rounded-2xl shadow-xl border border-[#E8E2D9]">
                <button
                  type="button"
                  title="Ajustează Nord"
                  onClick={() => handlePan(0.0004, 0)}
                  className="p-2 hover:bg-[#D4A853]/20 rounded-xl text-[#1A120B] transition-all active:scale-95"
                >
                  <ChevronUp size={18} />
                </button>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    title="Ajustează Vest"
                    onClick={() => handlePan(0, -0.0004)}
                    className="p-2 hover:bg-[#D4A853]/20 rounded-xl text-[#1A120B] transition-all active:scale-95"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    title="Locația mea GPS"
                    onClick={handleLocateMe}
                    className="p-2 bg-[#D4A853] text-[#1A120B] rounded-xl shadow font-bold hover:bg-[#C09640] transition-all active:scale-95"
                  >
                    <Locate size={18} />
                  </button>
                  <button
                    type="button"
                    title="Ajustează Est"
                    onClick={() => handlePan(0, 0.0004)}
                    className="p-2 hover:bg-[#D4A853]/20 rounded-xl text-[#1A120B] transition-all active:scale-95"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
                <button
                  type="button"
                  title="Ajustează Sud"
                  onClick={() => handlePan(-0.0004, 0)}
                  className="p-2 hover:bg-[#D4A853]/20 rounded-xl text-[#1A120B] transition-all active:scale-95"
                >
                  <ChevronDown size={18} />
                </button>
              </div>
            </div>

            {/* Instruction Badge */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#1A120B]/90 backdrop-blur-md text-white text-[11px] sm:text-xs font-medium px-4 py-2 rounded-full shadow-lg border border-[#D4A853]/30 pointer-events-none text-center">
              Trage de hartă pentru a fixa pin-ul la locația dorită
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



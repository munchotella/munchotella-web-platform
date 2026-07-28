"use client";

import React, { useEffect, useRef, useState } from "react";

// Coordonate aproximative pentru Nicolae Testemițeanu 21/1, Chișinău
const center = {
  lat: 46.9975,
  lng: 28.8250,
};

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  styles: [
    { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
    { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
    { featureType: "administrative.land_parcel", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
    { featureType: "poi", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
    { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
    { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] },
    { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
    { featureType: "road.arterial", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#dadada" }] },
    { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
    { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
    { featureType: "transit.line", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] },
    { featureType: "transit.station", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9c9c9" }] },
    { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
  ],
};

export default function MapSection() {
  return (
    <section className="w-full bg-[#FCF9F4] py-16 md:py-24 border-t border-[#E8E2D9]">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="text-[12px] font-bold uppercase text-[#D4A853] tracking-widest mb-4 block">
            Locația Noastră
          </span>
          <h2 className="font-serif text-3xl md:text-5xl font-medium text-[#1A120B] mb-6">
            Te așteptăm la Boutique
          </h2>
          <p className="text-[#736A60] font-sans text-[16px] leading-relaxed mb-8 max-w-md">
            Experimentează gustul premium chiar din inima orașului Chișinău. Spațiul nostru artizanal este gândit pentru a-ți oferi nu doar un desert, ci o adevărată experiență senzorială.
          </p>
          
          <div className="flex items-start gap-4 mb-6">
            <span className="material-symbols-outlined text-[#D4A853] text-[28px] mt-1">location_on</span>
            <div>
              <h4 className="font-bold text-[#1A120B] text-lg">Munchotella Boutique</h4>
              <p className="text-[#736A60] mt-1">Str. Nicolae Testemițeanu 21/1<br/>Chișinău, Republica Moldova</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <span className="material-symbols-outlined text-[#D4A853] text-[28px] mt-1">schedule</span>
            <div>
              <h4 className="font-bold text-[#1A120B] text-lg">Program</h4>
              <p className="text-[#736A60] mt-1">Luni - Duminică: 16:00 - 00:00<br/><span className="text-[#D4A853] font-bold text-[14px]">Miercuri: Închis</span></p>
            </div>
          </div>
        </div>
        
        <div className="h-[400px] md:h-[500px] w-full rounded-2xl overflow-hidden shadow-2xl border border-[#E8E2D9] relative">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2721.2307317529003!2d28.83227137672343!3d46.9964423299121!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40c97fb3bb17dd4f%3A0x5854017f25b025e6!2sMunchotella!5e0!3m2!1sen!2s!4v1785244588653!5m2!1sen!2s" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen={false} 
            loading="lazy" 
            referrerPolicy="strict-origin-when-cross-origin"
          ></iframe>
        </div>
      </div>
    </section>
  );
}

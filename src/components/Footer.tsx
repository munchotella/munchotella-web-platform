"use client";

import React from "react";
import Link from "next/link";
import LogoIconSVG from "./LogoIconSVG";
import LogoTextSVG from "./LogoTextSVG";

export default function Footer() {
  return (
    <footer className="bg-[#1A120B] text-white pt-20 pb-32 md:pb-10 border-t border-[#D4A853]/20 relative z-10 w-full">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-16 pb-16">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 group z-50 mb-6">
              <LogoIconSVG className="h-9 w-9 opacity-90 transition-transform duration-300 group-hover:scale-105 text-[#f3922c]" />
              <LogoTextSVG className="h-[45px] w-auto text-[#FDF9F1] transition-colors duration-300 group-hover:text-[#D4A853]" />
            </Link>

            <div className="flex flex-col space-y-3">
              <a href="https://maps.google.com/?q=Nicolae+Testemițeanu+21/1" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 text-white/40 text-[13px] hover:text-white transition-colors group">
                <span className="material-symbols-outlined text-[16px] group-hover:text-[#D4A853]">location_on</span>
                <span>Nicolae Testemițeanu 21/1, Chișinău</span>
              </a>
              <a href="tel:+37379006499" className="flex items-center space-x-3 text-white/40 text-[13px] hover:text-white transition-colors group">
                <span className="material-symbols-outlined text-[16px] group-hover:text-[#D4A853]">phone</span>
                <span>079 006 499</span>
              </a>
              <a href="mailto:munchotella@gmail.com" className="flex items-center space-x-3 text-white/40 text-[13px] hover:text-white transition-colors group">
                <span className="material-symbols-outlined text-[16px] group-hover:text-[#D4A853]">mail</span>
                <span>munchotella@gmail.com</span>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-[#D4A853] text-[13px] font-bold uppercase mb-6 tracking-widest">Explorați</h4>
            <ul className="space-y-4">
              <li><Link href="/about" className="text-white/60 text-[15px] hover:text-[#D4A853] transition-colors">Povestea Noastră</Link></li>
              <li><Link href="/menu" className="text-white/60 text-[15px] hover:text-[#D4A853] transition-colors">Meniul Complet</Link></li>
              <li><Link href="/#testimonials" className="text-white/60 text-[15px] hover:text-[#D4A853] transition-colors">Recenzii</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[#D4A853] text-[13px] font-bold uppercase mb-6 tracking-widest">Suport</h4>
            <ul className="space-y-4">
              <li><Link href="/contact" className="text-white/60 text-[15px] hover:text-[#D4A853] transition-colors">Contact</Link></li>
              <li><Link href="/legal#privacy" className="text-white/60 text-[15px] hover:text-[#D4A853] transition-colors">Politica de Confidențialitate</Link></li>
              <li><Link href="/legal#terms" className="text-white/60 text-[15px] hover:text-[#D4A853] transition-colors">Termeni și Condiții</Link></li>
              <li><Link href="/legal#delivery" className="text-white/60 text-[15px] hover:text-[#D4A853] transition-colors">Informații Livrare</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-[#D4A853] text-[13px] font-bold uppercase mb-6 tracking-widest">Urmărește-ne</h4>
            <div className="flex space-x-4">
              <a href="https://www.instagram.com/munchotella.md" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:border-[#D4A853] hover:text-[#D4A853] hover:bg-[#D4A853]/10 transition-all duration-300 group">
                <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="https://www.facebook.com/Munchotella" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:border-[#D4A853] hover:text-[#D4A853] hover:bg-[#D4A853]/10 transition-all duration-300 group">
                <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="https://www.tiktok.com/@munchotella" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:border-[#D4A853] hover:text-[#D4A853] hover:bg-[#D4A853]/10 transition-all duration-300 group flex-col">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="group-hover:scale-110 transition-transform duration-300">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 15.71a6.34 6.34 0 0 0 10.86 4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.53z"/>
                </svg>
              </a>
            </div>
            <div className="mt-8">
              <p className="text-white/40 text-[12px] uppercase tracking-widest font-bold mb-2">Program</p>
              <p className="text-white/80 text-[14px]">Luni - Duminică: 16:00 - 00:00</p>
              <p className="text-[#D4A853] text-[13px] font-bold mt-1">Miercuri: Închis</p>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between">
          <p className="text-white/40 text-[13px] text-center md:text-left mb-4 md:mb-0">
            © {new Date().getFullYear()} Munchotella. Toate drepturile rezervate.<br/>
            <span className="text-[11px] mt-1 block">IDNO: 1017600046702, "Munchotella" S.R.L.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

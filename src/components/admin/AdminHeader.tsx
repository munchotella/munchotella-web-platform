import React from 'react';
import { Bell, Search } from 'lucide-react';

interface AdminHeaderProps {
  title: string;
}

export default function AdminHeader({ title }: AdminHeaderProps) {
  return (
    <header className="h-24 bg-vanilla-porcelain border-b border-warm-border flex items-center justify-between px-10 sticky top-0 z-10">
      <div>
        <h2 className="font-headline-md text-cacao-dark text-3xl">{title}</h2>
        <div className="flex items-center gap-2 mt-1">
          <span className="w-2 h-2 rounded-full bg-soft-olive animate-pulse"></span>
          <span className="font-label-caps text-soft-olive text-[11px] tracking-wider uppercase">
            Sincronizare Activă: App + Web
          </span>
        </div>
      </div>

      <div className="flex items-center gap-8">
        <div className="flex items-center gap-6 text-cacao-dark/60 font-label-caps text-xs tracking-wider">
          <button className="hover:text-gold-saffron transition-colors">VÂNZĂRI DIRECTE</button>
          <button className="hover:text-gold-saffron transition-colors">COMENZI PERSONALIZATE</button>
          <button className="hover:text-gold-saffron transition-colors">EVENIMENTE</button>
        </div>
        
        <div className="w-[1px] h-8 bg-warm-border"></div>
        
        <div className="flex items-center gap-4">
          <button className="w-10 h-10 rounded-full hover:bg-black/5 flex items-center justify-center transition-colors text-cacao-dark">
            <Search size={20} />
          </button>
          <button className="w-10 h-10 rounded-full hover:bg-black/5 flex items-center justify-center transition-colors text-cacao-dark relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-gold-saffron rounded-full border border-vanilla-porcelain"></span>
          </button>
          <div className="w-10 h-10 rounded-full bg-gold-saffron/20 border border-gold-saffron/50 flex items-center justify-center font-headline-md text-gold-saffron ml-2">
            G
          </div>
        </div>
      </div>
    </header>
  );
}

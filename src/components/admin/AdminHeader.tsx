import React from 'react';
import { Bell, Search, Menu } from 'lucide-react';

interface AdminHeaderProps {
  title: string;
  onMenuClick?: () => void;
}

export default function AdminHeader({ title, onMenuClick }: AdminHeaderProps) {
  return (
    <header className="h-24 bg-vanilla-porcelain border-b border-warm-border flex items-center justify-between px-6 lg:px-10 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        {onMenuClick && (
          <button 
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-2 text-cacao-dark hover:bg-black/5 rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>
        )}
        <div>
          <h2 className="font-headline-md text-cacao-dark text-2xl lg:text-3xl">{title}</h2>
          <div className="flex items-center gap-2 mt-1">
          <span className="w-2 h-2 rounded-full bg-soft-olive animate-pulse"></span>
          <span className="font-label-caps text-soft-olive text-[11px] tracking-wider uppercase">
            Sincronizare Activă: App + Web
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 lg:gap-8">
        <div className="hidden lg:flex items-center gap-6 text-cacao-dark/60 font-label-caps text-xs tracking-wider">
          <button className="hover:text-gold-saffron transition-colors">VÂNZĂRI DIRECTE</button>
          <button className="hover:text-gold-saffron transition-colors">COMENZI PERSONALIZATE</button>
          <button className="hover:text-gold-saffron transition-colors">EVENIMENTE</button>
        </div>
        
        <div className="hidden lg:block w-[1px] h-8 bg-warm-border"></div>
        
        <div className="flex items-center gap-2 lg:gap-4">
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

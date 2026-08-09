"use client";

import React, { useState, useEffect } from 'react';
import { Bell, Search, Menu } from 'lucide-react';
import Link from 'next/link';

interface AdminHeaderProps {
  title: string;
  onMenuClick?: () => void;
}

export default function AdminHeader({ title, onMenuClick }: AdminHeaderProps) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("munchotella_user");
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Eroare la citirea utilizatorului:", e);
    }
  }, []);

  const avatarUrl = user?.avatar || user?.image || user?.profileImage;
  const userInitial = (user?.name || user?.email || user?.phone || "Admin").charAt(0).toUpperCase();

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
      </div>

      <div className="flex items-center gap-4 lg:gap-8">
        <div className="hidden lg:flex items-center gap-6 text-cacao-dark/60 font-label-caps text-xs tracking-wider">
          <Link href="/ro/admin/orders" className="hover:text-gold-saffron transition-colors">VÂNZĂRI DIRECTE</Link>
          <Link href="/ro/admin/orders" className="hover:text-gold-saffron transition-colors">COMENZI PERSONALIZATE</Link>
          <Link href="/ro/admin/marketing" className="hover:text-gold-saffron transition-colors">EVENIMENTE</Link>
        </div>
        
        <div className="hidden lg:block w-[1px] h-8 bg-warm-border"></div>
        
        <div className="flex items-center gap-2 lg:gap-4">
          <Link href="/ro/admin/orders" className="w-10 h-10 rounded-full hover:bg-black/5 flex items-center justify-center transition-colors text-cacao-dark" title="Căutare Globală Comenzi">
            <Search size={20} />
          </Link>
          <Link href="/ro/admin/crm" className="w-10 h-10 rounded-full hover:bg-black/5 flex items-center justify-center transition-colors text-cacao-dark relative" title="Notificări & Oaspeți">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-gold-saffron rounded-full border border-vanilla-porcelain"></span>
          </Link>

          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt={user?.name || "Profil Admin"}
              className="w-10 h-10 rounded-full border border-gold-saffron/50 object-cover ml-2"
              onError={(e: any) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gold-saffron/20 border border-gold-saffron/50 flex items-center justify-center font-headline-md text-gold-saffron ml-2 font-bold" title={user?.name || user?.email || "Admin"}>
              {userInitial}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

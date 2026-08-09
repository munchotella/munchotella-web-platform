"use client";

import React from 'react';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { LayoutDashboard, ShoppingBag, Utensils, Users, Ticket, Bot, LogOut, X } from 'lucide-react';
import { adminFetch } from '@/lib/adminApi';

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function AdminSidebar({ isOpen = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  
  // Clean locale from pathname for exact matching (e.g., /ro/admin -> /admin)
  const isMatch = (path: string) => {
    return pathname.endsWith(path);
  };

  const handleLogout = async () => {
    try {
      // Backend revocă refresh token-ul și șterge cookie-ul HttpOnly access_token
      await adminFetch('/auth/logout', { method: 'POST' }).catch(() => {});
    } finally {
      // Ștergem DOAR datele de profil din localStorage (tokenul nu mai e acolo — VUL-001 fix)
      localStorage.removeItem('munchotella_user');
      window.location.href = '/ro/admin';
    }
  };

  const navItems = [
    { name: 'Tablou de Bord', href: '/admin', icon: LayoutDashboard },
    { name: 'Comenzi în Curs', href: '/admin/orders', icon: ShoppingBag },
    { name: 'Meniu și Oferte', href: '/admin/menu', icon: Utensils },
    { name: 'Oaspeți și Recunoștință', href: '/admin/crm', icon: Users },
    { name: 'Promoții și Cuponuri', href: '/admin/marketing', icon: Ticket },
    { name: 'Asistent AI Instagram', href: '/admin/ai-settings', icon: Bot },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-cacao-dark/80 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        ></div>
      )}
      
      <aside className={`
        fixed left-0 top-0 h-screen w-72 bg-cacao-dark text-vanilla-porcelain flex flex-col border-r border-[#2A1F18] z-40
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-8 pb-4 flex items-center justify-between">
          <div>
            <h1 className="font-headline-md text-2xl tracking-tight text-gold-saffron mb-2">
              Munchotella
            </h1>
            <p className="font-label-caps text-[10px] text-vanilla-porcelain/60 uppercase tracking-widest">
              Boutique Admin Suite
            </p>
          </div>
          {onClose && (
            <button onClick={onClose} className="lg:hidden text-vanilla-porcelain/60 hover:text-vanilla-porcelain">
              <X size={24} />
            </button>
          )}
        </div>

      <nav className="flex-1 px-4 py-8 space-y-2">
        {navItems.map((item) => {
          const active = isMatch(item.href);
          const Icon = item.icon;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-300 font-body-md ${
                active 
                  ? 'bg-gold-saffron/10 text-gold-saffron font-medium' 
                  : 'text-vanilla-porcelain/70 hover:bg-[#2A1F18] hover:text-vanilla-porcelain'
              }`}
            >
              <Icon size={18} strokeWidth={active ? 2.5 : 2} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-[#2A1F18]">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-4 px-4 py-3 rounded-lg text-vanilla-porcelain/70 hover:text-error hover:bg-error/10 transition-colors w-full font-body-md cursor-pointer"
        >
          <LogOut size={18} />
          <span>Ieșire Cont</span>
        </button>
      </div>
    </aside>
    </>
  );
}

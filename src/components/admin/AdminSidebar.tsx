import React from 'react';
import { Link, usePathname } from '@/i18n/routing';
import { LayoutDashboard, ShoppingBag, Utensils, Users, Ticket, Bot, LogOut } from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();
  
  // Clean locale from pathname for exact matching (e.g., /ro/admin -> /admin)
  const isMatch = (path: string) => {
    return pathname.endsWith(path);
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
    <aside className="w-72 bg-cacao-dark text-vanilla-porcelain h-screen flex flex-col fixed left-0 top-0 border-r border-[#2A1F18] z-20">
      <div className="p-8 pb-4">
        <h1 className="font-headline-md text-2xl tracking-tight text-gold-saffron mb-2">
          Munchotella
        </h1>
        <p className="font-label-caps text-[10px] text-vanilla-porcelain/60 uppercase tracking-widest">
          Boutique Admin Suite
        </p>
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
        <button className="flex items-center gap-4 px-4 py-3 rounded-lg text-vanilla-porcelain/70 hover:text-error transition-colors w-full font-body-md">
          <LogOut size={18} />
          <span>Ieșire Cont</span>
        </button>
      </div>
    </aside>
  );
}

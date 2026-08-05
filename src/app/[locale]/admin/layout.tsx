"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Settings, 
  Megaphone, 
  PackageSearch, 
  Users, 
  LogOut,
  Menu,
  X
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: "Analytics & Vânzări", href: "/admin", icon: LayoutDashboard },
    { name: "Marketing & Promoții", href: "/admin/marketing", icon: Megaphone },
    { name: "Stoc Inteligent", href: "/admin/inventory", icon: PackageSearch },
    { name: "Setări AI (Instagram)", href: "/admin/ai-settings", icon: Settings },
    { name: "Clienți (CRM)", href: "/admin/crm", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between bg-[var(--card)] p-4 border-b border-[var(--primary)]/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--primary)] text-white flex items-center justify-center font-bold">M</div>
          <span className="font-bold text-[var(--foreground)]">Control Center</span>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 bg-[var(--primary)]/10 rounded-lg text-[var(--primary)]">
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 fixed md:static inset-y-0 left-0 z-50 w-64 bg-[var(--card)] border-r border-[var(--primary)]/10 transition-transform duration-300 ease-in-out flex flex-col
      `}>
        <div className="hidden md:flex items-center gap-3 p-6 border-b border-[var(--primary)]/10">
          <div className="w-10 h-10 rounded-xl bg-[var(--primary)] text-white flex items-center justify-center font-bold shadow-lg shadow-[var(--primary)]/20">M</div>
          <div className="flex flex-col">
            <span className="font-bold text-[var(--foreground)] leading-tight">Munchotella</span>
            <span className="text-xs text-[var(--foreground)]/50">Control Center</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  isActive 
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-md shadow-[var(--primary)]/20" 
                    : "text-[var(--foreground)]/70 hover:bg-[var(--primary)]/10 hover:text-[var(--primary)]"
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-[var(--primary-foreground)]" : "text-[var(--primary)]"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[var(--primary)]/10">
          <button className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-xl font-medium text-red-500 hover:bg-red-50 transition-colors">
            <LogOut className="w-5 h-5" />
            Deconectare
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-black/20 z-40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

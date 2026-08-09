"use client";

import React, { useState, useEffect } from "react";
import LuxuryButton from "@/components/admin/LuxuryButton";
import BentoKpiCard from "@/components/admin/BentoKpiCard";
import StatusBadge from "@/components/admin/StatusBadge";
import SlideOver from "@/components/admin/SlideOver";
import { adminFetch } from "@/lib/adminApi";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import { 
  Users, Star, Gift, ChevronRight, Award, AlertCircle, 
  ShieldCheck, Send, CheckSquare, Square, Tag, BellRing 
} from "lucide-react";

export default function CrmPage() {
  const [guests, setGuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selection & Notification State
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isPromoModalOpen, setPromoModalOpen] = useState(false);
  const [promoCodes, setPromoCodes] = useState<any[]>([]);
  const [selectedPromoCode, setSelectedPromoCode] = useState("");
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationBody, setNotificationBody] = useState("");
  const [sendingNotification, setSendingNotification] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const loadGuests = async () => {
    try {
      setLoading(true);
      const res = await adminFetch("/admin/users");
      if (res?.success) {
        const list = Array.isArray(res.data) ? res.data : (res.data?.users || []);
        setGuests(list);
      }
    } catch (err: any) {
      const msg = err.message || "Eroare la preluarea oaspeților";
      if (msg.includes("autentificat") || msg.includes("401") || msg.includes("Unauthorized")) {
        localStorage.removeItem("munchotella_token");
        localStorage.removeItem("munchotella_user");
        window.dispatchEvent(new Event("storage"));
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadPromoCodes = async () => {
    try {
      const res = await adminFetch("/admin/promoCodes?limit=100");
      if (res?.success) {
        const list = Array.isArray(res.data) 
          ? res.data 
          : (res.data?.promoCodes || []);
        setPromoCodes(list);
      }
    } catch (e) {
      console.error("Eroare la încărcarea promoțiilor:", e);
    }
  };

  useEffect(() => {
    loadGuests();
  }, []);

  const handleToggleRole = async (guest: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const newRole = guest.role === "admin" ? "customer" : "admin";
    const roleText = newRole === "admin" ? "Administrator" : "Client Normal";
    if (!confirm(`Ești sigur că vrei să schimbi rolul utilizatorului ${guest.name || guest.email} în ${roleText}?`)) return;

    try {
      const res = await adminFetch(`/admin/users/${guest._id}/role`, {
        method: "PUT",
        body: JSON.stringify({ role: newRole }),
      });
      if (res?.success) {
        alert(res.message || "Rol actualizat cu succes!");
        await loadGuests();
      }
    } catch (err: any) {
      alert("Eroare la schimbarea rolului: " + (err.message || "Apel eșuat"));
    }
  };

  const handleOpenNotificationModal = async () => {
    await loadPromoCodes();
    setPromoModalOpen(true);
  };

  const handleSelectPromoCode = (code: string) => {
    setSelectedPromoCode(code);
    const found = promoCodes.find(p => p.code === code);
    if (found) {
      const valStr = `${found.discountValue}${found.discountType === 'percentage' ? '%' : ' MDL'}`;
      setNotificationTitle(`Surpriză Munchotella: Cupon ${found.code}! 🎁`);
      setNotificationBody(`Ai primit o reducere specială de ${valStr} cu codul ${found.code}. Folosește-l la comanda ta!`);
    } else {
      setNotificationTitle("");
      setNotificationBody("");
    }
  };

  const handleToggleSelectUser = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedUserIds(prev => 
      prev.includes(id) ? prev.filter(uId => uId !== id) : [...prev, id]
    );
  };

  const filteredGuests = guests.filter((g) => {
    const q = searchQuery.toLowerCase();
    return (
      (g.name && g.name.toLowerCase().includes(q)) ||
      (g.email && g.email.toLowerCase().includes(q)) ||
      (g.phone && g.phone.toLowerCase().includes(q))
    );
  });

  const isAllSelected = filteredGuests.length > 0 && selectedUserIds.length === filteredGuests.length;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredGuests.map(g => g._id));
    }
  };

  const handleSendTargetedNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notificationTitle || !notificationBody) {
      alert("Te rugăm să introduci titlul și mesajul notificării.");
      return;
    }

    try {
      setSendingNotification(true);
      const res = await adminFetch("/admin/notifications/send", {
        method: "POST",
        body: JSON.stringify({
          title: notificationTitle,
          body: notificationBody,
          userIds: selectedUserIds.length > 0 ? selectedUserIds : undefined,
          audience: selectedUserIds.length === 0 ? "all" : undefined,
          promoCode: selectedPromoCode || undefined,
        }),
      });
      alert(res?.message || "Notificarea a fost trimisă cu succes!");
      setPromoModalOpen(false);
      setSelectedUserIds([]);
    } catch (err: any) {
      alert("Eroare la expedierea notificării: " + (err.message || "Apel eșuat"));
    } finally {
      setSendingNotification(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      
      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px] bg-warm-border rounded-2xl overflow-hidden border border-warm-border mb-8">
        <BentoKpiCard 
          title="Total Oaspeți"
          value={(guests?.length || 0).toString()}
          trend="Înregistrați în platformă"
          trendPositive={true}
          icon={<Users size={24} />}
          className="rounded-none border-0"
        />
        <BentoKpiCard 
          title="Oaspeți VIP (Recurenți)"
          value="184"
          subtitle="Programe de fidelitate active (estimat)"
          icon={<Award size={24} />}
          className="rounded-none border-0"
        />
        <BentoKpiCard 
          title="Rata de Întoarcere"
          value="68%"
          trend="+5% față de luna trecută"
          trendPositive={true}
          icon={<Star size={24} />}
          className="rounded-none border-0"
        />
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-headline-md text-cacao-dark text-xl">Oaspeți Recenți</h3>
          <p className="font-body-md text-cacao-dark/60 text-sm">
            {selectedUserIds.length > 0 
              ? `${selectedUserIds.length} client(i) selectat(i) pentru notificare promoțională` 
              : "Selectează clienții pentru a le trimite o promoție dedicată."}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Caută după nume sau email..."
            className="px-4 py-2.5 bg-vanilla-porcelain border border-warm-border rounded-lg text-cacao-dark font-body-md focus:outline-none focus:border-gold-saffron transition-colors w-full sm:w-64 text-sm"
          />
          <LuxuryButton 
            variant="primary" 
            icon={<Send size={16} />}
            onClick={handleOpenNotificationModal}
            disabled={sendingNotification}
          >
            {selectedUserIds.length > 0 
              ? `Trimite Promoție (${selectedUserIds.length})` 
              : "Trimite Notificare Promo"}
          </LuxuryButton>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="w-12 h-12 border-4 border-gold-saffron border-t-transparent rounded-full animate-spin"></div>
          <p className="font-body-md text-cacao-dark/60 animate-pulse">Se preiau profilele oaspeților...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4 bg-vanilla-porcelain border border-warm-border rounded-2xl">
          <AlertCircle size={48} className="text-cacao-dark/20" />
          <h3 className="font-headline-md text-xl text-cacao-dark">Eroare CRM</h3>
          <p className="font-body-md text-cacao-dark/60">{error}</p>
          <LuxuryButton onClick={loadGuests}>Reîncearcă</LuxuryButton>
        </div>
      ) : (
        <div className="bg-vanilla-porcelain border border-warm-border rounded-2xl overflow-hidden overflow-x-auto shadow-sm">
          <div className="min-w-[850px]">
            {/* Header Table Bar */}
            <div className="grid grid-cols-12 gap-4 p-5 border-b border-warm-border bg-[#FAF7F2] font-label-caps text-cacao-dark/70 text-xs items-center">
              <div className="col-span-1 flex items-center justify-center">
                <button 
                  onClick={handleToggleSelectAll} 
                  className="text-gold-saffron hover:scale-110 transition-transform cursor-pointer"
                  title={isAllSelected ? "Deselectează toți" : "Selectează toți clienții"}
                >
                  {isAllSelected ? <CheckSquare size={18} /> : <Square size={18} className="text-cacao-dark/30" />}
                </button>
              </div>
              <div className="col-span-4">Oaspete</div>
              <div className="col-span-3">Contact</div>
              <div className="col-span-2 text-center">Rol</div>
              <div className="col-span-2 text-right">Acțiuni</div>
            </div>

            <div className="divide-y divide-warm-border/50">
            {filteredGuests.length === 0 ? (
              <div className="p-8 text-center text-cacao-dark/60 font-body-md">Nu există niciun client înregistrat corespunzător căutării.</div>
            ) : (
              filteredGuests.map((guest) => {
                const initial = guest.name ? guest.name.charAt(0).toUpperCase() : '?';
                const isSelected = selectedUserIds.includes(guest._id);

                return (
                  <div 
                    key={guest._id} 
                    onClick={(e) => handleToggleSelectUser(guest._id, e)}
                    className={`grid grid-cols-12 gap-4 p-5 items-center transition-colors cursor-pointer group ${
                      isSelected ? "bg-gold-saffron/10 border-l-4 border-l-gold-saffron" : "hover:bg-[#FAF7F2]"
                    }`}
                  >
                    <div className="col-span-1 flex items-center justify-center">
                      <button 
                        onClick={(e) => handleToggleSelectUser(guest._id, e)} 
                        className="text-gold-saffron cursor-pointer"
                      >
                        {isSelected ? <CheckSquare size={18} /> : <Square size={18} className="text-cacao-dark/30 group-hover:text-gold-saffron/60" />}
                      </button>
                    </div>

                    <div className="col-span-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gold-saffron/10 border border-gold-saffron/30 flex items-center justify-center font-headline-md text-gold-saffron font-bold">
                        {initial}
                      </div>
                      <div>
                        <div className="font-body-md font-medium text-cacao-dark">{guest.name || "Anonim"}</div>
                        <div className="font-label-caps text-[10px] text-cacao-dark/50 mt-1">
                          Creat: {new Date(guest.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="col-span-3 font-body-md text-cacao-dark/80 text-sm">
                      {guest.email || guest.phone || "Fără contact"}
                    </div>

                    <div className="col-span-2 text-center flex justify-center">
                      <StatusBadge 
                        status={guest.role === 'admin' ? 'warning' : 'success'} 
                        label={guest.role === 'admin' ? 'Administrator' : 'Client'} 
                      />
                    </div>

                    <div className="col-span-2 flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => handleToggleRole(guest, e)}
                        className="px-3 py-1.5 bg-gold-saffron/10 hover:bg-gold-saffron/20 border border-gold-saffron/40 rounded-lg text-gold-saffron font-label-caps text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                        title={guest.role === 'admin' ? 'Revocă Acces Administrator' : 'Acordă Acces Administrator'}
                      >
                        <ShieldCheck size={14} />
                        <span>{guest.role === 'admin' ? 'Revocă Admin' : 'Acordă Admin'}</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          </div>
        </div>
      )}

      {/* SlideOver Panel for Targeted Promo Notification */}
      <SlideOver
        isOpen={isPromoModalOpen}
        onClose={() => setPromoModalOpen(false)}
        title="Trimite Notificare Promoțională"
      >
        <form onSubmit={handleSendTargetedNotification} className="space-y-6">
          
          <div className="bg-gold-saffron/10 p-4 rounded-xl border border-gold-saffron/30 flex items-center gap-3">
            <BellRing className="text-gold-saffron shrink-0" size={24} />
            <div className="text-xs font-body-md text-cacao-dark">
              <span className="font-bold block">Grup Țintă:</span>
              {selectedUserIds.length > 0 
                ? `${selectedUserIds.length} client(i) selectat(i) din listă.` 
                : "Toți clienții înregistrați în platformă (Trimitere Globală)."}
            </div>
          </div>

          <div>
            <label className="block font-label-caps text-xs text-cacao-dark/70 uppercase mb-2 flex items-center gap-2">
              <Tag size={14} className="text-gold-saffron" />
              <span>Alege Promoția / Cuponul</span>
            </label>
            <select
              value={selectedPromoCode}
              onChange={(e) => handleSelectPromoCode(e.target.value)}
              className="w-full px-4 py-3 bg-vanilla-porcelain border border-warm-border rounded-xl text-cacao-dark font-body-md focus:outline-none focus:border-gold-saffron text-sm"
            >
              <option value="">-- Fără Cupon Ataşat (Doar Mesaj Text) --</option>
              {promoCodes.map((promo) => (
                <option key={promo._id} value={promo.code}>
                  {promo.code} — {promo.title} ({promo.discountValue}{promo.discountType === 'percentage' ? '%' : ' MDL'}) {!promo.isActive ? '[INACTIV]' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-label-caps text-xs text-cacao-dark/70 uppercase mb-2">
              Titlul Notificării *
            </label>
            <input
              type="text"
              required
              value={notificationTitle}
              onChange={(e) => setNotificationTitle(e.target.value)}
              placeholder="ex: Surpriză VIP Munchotella 🎁"
              className="w-full px-4 py-3 bg-vanilla-porcelain border border-warm-border rounded-xl text-cacao-dark font-body-md focus:outline-none focus:border-gold-saffron text-sm"
            />
          </div>

          <div>
            <label className="block font-label-caps text-xs text-cacao-dark/70 uppercase mb-2">
              Mesajul Notificării *
            </label>
            <textarea
              required
              rows={4}
              value={notificationBody}
              onChange={(e) => setNotificationBody(e.target.value)}
              placeholder="ex: Ai primit o reducere specială de 20% cu codul MUNCH20..."
              className="w-full px-4 py-3 bg-vanilla-porcelain border border-warm-border rounded-xl text-cacao-dark font-body-md focus:outline-none focus:border-gold-saffron text-sm resize-none"
            />
          </div>

          <div className="pt-4 border-t border-warm-border">
            <LuxuryButton
              type="submit"
              variant="primary"
              className="w-full py-4"
              disabled={sendingNotification}
              icon={<Send size={16} />}
            >
              {sendingNotification ? "Se expediază..." : "TRIMITE NOTIFICAREA SELECȚIEI"}
            </LuxuryButton>
          </div>

        </form>
      </SlideOver>

    </div>
  );
}

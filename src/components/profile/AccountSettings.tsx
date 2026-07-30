"use client";

import React, { useState, useEffect } from "react";
import { User, Mail, Phone, Calendar, Lock, Trash2, Camera } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AccountSettings() {
  const { user, token, updateUser, logout } = useAuth();
  
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || "",
    gender: user?.gender || "other",
    dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : "",
  });
  
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    newPass: "",
    confirm: ""
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    
    if (file.size > 5 * 1024 * 1024) {
      alert("Imaginea este prea mare. Dimensiunea maximă admisă este de 5MB.");
      return;
    }

    try {
      setUploadingAvatar(true);
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await fetch(`${API_URL}/users/avatar`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });
      const data = await res.json();
      
      if (data.success && data.avatarUrl) {
        updateUser({ avatarUrl: data.avatarUrl });
      } else {
        alert(data.message || "Eroare la încărcarea imaginii.");
      }
    } catch (err) {
      console.error("Avatar upload error:", err);
      alert("A apărut o eroare la încărcarea fotografiei.");
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
// ... (code omitted for brevity but we use multi_replace for accuracy)
// Let me cancel this and use multi_replace to be more precise so I don't break the component.

    try {
      setSavingProfile(true);
      const payload: any = {
        name: form.name,
        phone: form.phone,
        email: form.email,
        gender: form.gender
      };

      if (form.dateOfBirth && !user?.birthdayRewardSentAt) {
        payload.dateOfBirth = new Date(form.dateOfBirth).toISOString();
      }

      const res = await fetch(`${API_URL}/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.success) {
        updateUser(payload);
        alert("Profil actualizat cu succes!");
      } else {
        alert(data.message || "Eroare la actualizare.");
      }
    } catch (err) {
      console.error("Profile save error:", err);
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (passwordForm.newPass.length < 8) {
      return alert("Parola nouă trebuie să aibă minim 8 caractere.");
    }
    if (passwordForm.newPass !== passwordForm.confirm) {
      return alert("Parolele noi nu coincid.");
    }

    try {
      setSavingPassword(true);
      const res = await fetch(`${API_URL}/users/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.current,
          newPassword: passwordForm.newPass
        })
      });
      const data = await res.json();
      
      if (data.success) {
        setPasswordForm({ current: "", newPass: "", confirm: "" });
        alert("Parola a fost schimbată cu succes!");
      } else {
        alert(data.message || "Parola curentă incorectă.");
      }
    } catch (err) {
      console.error("Password save error:", err);
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Ești absolut sigur că vrei să ștergi contul? Această acțiune este ireversibilă și vei pierde tot istoricul de comenzi.")) return;
    if (!confirm("Confirmă din nou ștergerea definitivă a contului.")) return;

    try {
      setDeleting(true);
      const res = await fetch(`${API_URL}/users/account`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.success) {
        alert("Contul a fost șters cu succes.");
        logout();
      } else {
        alert(data.message || "Eroare la ștergerea contului.");
      }
    } catch (err) {
      console.error("Delete account error:", err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Date Personale */}
      <div className="bg-white p-8 rounded-[32px] border border-[#E8E2D9] shadow-sm">
        <h2 className="text-2xl font-serif text-[#1A120B] mb-8">Date Personale</h2>
        
        {/* Avatar Display */}
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-[#E8E2D9]/50">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-[#FDF9F1] border-2 border-[#D4A853] flex items-center justify-center relative">
              {uploadingAvatar ? (
                <div className="w-full h-full flex items-center justify-center bg-black/50 absolute inset-0 z-10">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : null}
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name || "Profil"} className="w-full h-full object-cover" />
              ) : (
                <User size={40} className="text-[#D4A853]/50" />
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleAvatarChange} 
              accept="image/*" 
              className="hidden" 
            />
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute bottom-0 right-0 bg-[#1A120B] p-2 rounded-full text-white border-2 border-white hover:bg-[#D4A853] transition-all cursor-pointer shadow-md group-hover:scale-110" 
              title="Schimbă poza de profil"
            >
              <Camera size={16} />
            </button>
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#1A120B]">{user?.name}</h3>
            <p className="text-[#1A120B]/60 text-sm">Poți modifica fotografia direct de aici.</p>
          </div>
        </div>

        <form onSubmit={handleProfileSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#1A120B]/70 mb-2">Nume complet</label>
              <div className="relative">
                <User size={18} className="absolute top-4 left-4 text-[#1A120B]/40" />
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full bg-[#FFFCF6] border border-[#E8E2D9] rounded-2xl py-4 pl-12 pr-4 text-[#1A120B] placeholder:text-[#1A120B]/40 focus:outline-none focus:border-[#D4A853] transition-all"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#1A120B]/70 mb-2">Telefon</label>
              <div className="relative">
                <Phone size={18} className="absolute top-4 left-4 text-[#1A120B]/40" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm({...form, phone: e.target.value})}
                  className="w-full bg-[#FFFCF6] border border-[#E8E2D9] rounded-2xl py-4 pl-12 pr-4 text-[#1A120B] placeholder:text-[#1A120B]/40 focus:outline-none focus:border-[#D4A853] transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A120B]/70 mb-2">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute top-4 left-4 text-[#1A120B]/40" />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  className="w-full bg-[#FFFCF6] border border-[#E8E2D9] rounded-2xl py-4 pl-12 pr-4 text-[#1A120B] placeholder:text-[#1A120B]/40 focus:outline-none focus:border-[#D4A853] transition-all"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#1A120B]/70 mb-2">Gen</label>
              <div className="flex gap-2">
                {[
                  { id: "male", label: "Masculin" },
                  { id: "female", label: "Feminin" },
                  { id: "other", label: "Altul" }
                ].map(g => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setForm({...form, gender: g.id})}
                    className={`flex-1 py-4 rounded-2xl font-bold border transition-colors ${
                      form.gender === g.id 
                        ? "bg-[#D4A853]/10 border-[#D4A853] text-[#D4A853]" 
                        : "bg-[#FFFCF6] border-[#E8E2D9] text-[#1A120B]/60 hover:border-[#1A120B]/20"
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#1A120B]/70 mb-2">Data Nașterii</label>
              <div className="relative">
                <Calendar size={18} className={`absolute top-4 left-4 ${user?.birthdayRewardSentAt ? 'text-[#D4A853]' : 'text-[#1A120B]/40'}`} />
                <input
                  type="date"
                  value={form.dateOfBirth}
                  onChange={e => setForm({...form, dateOfBirth: e.target.value})}
                  disabled={!!user?.birthdayRewardSentAt}
                  className={`w-full bg-[#FFFCF6] border border-[#E8E2D9] rounded-2xl py-4 pl-12 pr-4 text-[#1A120B] focus:outline-none focus:border-[#D4A853] transition-all ${user?.birthdayRewardSentAt ? 'opacity-70 cursor-not-allowed bg-[#D4A853]/5 border-[#D4A853]/30 text-[#D4A853] font-bold' : ''}`}
                />
              </div>
              <p className={`text-xs mt-2 ${user?.birthdayRewardSentAt ? 'text-[#D4A853]' : 'text-[#1A120B]/50'}`}>
                {user?.birthdayRewardSentAt 
                  ? "Ai primit deja cadoul de ziua ta. Data nu mai poate fi modificată." 
                  : "Adaugă data nașterii pentru a primi o surpriză dulce de ziua ta!"}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E8E2D9]/50 flex justify-end">
            <button
              type="submit"
              disabled={savingProfile}
              className="px-8 py-4 bg-[#1A120B] text-white rounded-full font-bold hover:bg-[#D4A853] transition-colors disabled:opacity-50"
            >
              {savingProfile ? "Se salvează..." : "Salvează Modificările"}
            </button>
          </div>
        </form>
      </div>

      {/* Securitate */}
      <div className="bg-white p-8 rounded-[32px] border border-[#E8E2D9] shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <Lock size={24} className="text-[#D4A853]" />
          <h2 className="text-2xl font-serif text-[#1A120B]">Securitate</h2>
        </div>
        
        <form onSubmit={handlePasswordSave} className="space-y-6 max-w-lg">
          <div>
            <label className="block text-sm font-medium text-[#1A120B]/70 mb-2">Parola curentă</label>
            <input
              type="password"
              value={passwordForm.current}
              onChange={e => setPasswordForm({...passwordForm, current: e.target.value})}
              className="w-full bg-[#FFFCF6] border border-[#E8E2D9] rounded-2xl py-4 px-4 text-[#1A120B] focus:outline-none focus:border-[#D4A853] transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A120B]/70 mb-2">Parola nouă</label>
            <input
              type="password"
              value={passwordForm.newPass}
              onChange={e => setPasswordForm({...passwordForm, newPass: e.target.value})}
              className="w-full bg-[#FFFCF6] border border-[#E8E2D9] rounded-2xl py-4 px-4 text-[#1A120B] focus:outline-none focus:border-[#D4A853] transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A120B]/70 mb-2">Confirmă parola nouă</label>
            <input
              type="password"
              value={passwordForm.confirm}
              onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})}
              className="w-full bg-[#FFFCF6] border border-[#E8E2D9] rounded-2xl py-4 px-4 text-[#1A120B] focus:outline-none focus:border-[#D4A853] transition-all"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={savingPassword}
            className="px-8 py-4 bg-transparent border-2 border-[#D4A853] text-[#D4A853] rounded-full font-bold hover:bg-[#D4A853] hover:text-white transition-colors disabled:opacity-50"
          >
            {savingPassword ? "Se schimbă..." : "Schimbă Parola"}
          </button>
        </form>
      </div>

      {/* Zona Periculoasă */}
      <div className="bg-red-50/50 p-8 rounded-[32px] border border-red-100">
        <h2 className="text-xl font-bold text-red-600 mb-2">Zona de Pericol</h2>
        <p className="text-red-900/60 mb-6">Odată ce ștergi contul, toate datele tale, inclusiv istoricul de comenzi și punctele de loialitate, vor fi șterse definitiv.</p>
        
        <button
          onClick={handleDeleteAccount}
          disabled={deleting}
          className="flex items-center gap-2 px-6 py-3 bg-white border border-red-200 text-red-600 rounded-full font-bold hover:bg-red-50 hover:border-red-300 transition-colors disabled:opacity-50"
        >
          <Trash2 size={18} />
          <span>{deleting ? "Se șterge..." : "Șterge contul meu"}</span>
        </button>
      </div>
    </div>
  );
}

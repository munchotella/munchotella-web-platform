"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Plus, Trash2, Edit2, X, Home, Briefcase, Users, Map } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import MapPickerModal from "./MapPickerModal";
import MapAutocomplete from "@/components/ui/MapAutocomplete";
import { useTranslations } from 'next-intl';

export default function AddressManager() {
  const t = useTranslations('AddressManager');
  const { user, token, updateUser } = useAuth();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formStreet, setFormStreet] = useState("");
  const [formLat, setFormLat] = useState<number | null>(null);
  const [formLng, setFormLng] = useState<number | null>(null);
  const [formLabel, setFormLabel] = useState(t('home'));
  const [saving, setSaving] = useState(false);

  const API_URL = "https://munchotella-api.onrender.com/api";

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const headers: any = {};
      
      let currentToken = token;
      if (!currentToken && typeof window !== "undefined") {
        currentToken = localStorage.getItem("munchotella_token");
      }
      
      if (currentToken) headers["Authorization"] = `Bearer ${currentToken}`;
      
      const res = await fetch(`${API_URL}/auth/me`, {
        credentials: "include",
        headers
      });
      const data = await res.json();
      if (data.success && data.data) {
        setAddresses(data.data.addresses || []);
        updateUser(data.data);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id || (user as any)?._id) {
      fetchAddresses();
    }
  }, [user?.id, (user as any)?._id, token]);

  const openAddModal = () => {
    setEditingId(null);
    setFormStreet("");
    setFormLat(null);
    setFormLng(null);
    setFormLabel(t('home'));
    setIsModalOpen(true);
  };

  const openEditModal = (addr: any) => {
    setEditingId(addr._id);
    setFormStreet(addr.street);
    setFormLat(addr.lat || null);
    setFormLng(addr.lng || null);
    setFormLabel(addr.label || t('home'));
    setIsModalOpen(true);
  };



  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formStreet.length < 3) return;

    try {
      setSaving(true);
      const endpoint = editingId 
        ? `${API_URL}/users/addresses/${editingId}`
        : `${API_URL}/users/addresses`;
      
      const method = editingId ? "PUT" : "POST";

      const headers: any = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(endpoint, {
        credentials: "include",
        method,
        headers,
        body: JSON.stringify({
          street: formStreet,
          label: formLabel,
          lat: formLat || 0,
          lng: formLng || 0
        })
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchAddresses();
      } else {
        alert(data.message || t('saveError'));
      }
    } catch (err) {
      console.error("Save address error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('confirmDelete'))) return;

    try {
      const headers: any = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/users/addresses/${id}`, {
        credentials: "include",
        method: "DELETE",
        headers
      });
      const data = await res.json();
      if (data.success) {
        fetchAddresses();
      }
    } catch (err) {
      console.error("Delete address error:", err);
    }
  };

  const getLabelIcon = (label: string) => {
    if (label === t('home') || label === "Acasă") return <Home size={20} className="text-[#D4A853]" />;
    if (label === t('office') || label === "Birou") return <Briefcase size={20} className="text-[#D4A853]" />;
    if (label === t('friend') || label === "Prieten") return <Users size={20} className="text-[#D4A853]" />;
    return <MapPin size={20} className="text-[#D4A853]" />;
  };

  return (
    <div className="bg-white p-8 rounded-[32px] border border-[#E8E2D9] shadow-sm">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-serif text-[#1A120B]">{t('deliveryAddresses')}</h2>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-[#D4A853] text-white rounded-full font-bold hover:bg-[#C29641] transition-colors"
        >
          <Plus size={18} />
          <span>{t('addAddress')}</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-[#D4A853] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-12 bg-[#FFFCF6] rounded-2xl border border-dashed border-[#D4A853]/30">
          <MapPin size={48} className="mx-auto text-[#D4A853]/40 mb-4" />
          <p className="text-[#1A120B] font-medium text-lg mb-2">{t('noSavedAddresses')}</p>
          <p className="text-[#1A120B]/60 text-sm">{t('addFasterDelivery')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div key={addr._id} className="p-5 border border-[#E8E2D9] rounded-2xl flex flex-col justify-between group hover:border-[#D4A853]/50 transition-colors">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#D4A853]/10 flex items-center justify-center shrink-0">
                  {getLabelIcon(addr.label)}
                </div>
                <div>
                  <p className="font-bold text-[#1A120B] mb-1">{addr.label}</p>
                  <p className="text-[#1A120B]/70 text-sm leading-relaxed">{addr.street}</p>
                </div>
              </div>
              <div className="flex gap-2 justify-end border-t border-[#E8E2D9]/50 pt-3">
                <button 
                  onClick={() => openEditModal(addr)}
                  className="p-2 text-[#1A120B]/40 hover:text-[#D4A853] transition-colors"
                  title={t('editBtn')}
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(addr._id)}
                  className="p-2 text-[#1A120B]/40 hover:text-red-500 transition-colors"
                  title={t('deleteBtn')}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Adăugare/Editare */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[32px] p-8 w-full max-w-md relative z-10 shadow-2xl"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 p-2 text-[#1A120B]/40 hover:text-[#1A120B] bg-[#1A120B]/5 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              
              <h3 className="text-2xl font-serif text-[#1A120B] mb-6">
                {editingId ? t('editAddress') : t('addAddress')}
              </h3>
              
              <form onSubmit={handleSave} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[#1A120B]/70 mb-3">
                    {t('label')}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[t('home'), t('office'), t('friend'), t('other')].map(l => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => setFormLabel(l)}
                        className={`px-4 py-2 rounded-full text-sm font-bold border transition-colors ${
                          formLabel === l 
                            ? "bg-[#D4A853] border-[#D4A853] text-white" 
                            : "bg-transparent border-[#E8E2D9] text-[#1A120B]/60 hover:border-[#1A120B]/20"
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-[#1A120B]/70">
                      {t('fullAddress')}
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsMapPickerOpen(true)}
                      className="text-xs font-bold text-[#D4A853] hover:underline flex items-center gap-1"
                    >
                      <Map size={14} />
                      <span>{t('pinOnMap')}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <MapAutocomplete
                      value={formStreet}
                      onChange={(val) => setFormStreet(val)}
                      onPlaceSelected={(lat, lng, address) => {
                        setFormLat(lat);
                        setFormLng(lng);
                        setFormStreet(address);
                      }}
                      placeholder={t('addressPlaceholder')}
                      className="w-full bg-[#FFFCF6] border border-[#E8E2D9] rounded-2xl py-4 pl-12 pr-4 text-[#1A120B] placeholder:text-[#1A120B]/40 focus:outline-none focus:border-[#D4A853] focus:ring-1 focus:ring-[#D4A853] transition-all"
                      required={true}
                    />
                  </div>
                  {formLat && formLng ? (
                    <p className="text-[11px] text-[#D4A853] mt-1 font-medium">
                      {t('gpsSaved')} ({formLat.toFixed(4)}, {formLng.toFixed(4)})
                    </p>
                  ) : null}
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-[#1A120B] text-white font-bold py-4 rounded-2xl hover:bg-[#D4A853] transition-colors disabled:opacity-50"
                >
                  {saving ? t('saving') : t('saveAddress')}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Pin Picker pe Hartă */}
      <MapPickerModal
        isOpen={isMapPickerOpen}
        onClose={() => setIsMapPickerOpen(false)}
        initialLat={formLat || undefined}
        initialLng={formLng || undefined}
        onSelectLocation={(loc) => {
          setFormStreet(loc.address);
          setFormLat(loc.lat);
          setFormLng(loc.lng);
        }}
      />
    </div>
  );
}

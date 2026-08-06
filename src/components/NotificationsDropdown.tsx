"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCircle, Clock, ShoppingBag, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useTranslations } from "next-intl";

interface Notification {
  _id: string;
  title: string;
  body: string;
  type: string;
  orderId?: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationsDropdownProps {
  isScrolled?: boolean;
}

export default function NotificationsDropdown({ isScrolled = false }: NotificationsDropdownProps) {
  const { user, token, setIsAuthModalOpen } = useAuth();
  const t = useTranslations("Notifications");
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [hasPermission, setHasPermission] = useState<boolean>(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setHasPermission(window.Notification.permission === "granted");
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const permission = await window.Notification.requestPermission();
      if (permission === "granted") {
        setHasPermission(true);
      }
    }
  };

  const fetchNotifications = async () => {
    if (!user || !token) return;
    try {
      const res = await fetch(`${API_URL}/users/notifications`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        const newUnread = data.data.filter((n: Notification) => !n.isRead);
        if (newUnread.length > unreadCount && unreadCount !== 0) {
          // Trigger native browser notification if allowed
          if (typeof window !== "undefined" && "Notification" in window && window.Notification.permission === "granted") {
            const latest = newUnread[0];
            if (latest) {
              new window.Notification(latest.title === 'notifOrderPlacedTitle' ? t('orderPlaced') : latest.title, {
                body: latest.body,
                icon: "/favicon.ico"
              });
            }
          }
        }
        setNotifications(data.data);
        setUnreadCount(newUnread.length);
      }
    } catch (e) {
      console.error("Failed to fetch notifications", e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Refresh interval for notifications
    const interval = setInterval(() => {
      if (user) fetchNotifications();
    }, 60000); // Every minute
    
    return () => clearInterval(interval);
  }, [user, token]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async () => {
    if (!token || unreadCount === 0) return;
    try {
      await fetch(`${API_URL}/users/notifications/read`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` }
      });
      setUnreadCount(0);
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const toggleDropdown = () => {
    if (!user) {
      if (setIsAuthModalOpen) setIsAuthModalOpen(true);
      return;
    }
    if (!isOpen) {
      markAsRead();
      fetchNotifications();
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={toggleDropdown}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors relative ${
          isScrolled ? "bg-[#1A1A1A]/5 hover:bg-[#1A1A1A]/10 text-[#1A1A1A]" : "bg-white/10 hover:bg-white/20 text-white"
        }`}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#1A120B]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-[#E8E2D9] overflow-hidden z-50"
          >
            <div className="bg-[#1A120B] p-4 flex justify-between items-center text-white">
              <h3 className="font-serif font-bold text-lg">{t('title')}</h3>
              <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            {!hasPermission && (
              <div className="p-3 bg-[#D4A853]/10 border-b border-[#D4A853]/20 flex items-center justify-between gap-2 text-xs">
                <span className="text-[#1A120B]/80 font-medium">{t('enableDesktop')}</span>
                <button
                  onClick={requestNotificationPermission}
                  className="px-3 py-1 bg-[#D4A853] text-white rounded-full font-bold hover:bg-[#C29641] transition-colors shrink-0 text-[11px]"
                >
                  {t('enable')}
                </button>
              </div>
            )}

            <div className="max-h-[350px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-[#736A60]">
                  <Bell size={32} className="mx-auto mb-3 text-[#E8E2D9]" />
                  <p className="text-sm">{t('empty')}</p>
                </div>
              ) : (
                <div className="divide-y divide-[#E8E2D9]">
                  {notifications.map(notif => (
                    <div 
                      key={notif._id} 
                      className={`p-4 hover:bg-[#FAF7F2] transition-colors ${!notif.isRead ? 'bg-[#FFFCF6]' : 'opacity-70'}`}
                    >
                      <div className="flex gap-3">
                        <div className="mt-1">
                          {notif.type === 'order' ? (
                            <div className="w-8 h-8 rounded-full bg-[#D4A853]/20 text-[#D4A853] flex items-center justify-center">
                              <ShoppingBag size={14} />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                              <Bell size={14} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-[#1A120B] text-sm">{notif.title === 'notifOrderPlacedTitle' ? t('orderPlaced') : notif.title === 'orderUpdates' ? t('orderUpdate') : notif.title}</h4>
                          <p className="text-xs text-[#736A60] mt-1 leading-relaxed">
                            {notif.body === 'notifOrderConfirmedBody' ? t('notifOrderConfirmedBody') : notif.body === 'notifOrderDeliveringBody' ? t('notifOrderDeliveringBody') : notif.body.split('|')[0] === 'notifOrderPlacedBody' ? t('notifOrderPlacedBody') : notif.body}
                          </p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-[10px] font-bold text-[#736A60] flex items-center gap-1 uppercase tracking-wide">
                              <Clock size={10} />
                              {new Date(notif.createdAt).toLocaleDateString('ro-RO', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {notif.orderId && (
                              <Link 
                                href={`/order-tracking/${notif.orderId}`}
                                onClick={() => setIsOpen(false)}
                                className="text-[10px] font-bold text-[#D4A853] uppercase tracking-wide hover:underline"
                              >
                                {t('viewOrder')}
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

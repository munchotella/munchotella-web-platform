"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  addresses?: any[];
  gender?: string;
  dateOfBirth?: string;
  avatarUrl?: string;
  birthdayRewardSentAt?: string;
  mustChangePassword?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (isOpen: boolean) => void;
  login: (userData: User, token: string) => void;
  updateUser: (userData: Partial<User>) => void;
  logout: () => void;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
}

const API_URL = "https://munchotella-api.onrender.com/api";
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const authChannelRef = useRef<BroadcastChannel | null>(null);

  // Funcție de verificare și sincronizare sesiune server-side (SEC-HIGH-01)
  const verifyServerSession = async (fallbackToken?: string | null) => {
    try {
      const headers: Record<string, string> = {};
      const currentToken = fallbackToken || (typeof window !== "undefined" ? localStorage.getItem("munchotella_token") : null);
      
      if (currentToken) {
        headers["Authorization"] = `Bearer ${currentToken}`;
      }

      const res = await fetch(`${API_URL}/auth/me`, {
        credentials: "include", // Transmite automat cookie-ul HttpOnly access_token
        headers,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          const verifiedUser: User = data.data;
          setUser(verifiedUser);
          if (typeof window !== "undefined") {
            localStorage.setItem("munchotella_user", JSON.stringify(verifiedUser));
          }
          return;
        }
      }

      // Dacă serverul a returnat 401/403 și nu există o sesiune validă, curățăm starea
      if (res.status === 401 || res.status === 403) {
        setUser(null);
        setToken(null);
        if (typeof window !== "undefined") {
          localStorage.removeItem("munchotella_user");
          localStorage.removeItem("munchotella_token");
        }
      }
    } catch (err) {
      console.warn("Verificare sesiune server eșuată (offline sau eroare rețea):", err);
    }
  };

  useEffect(() => {
    // 1. Încărcare inițială optimistă din localStorage
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("munchotella_user");
      const storedToken = localStorage.getItem("munchotella_token");

      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          if (storedToken) {
            setToken(storedToken);
          }
        } catch (e) {
          console.error("Eroare la parsarea utilizatorului stocat:", e);
        }
      }

      // 2. Verificare server-side în background prin cookie-uri securizate HttpOnly
      verifyServerSession(storedToken).finally(() => {
        setIsLoading(false);
      });

      // 3. Sincronizare multi-tab prin BroadcastChannel (SEC-LOW-02)
      if ("BroadcastChannel" in window) {
        const channel = new BroadcastChannel("munchotella_auth_sync");
        authChannelRef.current = channel;

        channel.onmessage = (event) => {
          if (event.data?.type === "LOGIN") {
            setUser(event.data.user);
            setToken(event.data.token);
          } else if (event.data?.type === "LOGOUT") {
            setUser(null);
            setToken(null);
          } else if (event.data?.type === "UPDATE_USER") {
            setUser(event.data.user);
          }
        };
      }

      // 4. Fallback listener pe storage event pentru browsere mai vechi
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === "munchotella_user") {
          if (e.newValue) {
            try {
              setUser(JSON.parse(e.newValue));
            } catch (_) {}
          } else {
            setUser(null);
            setToken(null);
          }
        }
      };

      window.addEventListener("storage", handleStorageChange);
      return () => {
        window.removeEventListener("storage", handleStorageChange);
        if (authChannelRef.current) {
          authChannelRef.current.close();
        }
      };
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = (userData: User, receivedToken: string) => {
    setUser(userData);
    setToken(receivedToken);

    if (typeof window !== "undefined") {
      localStorage.setItem("munchotella_user", JSON.stringify(userData));
      localStorage.setItem("munchotella_token", receivedToken);
    }

    // Notificare toate celelalte tab-uri deschise
    if (authChannelRef.current) {
      authChannelRef.current.postMessage({
        type: "LOGIN",
        user: userData,
        token: receivedToken,
      });
    }

    setIsAuthModalOpen(false);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...userData };
      setUser(updated);

      if (typeof window !== "undefined") {
        localStorage.setItem("munchotella_user", JSON.stringify(updated));
      }

      if (authChannelRef.current) {
        authChannelRef.current.postMessage({
          type: "UPDATE_USER",
          user: updated,
        });
      }
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);

    if (typeof window !== "undefined") {
      localStorage.removeItem("munchotella_user");
      localStorage.removeItem("munchotella_token");
    }

    // Notificare toate celelalte tab-uri deschise
    if (authChannelRef.current) {
      authChannelRef.current.postMessage({ type: "LOGOUT" });
    }

    // Notificare server pentru invalidarea cookie-ului HttpOnly
    try {
      await fetch(`${API_URL}/auth/logout`, {
        credentials: "include",
        method: "POST",
      });
    } catch (_) {}
  };

  const refreshUser = async () => {
    await verifyServerSession(token);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthModalOpen,
        setIsAuthModalOpen,
        login,
        updateUser,
        logout,
        isLoading,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

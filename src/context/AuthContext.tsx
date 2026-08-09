"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for existing session on mount
    const storedUser = localStorage.getItem("munchotella_user");
    // Eliminat (SEC-HIGH-03): Tokenul trăiește acum în HttpOnly Cookie
    
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        // Nu mai setăm tokenul explicit în state din localStorage
      } catch (e) {
        console.error("Failed to parse stored user", e);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (userData: User, receivedToken: string) => {
    setUser(userData);
    setToken(receivedToken); // Îl menținem în memorie doar pentru Mobile RN back-compat dacă e necesar
    localStorage.setItem("munchotella_user", JSON.stringify(userData));
    // Eliminat (SEC-HIGH-03): localStorage.setItem("munchotella_token", token);
    setIsAuthModalOpen(false); // Close modal on successful login
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...userData };
      setUser(updated);
      localStorage.setItem("munchotella_user", JSON.stringify(updated));
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("munchotella_user");
    // Eliminat (SEC-HIGH-03): localStorage.removeItem("munchotella_token");
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthModalOpen, setIsAuthModalOpen, login, updateUser, logout, isLoading }}>
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

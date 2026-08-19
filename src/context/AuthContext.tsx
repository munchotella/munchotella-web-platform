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
    const storedToken = localStorage.getItem("munchotella_token");
    
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        if (storedToken) {
          setToken(storedToken);
        }
      } catch (e) {
        console.error("Failed to parse stored user", e);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (userData: User, receivedToken: string) => {
    setUser(userData);
    setToken(receivedToken); 
    localStorage.setItem("munchotella_user", JSON.stringify(userData));
    localStorage.setItem("munchotella_token", receivedToken);
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
    localStorage.removeItem("munchotella_token");
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

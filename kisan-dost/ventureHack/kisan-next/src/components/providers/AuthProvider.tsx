'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type User = {
  id: string;
  username: string;
  name: string;
  firstName?: string;
  mobile?: string;
  village?: string;
  district?: string;
  mainCrop?: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isLoaded: boolean;
  isSignedIn: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const checkSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (e) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const login = (newUser: User) => {
    setUser(newUser);
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/en/auth'); // default to start page or auth page
  };

  const isLoaded = !isLoading;
  const isSignedIn = !!user;

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isLoaded, isSignedIn, login, logout, checkSession }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

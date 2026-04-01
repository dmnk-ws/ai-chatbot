"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

import {
  User,
  getMeApi,
  loginApi,
  logoutApi,
  registerApi,
} from "@/lib/auth/auth-api";

interface AuthContextBase {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string,
  ) => Promise<void>;
  isLoading: boolean;
}

type AuthContextType = AuthContextBase &
  (
    | { user: User; isAuthenticated: true }
    | { user: null; isAuthenticated: false }
  );

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getMeApi()
      .then(setUser)
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const data = await loginApi(email, password);
    setUser(data);
  };

  const register = async (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string,
  ) => {
    await registerApi(email, password, firstName, lastName);
  };

  const logout = async () => {
    await logoutApi();
    setUser(null);
  };

  const value: AuthContextType = user
    ? { user, isAuthenticated: true, login, logout, register, isLoading }
    : {
        user: null,
        isAuthenticated: false,
        login,
        logout,
        register,
        isLoading,
      };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) throw new Error("useAuth must be used within AuthProvider");

  return context;
}

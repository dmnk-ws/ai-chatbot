"use client";

import React, { createContext, useContext, useState } from "react";

interface User {
  email: string;
  name: string;
  password: string;
}

interface AuthContextBase {
  login: (email: string, password: string) => void;
  logout: () => void;
}

type AuthContextType = AuthContextBase &
  (
    | { user: User; isAuthenticated: true }
    | { user: null; isAuthenticated: false }
  );

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, password: string) => {
    const name = email.split("@")[0];
    const user = { email, name, password };

    setUser(user);
  };

  const logout = () => {
    setUser(null);
  };

  const value: AuthContextType = user
    ? { user, isAuthenticated: true, login, logout }
    : { user: null, isAuthenticated: false, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) throw new Error("useAuth must be used within AuthProvider");

  return context;
}

"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, AuthContextType, UserRole } from "@/types";

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string) => {
    // TODO: Implement login logic
    console.log("Login called with:", email);
  };

  const logout = async () => {
    // TODO: Implement logout logic
    setUser(null);
  };

  useEffect(() => {
    setUser({
      uid: "test-uid",
      email: "test@example.com",
      displayName: "Test User",
      token: "test-token",
      claims: {
        name: "Test User",
        role: UserRole.USER,
        companyId: "test-company-id",
        companyName: "Test Company",
        plan: "free",
      },
      profile: {
        firstName: "Test",
        lastName: "User",
        timezone: "UTC",
        language: "en",
      }
    });
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

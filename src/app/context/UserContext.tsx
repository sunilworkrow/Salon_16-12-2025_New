"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import jwt from "jsonwebtoken";
import { useRouter } from "next/navigation";

interface JwtPayload {
  id: number;
  name: string;
  email: string;
  companyId?: number;
  exp?: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  companies_id?: number;
}

interface UserContextType {
  user: User | null;
  logout: () => void;
  setUser: (user: User | null) => void;
  loading: boolean;
  setLoading: (value: boolean) => void;
}

const UserContext = createContext<UserContextType>({
  user: null,
  logout: () => {},
  setUser: () => {},
  loading: false,
  setLoading: () => {},
});

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // loader starts true initially
  const router = useRouter();

  const checkTokenExpiry = (token: string) => {
    try {
      const decoded = jwt.decode(token) as JwtPayload | null;
      if (!decoded) return false;

      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        return false;
      }

      setUser({
        id: decoded.id,
        name: decoded.name,
        email: decoded.email,
        companies_id: decoded.companyId,
      });
      return true;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token || !checkTokenExpiry(token)) {
      localStorage.removeItem("token");
      router.push("/login");
      setLoading(false);
      return;
    }

    setLoading(false);

    const interval = setInterval(() => {
      const t = localStorage.getItem("token");
      if (!t || !checkTokenExpiry(t)) {
        localStorage.removeItem("token");
        router.push("/login");
      }
    }, 1000 * 60);

    return () => clearInterval(interval);
  }, [router]);

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    router.push("/login");
  };

  return (
    <UserContext.Provider value={{ user, logout, setUser, loading, setLoading }}>
      {children}
    </UserContext.Provider>
  );
};

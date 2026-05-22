import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const ADMIN_SESSION_KEY = "hidden-admin-session";
const ADMIN_EMAIL = "website784114@gmail.com";
const ADMIN_PASSWORD = "luckylottery@123";

interface AdminAuthCtx {
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const Ctx = createContext<AdminAuthCtx>({
  isAdmin: false,
  loading: true,
  login: async () => false,
  logout: () => {},
});

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem(ADMIN_SESSION_KEY) : null;
    setIsAdmin(saved === "true");
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    if (email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(ADMIN_SESSION_KEY, "true");
      }
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(ADMIN_SESSION_KEY);
    }
    setIsAdmin(false);
  };

  return (
    <Ctx.Provider value={{ isAdmin, loading, login, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAdminAuth() {
  return useContext(Ctx);
}

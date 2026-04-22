import React, { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "student" | "teacher" | "admin";

interface AuthContextType {
  isAuthenticated: boolean;
  role: UserRole | null;
  userName: string;
  userEmail: string; // Added email
  userId: string | null;
  className: string | null;
  token: string | null;
  login: (token: string, role: UserRole, name: string, userId: string, email: string, className?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem("token"));
  const [role, setRole] = useState<UserRole | null>(() => localStorage.getItem("role") as UserRole | null);
  const [userName, setUserName] = useState(() => localStorage.getItem("name") || "");
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem("email") || ""); // Added email
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [userId, setUserId] = useState(() => localStorage.getItem("userId") || null);
  const [className, setClassName] = useState(() => localStorage.getItem("className") || null);

  const login = (newToken: string, selectedRole: UserRole, name: string, id: string, email: string, cls?: string) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("role", selectedRole);
    localStorage.setItem("name", name);
    localStorage.setItem("userId", id);
    localStorage.setItem("email", email); // Added email
    if (cls) localStorage.setItem("className", cls);
    setToken(newToken);
    setIsAuthenticated(true);
    setRole(selectedRole);
    setUserName(name);
    setUserEmail(email); // Added email
    setUserId(id);
    if (cls) setClassName(cls);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    localStorage.removeItem("userId");
    localStorage.removeItem("email"); // Added email
    localStorage.removeItem("className");
    setToken(null);
    setIsAuthenticated(false);
    setRole(null);
    setUserName("");
    setUserEmail(""); // Added email
    setUserId(null);
    setClassName(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, role, userName, userEmail, userId, className, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

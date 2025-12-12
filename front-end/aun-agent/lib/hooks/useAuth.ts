"use client";

import { useState, useEffect } from "react";

interface User {
  nationalId: string;
  displayName: string;
  token: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth token
    const token = localStorage.getItem("absher_token");
    const userStr = localStorage.getItem("absher_user");

    if (token && userStr) {
      setUser(JSON.parse(userStr));
    }
    setLoading(false);
  }, []);

  const login = async (nationalId: string, pin: string) => {
    try {
      // Replace with actual API call
      const response = await fetch("http://localhost:8001/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ national_id: nationalId, pin }),
      });

      if (!response.ok) throw new Error("Login failed");

      const data = await response.json();
      const userData = {
        nationalId,
        displayName: data.display_name,
        token: data.token,
      };

      localStorage.setItem("absher_token", data.token);
      localStorage.setItem("absher_user", JSON.stringify(userData));
      setUser(userData);

      return { success: true };
    } catch (error) {
      return { success: false, error: "فشل تسجيل الدخول" };
    }
  };

  const logout = () => {
    localStorage.removeItem("absher_token");
    localStorage.removeItem("absher_user");
    setUser(null);
  };

  return { user, loading, login, logout };
}



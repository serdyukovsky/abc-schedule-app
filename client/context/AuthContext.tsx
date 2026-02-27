import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { pb } from "@/lib/pb";
import { isTelegramWebApp } from "@/hooks/useTelegram";
import type { RecordModel } from "pocketbase";

export interface UserProfile {
  firstName: string;
  lastName: string;
  company: string;
  title: string;
  phone: string;
  login: string; // email
}

interface AuthContextType {
  isLoggedIn: boolean;
  isLoading: boolean;
  isTelegramUser: boolean;
  profile: UserProfile | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (profile: UserProfile, password: string) => Promise<boolean>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  logout: () => Promise<void>;
  getFullName: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function recordToProfile(record: RecordModel): UserProfile {
  return {
    firstName: record.firstName || "",
    lastName: record.lastName || "",
    company: record.company || "",
    title: record.title || "",
    phone: record.phone || "",
    login: record.email?.includes("@telegram.local") ? "" : (record.email || ""),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTelegramUser, setIsTelegramUser] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const loginWithTelegram = async (): Promise<boolean> => {
    try {
      const initData = window.Telegram?.WebApp?.initData;
      if (!initData) return false;

      const response = await pb.send("/api/telegram-auth", {
        method: "POST",
        body: { initData },
      });

      pb.authStore.save(response.token, response.record);
      setProfile(recordToProfile(response.record));
      setIsLoggedIn(true);
      setIsTelegramUser(true);
      return true;
    } catch (error) {
      console.error("Telegram auth error:", error);
      return false;
    }
  };

  useEffect(() => {
    if (pb.authStore.isValid && pb.authStore.record) {
      setProfile(recordToProfile(pb.authStore.record));
      setIsLoggedIn(true);
      setIsTelegramUser(Boolean(pb.authStore.record.telegramId));
      setIsLoading(false);
    } else if (isTelegramWebApp()) {
      // Auto-login via Telegram
      loginWithTelegram().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }

    // Listen for auth store changes
    const unsub = pb.authStore.onChange((_token, record) => {
      if (record) {
        setProfile(recordToProfile(record));
        setIsLoggedIn(true);
        setIsTelegramUser(Boolean(record.telegramId));
      } else {
        setProfile(null);
        setIsLoggedIn(false);
        setIsTelegramUser(false);
      }
    });

    return () => unsub();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const result = await pb.collection("users").authWithPassword(email, password);
      setProfile(recordToProfile(result.record));
      setIsLoggedIn(true);
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const register = async (newProfile: UserProfile, password: string): Promise<boolean> => {
    try {
      await pb.collection("users").create({
        email: newProfile.login,
        password,
        passwordConfirm: password,
        firstName: newProfile.firstName,
        lastName: newProfile.lastName,
        company: newProfile.company,
        title: newProfile.title,
        phone: newProfile.phone,
        name: `${newProfile.firstName} ${newProfile.lastName}`.trim(),
      });
      // Auto-login after registration
      const result = await pb.collection("users").authWithPassword(newProfile.login, password);
      setProfile(recordToProfile(result.record));
      setIsLoggedIn(true);
      return true;
    } catch (error) {
      console.error("Register error:", error);
      return false;
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<boolean> => {
    try {
      if (!pb.authStore.record) return false;
      const data: Record<string, string> = {};
      if (updates.firstName !== undefined) data.firstName = updates.firstName;
      if (updates.lastName !== undefined) data.lastName = updates.lastName;
      if (updates.company !== undefined) data.company = updates.company;
      if (updates.title !== undefined) data.title = updates.title;
      if (updates.firstName !== undefined || updates.lastName !== undefined) {
        data.name = `${updates.firstName ?? profile?.firstName ?? ""} ${updates.lastName ?? profile?.lastName ?? ""}`.trim();
      }
      const updated = await pb.collection("users").update(pb.authStore.record.id, data);
      setProfile(recordToProfile(updated));
      return true;
    } catch (error) {
      console.error("Update profile error:", error);
      return false;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      if (!pb.authStore.record || !profile) return false;
      await pb.collection("users").update(pb.authStore.record.id, {
        oldPassword: currentPassword,
        password: newPassword,
        passwordConfirm: newPassword,
      });
      // Re-login with new password
      await pb.collection("users").authWithPassword(profile.login, newPassword);
      return true;
    } catch (error) {
      console.error("Change password error:", error);
      return false;
    }
  };

  const logout = async () => {
    pb.authStore.clear();
    setIsLoggedIn(false);
    setProfile(null);
    setIsTelegramUser(false);
  };

  const getFullName = (): string => {
    if (!profile) return "";
    return `${profile.firstName} ${profile.lastName}`.trim();
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, isLoading, isTelegramUser, profile, login, register, updateProfile, changePassword, logout, getFullName }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}

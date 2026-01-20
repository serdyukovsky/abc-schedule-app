import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface UserProfile {
  firstName: string;
  lastName: string;
  company: string;
  title: string;
  phone: string;
  login: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  isLoading: boolean;
  profile: UserProfile | null;
  login: (loginId: string, password: string) => Promise<boolean>;
  register: (profile: UserProfile, password: string) => Promise<boolean>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  logout: () => Promise<void>;
  getFullName: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  IS_LOGGED_IN: "@abc_auth_logged_in",
  PROFILE: "@abc_auth_profile",
  PASSWORD: "@abc_auth_password",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    loadAuthState();
  }, []);

  const loadAuthState = async () => {
    try {
      const [loggedIn, profileJson] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN),
        AsyncStorage.getItem(STORAGE_KEYS.PROFILE),
      ]);

      if (loggedIn === "true" && profileJson) {
        setProfile(JSON.parse(profileJson));
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error("Failed to load auth state:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (loginId: string, password: string): Promise<boolean> => {
    try {
      const [storedProfileJson, storedPassword] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.PROFILE),
        AsyncStorage.getItem(STORAGE_KEYS.PASSWORD),
      ]);

      if (!storedProfileJson || !storedPassword) {
        return false;
      }

      const storedProfile: UserProfile = JSON.parse(storedProfileJson);

      if (storedProfile.login === loginId && storedPassword === password) {
        setProfile(storedProfile);
        setIsLoggedIn(true);
        await AsyncStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, "true");
        return true;
      }

      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const register = async (newProfile: UserProfile, password: string): Promise<boolean> => {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(newProfile)),
        AsyncStorage.setItem(STORAGE_KEYS.PASSWORD, password),
        AsyncStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, "true"),
      ]);

      setProfile(newProfile);
      setIsLoggedIn(true);
      return true;
    } catch (error) {
      console.error("Register error:", error);
      return false;
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<boolean> => {
    try {
      if (!profile) return false;
      const updatedProfile: UserProfile = { ...profile, ...updates };
      await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updatedProfile));
      setProfile(updatedProfile);
      return true;
    } catch (error) {
      console.error("Update profile error:", error);
      return false;
    }
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string,
  ): Promise<boolean> => {
    try {
      const storedPassword = await AsyncStorage.getItem(STORAGE_KEYS.PASSWORD);
      if (!storedPassword || storedPassword !== currentPassword) {
        return false;
      }
      await AsyncStorage.setItem(STORAGE_KEYS.PASSWORD, newPassword);
      return true;
    } catch (error) {
      console.error("Change password error:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, "false");
      setIsLoggedIn(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const getFullName = (): string => {
    if (!profile) return "";
    return `${profile.firstName} ${profile.lastName}`.trim();
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        isLoading,
        profile,
        login,
        register,
        updateProfile,
        changePassword,
        logout,
        getFullName,
      }}
    >
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

import React, { Suspense, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { EventProvider } from "@/context/EventContext";
import { ActivityIndicator, View } from "@/components/primitives";
import { useTheme } from "@/hooks/useTheme";
import { isTelegramWebApp } from "@/hooks/useTelegram";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Text, Pressable } from "@/components/primitives";

// Screens
import LoginScreen from "@/screens/LoginScreen";
import RegisterScreen from "@/screens/RegisterScreen";
import MainScheduleScreen from "@/screens/MainScheduleScreen";
import EventDetailsScreen from "@/screens/EventDetailsScreen";
import ProfileScreen from "@/screens/ProfileScreen";
import OnboardingScreen from "@/screens/onboarding/OnboardingScreen";

function LoadingScreen() {
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: theme.backgroundRoot }}>
      <ActivityIndicator size="large" color={theme.link} />
    </View>
  );
}

function TelegramAuthError() {
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: theme.backgroundRoot, padding: 24 }}>
      <Text style={{ fontSize: 18, fontWeight: "600", color: theme.text, marginBottom: 8, textAlign: "center" }}>
        Не удалось войти
      </Text>
      <Text style={{ fontSize: 14, color: theme.textSecondary, textAlign: "center", marginBottom: 20 }}>
        Ошибка авторизации через Telegram. Попробуйте перезапустить приложение.
      </Text>
      <Pressable
        onPress={() => window.location.reload()}
        style={{ backgroundColor: theme.link, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}
      >
        <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "600" }}>Повторить</Text>
      </Pressable>
    </View>
  );
}

function AppRoutes() {
  const { isLoggedIn, isLoading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(
    () => !localStorage.getItem("abc-onboarding-v1")
  );

  if (isLoading) return <LoadingScreen />;

  if (!isLoggedIn) {
    if (isTelegramWebApp()) {
      return <TelegramAuthError />;
    }
    return (
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/register" element={<RegisterScreen />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  if (showOnboarding) {
    return (
      <OnboardingScreen
        onDone={() => {
          localStorage.setItem("abc-onboarding-v1", "1");
          setShowOnboarding(false);
        }}
      />
    );
  }

  return (
    <EventProvider>
      <Routes>
        <Route path="/" element={<MainScheduleScreen />} />
        <Route path="/event/:eventId" element={<EventDetailsScreen />} />
        <Route path="/profile" element={<ProfileScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </EventProvider>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <div className="phone-shell">
              <AppRoutes />
            </div>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

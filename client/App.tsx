import React, { Suspense, useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
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

function TelegramAuthError({
  onRetry,
  retrying,
  details,
}: {
  onRetry: () => void;
  retrying: boolean;
  details: string | null;
}) {
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: theme.backgroundRoot, padding: 24 }}>
      <Text style={{ fontSize: 18, fontWeight: "600", color: theme.text, marginBottom: 8, textAlign: "center" }}>
        Доступ не подтверждён
      </Text>
      <Text style={{ fontSize: 14, color: theme.textSecondary, textAlign: "center", marginBottom: 20 }}>
        Откройте бота, нажмите /start и перейдите в приложение по кнопке «Открыть расписание», затем повторите вход.
      </Text>
      {details ? (
        <Text style={{ fontSize: 13, color: theme.textSecondary, textAlign: "center", marginBottom: 16 }}>
          {details}
        </Text>
      ) : null}
      <Pressable
        onPress={onRetry}
        style={{
          backgroundColor: theme.link,
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 12,
          opacity: retrying ? 0.75 : 1,
        }}
        disabled={retrying}
      >
        <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "600" }}>
          {retrying ? "Проверяем..." : "Повторить вход"}
        </Text>
      </Pressable>
    </View>
  );
}

function AppRoutes() {
  const { isLoggedIn, isLoading, isTelegramAuthPending, telegramAuthError, retryTelegramAuth } = useAuth();
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(
    () => !localStorage.getItem("abc-onboarding-v1")
  );
  const [deepParam] = useState<{ type: "event"; id: string } | { type: "my_schedule" } | null>(() => {
    try {
      const sp = (window as any).Telegram?.WebApp?.initDataUnsafe?.start_param;
      if (typeof sp === "string") {
        if (sp.startsWith("event_")) return { type: "event", id: sp.slice("event_".length) };
        if (sp === "my_schedule") return { type: "my_schedule" };
      }
    } catch {}
    return null;
  });

  useEffect(() => {
    if (isLoggedIn && !showOnboarding && deepParam) {
      if (deepParam.type === "event") {
        navigate(`/`, { replace: true, state: { openEventId: deepParam.id } });
      } else if (deepParam.type === "my_schedule") {
        navigate(`/`, { replace: true, state: { openMySchedule: true } });
      }
    }
  }, [isLoggedIn, showOnboarding, deepParam, navigate]);

  if (isLoading) return <LoadingScreen />;

  if (!isLoggedIn) {
    if (isTelegramWebApp()) {
      return (
        <TelegramAuthError
          onRetry={() => {
            void retryTelegramAuth();
          }}
          retrying={isTelegramAuthPending}
          details={telegramAuthError}
        />
      );
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

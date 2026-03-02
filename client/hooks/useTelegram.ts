function getWebApp() {
  return typeof window !== "undefined" ? window.Telegram?.WebApp : undefined;
}

function vibrateFallback(pattern: number | number[]) {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
  navigator.vibrate(pattern);
}

export function isTelegramWebApp(): boolean {
  const webApp = getWebApp();
  return Boolean(webApp?.initData);
}

export function useTelegram() {
  const webApp = getWebApp();
  const isTelegram = Boolean(webApp?.initData);

  return {
    isTelegram,
    webApp,
    initData: webApp?.initData || "",
    // WARNING: This data is NOT cryptographically verified. Do NOT use for
    // authorization decisions. Use pb.authStore.record instead.
    unsafeUser: webApp?.initDataUnsafe?.user || null,

    hapticImpact(style: "light" | "medium" | "heavy" = "medium") {
      const app = getWebApp();
      if (app?.initData) {
        try {
          app.HapticFeedback?.impactOccurred(style);
          return;
        } catch (_) {}
      }
      vibrateFallback(style === "heavy" ? 18 : style === "medium" ? 12 : 8);
    },

    hapticNotification(type: "success" | "warning" | "error" = "success") {
      const app = getWebApp();
      if (app?.initData) {
        try {
          app.HapticFeedback?.notificationOccurred(type);
          return;
        } catch (_) {}
      }
      if (type === "error") vibrateFallback([16, 50, 16]);
      else if (type === "warning") vibrateFallback([12, 40, 12]);
      else vibrateFallback(12);
    },

    hapticSelection() {
      const app = getWebApp();
      if (app?.initData) {
        try {
          app.HapticFeedback?.selectionChanged();
          return;
        } catch (_) {}
      }
      vibrateFallback(8);
    },
  };
}

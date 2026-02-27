function getWebApp() {
  return typeof window !== "undefined" ? window.Telegram?.WebApp : undefined;
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
    user: webApp?.initDataUnsafe?.user || null,

    hapticImpact(style: "light" | "medium" | "heavy" = "medium") {
      const app = getWebApp();
      if (app?.initData) app.HapticFeedback?.impactOccurred(style);
    },

    hapticNotification(type: "success" | "warning" | "error" = "success") {
      const app = getWebApp();
      if (app?.initData) app.HapticFeedback?.notificationOccurred(type);
    },

    hapticSelection() {
      const app = getWebApp();
      if (app?.initData) app.HapticFeedback?.selectionChanged();
    },
  };
}

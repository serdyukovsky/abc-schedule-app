const webApp = typeof window !== "undefined" ? window.Telegram?.WebApp : undefined;
const _isTelegram = Boolean(webApp?.initData);

export function isTelegramWebApp(): boolean {
  return _isTelegram;
}

export function useTelegram() {
  return {
    isTelegram: _isTelegram,
    webApp,
    initData: webApp?.initData || "",
    user: webApp?.initDataUnsafe?.user || null,

    hapticImpact(style: "light" | "medium" | "heavy" = "medium") {
      if (_isTelegram) webApp?.HapticFeedback?.impactOccurred(style);
    },

    hapticNotification(type: "success" | "warning" | "error" = "success") {
      if (_isTelegram) webApp?.HapticFeedback?.notificationOccurred(type);
    },

    hapticSelection() {
      if (_isTelegram) webApp?.HapticFeedback?.selectionChanged();
    },
  };
}

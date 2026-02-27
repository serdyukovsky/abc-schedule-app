interface TelegramWebAppUser {
  id: number;
  is_bot?: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    query_id?: string;
    user?: TelegramWebAppUser;
    auth_date: number;
    hash: string;
  };
  ready: () => void;
  expand: () => void;
  close: () => void;
  platform: string;
  version: string;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  HapticFeedback: {
    impactOccurred: (style: "light" | "medium" | "heavy" | "rigid" | "soft") => void;
    notificationOccurred: (type: "error" | "success" | "warning") => void;
    selectionChanged: () => void;
  };
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    setText: (text: string) => void;
  };
}

interface Window {
  Telegram?: {
    WebApp?: TelegramWebApp;
  };
}

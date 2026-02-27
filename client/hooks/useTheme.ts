import { useCallback, useSyncExternalStore } from "react";
import { Colors } from "@/constants/theme";

type Mode = "light" | "dark";

const STORAGE_KEY = "abc-theme";

function getSystemMode(): Mode {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

let currentMode: Mode =
  (typeof window !== "undefined" &&
    (localStorage.getItem(STORAGE_KEY) as Mode | null)) ||
  getSystemMode();

const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot() {
  return currentMode;
}

function setMode(mode: Mode) {
  currentMode = mode;
  localStorage.setItem(STORAGE_KEY, mode);
  listeners.forEach((cb) => cb());
}

export function useTheme() {
  const mode = useSyncExternalStore(subscribe, getSnapshot, () => "light" as Mode);
  const isDark = mode === "dark";
  const theme = Colors[mode];

  const toggleTheme = useCallback(() => {
    setMode(isDark ? "light" : "dark");
  }, [isDark]);

  return { theme, isDark, toggleTheme };
}

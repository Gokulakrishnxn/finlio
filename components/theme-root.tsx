"use client";

import { useEffect, useSyncExternalStore } from "react";
import { isTheme, THEME_EVENT, THEME_KEY, type Theme } from "@/lib/theme";

function preference(): Theme {
  const value = document.documentElement.dataset.themePreference;
  return isTheme(value) ? value : "system";
}

function applyTheme(theme: Theme) {
  const dark = theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.dataset.themePreference = theme;
  window.dispatchEvent(new Event(THEME_EVENT));
}

function subscribe(callback: () => void) {
  window.addEventListener(THEME_EVENT, callback);
  return () => window.removeEventListener(THEME_EVENT, callback);
}

function serverPreference(): Theme {
  return "system";
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, preference, serverPreference);
  return { theme, setTheme };
}

function setTheme(theme: Theme) {
  try {
    window.localStorage.setItem(THEME_KEY, theme);
  } catch {
    // With blocked storage, the preference still lasts for this page session.
  }
  applyTheme(theme);
}

// Keep System mode and other open tabs in sync even while Settings is closed.
export function ThemeRoot() {
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const syncSystem = () => applyTheme(preference());
    const syncStorage = (event: StorageEvent) => {
      if (event.storageArea !== window.localStorage || (event.key !== THEME_KEY && event.key !== null)) return;
      applyTheme(isTheme(event.newValue) ? event.newValue : "system");
    };
    syncSystem();
    media.addEventListener("change", syncSystem);
    window.addEventListener("storage", syncStorage);
    return () => {
      media.removeEventListener("change", syncSystem);
      window.removeEventListener("storage", syncStorage);
    };
  }, []);
  return null;
}

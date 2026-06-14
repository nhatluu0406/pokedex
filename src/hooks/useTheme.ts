"use client";

import { useThemeContext } from "@/components/shared/ThemeProvider";
import {
  THEME_STORAGE_KEY,
  type Theme,
} from "@/lib/theme-cookie";

function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function readStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : null;
}

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = theme;
}

/** Sync DOM + return resolved theme (localStorage → system). */
export function initTheme(): Theme {
  const theme = readStoredTheme() ?? getSystemTheme();
  applyTheme(theme);
  return theme;
}

export function useTheme() {
  return useThemeContext();
}

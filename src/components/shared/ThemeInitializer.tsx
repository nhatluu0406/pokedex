"use client";

import { useLayoutEffect } from "react";
import { useThemeContext } from "@/components/shared/ThemeProvider";
import { initTheme } from "@/hooks/useTheme";
import { themeCookieValue } from "@/lib/theme-cookie";

export function ThemeInitializer() {
  const { theme, setTheme } = useThemeContext();

  useLayoutEffect(() => {
    const resolved = initTheme();
    document.cookie = themeCookieValue(resolved);
    if (resolved !== theme) {
      setTheme(resolved);
    }
    // Run once on mount to sync localStorage/cookie with SSR theme.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

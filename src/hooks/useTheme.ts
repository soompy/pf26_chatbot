"use client";

import { useEffect, useState, useCallback } from "react";

type Theme = "dark" | "light";

const STORAGE_KEY = "chatbot-ui-theme";

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("dark");

  // 초기값: localStorage → 시스템 설정 순으로 fallback
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored) {
      apply(stored);
      setThemeState(stored);
      return;
    }
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial: Theme = prefersDark ? "dark" : "light";
    apply(initial);
    setThemeState(initial);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    apply(next);
    setThemeState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return { theme, setTheme, toggleTheme, isDark: theme === "dark" };
}

function apply(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

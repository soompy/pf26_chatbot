"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "../Button";

export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      title={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-text-secondary" />
      ) : (
        <Moon className="w-4 h-4 text-text-secondary" />
      )}
    </Button>
  );
}

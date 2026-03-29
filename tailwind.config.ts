import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/design-system/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // AI 브랜드 컬러 (CSS 변수 연동)
        "ai-bubble": "var(--color-ai-bubble)",
        "user-bubble": "var(--color-user-bubble)",
        surface: "var(--color-surface)",
        "surface-raised": "var(--color-surface-raised)",
        "surface-overlay": "var(--color-surface-overlay)",
        border: "var(--color-border)",
        "text-primary": "var(--color-text-primary)",
        "text-secondary": "var(--color-text-secondary)",
        "text-muted": "var(--color-text-muted)",
        accent: "var(--color-accent)",
        "accent-hover": "var(--color-accent-hover)",
        error: "var(--color-error)",
        success: "var(--color-success)",
      },
      animation: {
        "streaming-cursor": "blink 1s step-end infinite",
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "skeleton-pulse": "pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "none",
            color: "var(--color-text-primary)",
            "code::before": { content: '""' },
            "code::after": { content: '""' },
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;

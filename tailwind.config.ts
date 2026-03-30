import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/design-system/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // data-theme 속성으로 다크/라이트 전환 (class 방식 대신)
  darkMode: ["selector", "[data-theme='dark']"],
  theme: {
    extend: {
      /* ── Colors (CSS 변수 → Tailwind 유틸 매핑) ── */
      colors: {
        // Surface
        bg:               "var(--color-bg)",
        surface:          "var(--color-surface)",
        "surface-raised": "var(--color-surface-raised)",
        "surface-overlay":"var(--color-surface-overlay)",
        "surface-sunken": "var(--color-surface-sunken)",

        // Text
        "text-primary":   "var(--color-text-primary)",
        "text-secondary": "var(--color-text-secondary)",
        "text-muted":     "var(--color-text-muted)",
        "text-disabled":  "var(--color-text-disabled)",
        "text-inverse":   "var(--color-text-inverse)",

        // Border (border-{name} 형태로 사용: border-line, border-line-strong)
        "line":           "var(--color-border)",
        "line-strong":    "var(--color-border-strong)",
        "line-subtle":    "var(--color-border-subtle)",

        // Brand
        accent:           "var(--color-accent)",
        "accent-hover":   "var(--color-accent-hover)",
        "accent-subtle":  "var(--color-accent-subtle)",
        "accent-border":  "var(--color-accent-border)",

        // Chat bubbles
        "bubble-ai":          "var(--color-bubble-ai)",
        "bubble-ai-border":   "var(--color-bubble-ai-border)",
        "bubble-user":        "var(--color-bubble-user)",
        "bubble-user-border": "var(--color-bubble-user-border)",

        // 스트리밍
        "streaming-cursor": "var(--color-streaming-cursor)",
        "streaming-glow":   "var(--color-streaming-glow)",
        "streaming-border": "var(--color-streaming-border)",

        // 추론 (Thinking)
        "thinking-cursor": "var(--color-thinking-cursor)",
        "thinking-bg":     "var(--color-thinking-bg)",
        "thinking-border": "var(--color-thinking-border)",
        "thinking-text":   "var(--color-thinking-text)",

        // Tool/Function Call
        "tool-bg":     "var(--color-tool-bg)",
        "tool-border": "var(--color-tool-border)",
        "tool-text":   "var(--color-tool-text)",

        // 코드 블록 헤더
        "code-header":    "var(--color-code-header-bg)",
        "code-lang":      "var(--color-code-lang)",

        // Shimmer
        "shimmer-base":      "var(--color-shimmer-base)",
        "shimmer-highlight": "var(--color-shimmer-highlight)",

        // 컨텍스트 인디케이터
        "context-safe":    "var(--color-context-safe)",
        "context-warning": "var(--color-context-warning)",
        "context-danger":  "var(--color-context-danger)",
        "context-track":   "var(--color-context-track)",

        // 인용
        "citation-bg":     "var(--color-citation-bg)",
        "citation-border": "var(--color-citation-border)",
        "citation-text":   "var(--color-citation-text)",

        // Status
        error:   "var(--color-error)",
        "error-bg":     "var(--color-error-bg)",
        "error-border": "var(--color-error-border)",
        success: "var(--color-success)",
        "success-bg":     "var(--color-success-bg)",
        "success-border": "var(--color-success-border)",
        warning: "var(--color-warning)",
        "warning-bg":     "var(--color-warning-bg)",
        "warning-border": "var(--color-warning-border)",
        info:    "var(--color-info)",
        "info-bg":     "var(--color-info-bg)",
        "info-border": "var(--color-info-border)",
      },

      /* ── Font Family ── */
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },

      /* ── Font Size (CSS 변수 → Tailwind) ── */
      fontSize: {
        "token-xs":   ["var(--font-size-xs)",   { lineHeight: "var(--line-height-normal)" }],
        "token-sm":   ["var(--font-size-sm)",   { lineHeight: "var(--line-height-normal)" }],
        "token-base": ["var(--font-size-base)", { lineHeight: "var(--line-height-relaxed)" }],
        "token-md":   ["var(--font-size-md)",   { lineHeight: "var(--line-height-relaxed)" }],
        "token-lg":   ["var(--font-size-lg)",   { lineHeight: "var(--line-height-snug)" }],
        "token-xl":   ["var(--font-size-xl)",   { lineHeight: "var(--line-height-tight)" }],
        "token-2xl":  ["var(--font-size-2xl)",  { lineHeight: "var(--line-height-tight)" }],
      },

      /* ── Spacing (CSS 변수 → Tailwind) ── */
      spacing: {
        "token-1":  "var(--space-1)",
        "token-2":  "var(--space-2)",
        "token-3":  "var(--space-3)",
        "token-4":  "var(--space-4)",
        "token-5":  "var(--space-5)",
        "token-6":  "var(--space-6)",
        "token-8":  "var(--space-8)",
        "token-10": "var(--space-10)",
        "token-12": "var(--space-12)",
        "token-16": "var(--space-16)",
      },

      /* ── Border Radius ── */
      borderRadius: {
        token:        "var(--radius-md)",
        "token-sm":   "var(--radius-sm)",
        "token-lg":   "var(--radius-lg)",
        "token-xl":   "var(--radius-xl)",
        "token-full": "var(--radius-full)",
        bubble:       "var(--radius-bubble)",
      },

      /* ── Box Shadow ── */
      boxShadow: {
        "token-sm":   "var(--shadow-sm)",
        "token-md":   "var(--shadow-md)",
        "token-lg":   "var(--shadow-lg)",
        "glow-accent":"var(--shadow-glow)",
        "streaming":  "0 0 0 1px var(--color-streaming-border), 0 0 16px var(--color-streaming-glow)",
      },

      /* ── Transition Duration ── */
      transitionDuration: {
        instant: "var(--duration-instant)",
        fast:    "var(--duration-fast)",
        normal:  "var(--duration-normal)",
        slow:    "var(--duration-slow)",
        slower:  "var(--duration-slower)",
        stream:  "var(--duration-stream)",
      },

      /* ── Transition Timing ── */
      transitionTimingFunction: {
        "ease-default": "var(--ease-default)",
        "ease-spring":  "var(--ease-spring)",
        "ease-out":     "var(--ease-out)",
      },

      /* ── Animation ── */
      animation: {
        // AI 특화
        "streaming-cursor": "streaming-blink var(--duration-slower) step-end infinite",
        "shimmer":          "shimmer-sweep 1.6s var(--ease-default) infinite",
        "typing-dot":       "typing-bounce 1.2s var(--ease-default) infinite",
        "thinking-dot":     "thinking-pulse 1.4s var(--ease-default) infinite",
        "chunk-appear":     "chunk-fade var(--duration-fast) var(--ease-out) both",
        "error-shake":      "shake var(--duration-slow) var(--ease-default)",
        "check-pop":        "check-pop var(--duration-normal) var(--ease-spring) both",
        "context-pulse":    "context-pulse 1.5s var(--ease-default) infinite",
        "badge-bounce":     "badge-bounce 1s var(--ease-spring) infinite",

        // 레이아웃
        "message-enter":    "message-slide var(--duration-normal) var(--ease-spring) both",
        "fade-in":          "fade-in var(--duration-normal) var(--ease-out)",
        "slide-up":         "slide-up var(--duration-normal) var(--ease-out)",
      },

      /* ── Keyframes ── */
      keyframes: {
        "streaming-blink": {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0" },
        },
        "shimmer-sweep": {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition:  "200% 0" },
        },
        "typing-bounce": {
          "0%, 80%, 100%": { transform: "translateY(0)",    opacity: "0.4" },
          "40%":           { transform: "translateY(-6px)", opacity: "1"   },
        },
        "chunk-fade": {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        "message-slide": {
          from: { opacity: "0", transform: "translateY(10px) scale(0.98)" },
          to:   { opacity: "1", transform: "translateY(0) scale(1)"       },
        },
        "shake": {
          "0%, 100%": { transform: "translateX(0)" },
          "20%":      { transform: "translateX(-6px)" },
          "40%":      { transform: "translateX(6px)" },
          "60%":      { transform: "translateX(-4px)" },
          "80%":      { transform: "translateX(4px)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to:   { opacity: "1", transform: "translateY(0)"   },
        },
        "thinking-pulse": {
          "0%, 80%, 100%": { transform: "scale(1)",    opacity: "0.35" },
          "40%":           { transform: "scale(1.15)", opacity: "1"    },
        },
        "context-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.6" },
        },
        "check-pop": {
          "0%":   { transform: "scale(0) rotate(-10deg)", opacity: "0" },
          "60%":  { transform: "scale(1.2) rotate(3deg)", opacity: "1" },
          "100%": { transform: "scale(1) rotate(0deg)",   opacity: "1" },
        },
        "badge-bounce": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":      { transform: "translateY(-4px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

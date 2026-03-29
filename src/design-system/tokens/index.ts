/**
 * Design Tokens — AI Chatbot UI Design System
 *
 * 구조: Primitive → Semantic → Component
 * 사용: CSS 변수(var(--...))를 TypeScript에서 타입 안전하게 참조하기 위한 상수
 * 실제 값: src/styles/globals.css 의 CSS 변수가 source of truth
 */

/* ── Primitive (원시값) ── */
export const primitive = {
  duration: {
    instant: "50ms",
    fast:    "150ms",
    normal:  "250ms",
    slow:    "400ms",
    slower:  "600ms",
    stream:  "30ms",
  },
  ease: {
    default: "cubic-bezier(0.4, 0, 0.2, 1)",
    spring:  "cubic-bezier(0.34, 1.56, 0.64, 1)",
    out:     "cubic-bezier(0, 0, 0.2, 1)",
    in:      "cubic-bezier(0.4, 0, 1, 1)",
  },
  radius: {
    xs:   "4px",
    sm:   "6px",
    md:   "10px",
    lg:   "16px",
    xl:   "24px",
    full: "9999px",
  },
} as const;

/* ── Semantic Color Tokens (CSS 변수 참조) ── */
export const colors = {
  bg:      "var(--color-bg)",
  surface: {
    base:    "var(--color-surface)",
    raised:  "var(--color-surface-raised)",
    overlay: "var(--color-surface-overlay)",
    sunken:  "var(--color-surface-sunken)",
  },
  text: {
    primary:   "var(--color-text-primary)",
    secondary:  "var(--color-text-secondary)",
    muted:     "var(--color-text-muted)",
    disabled:  "var(--color-text-disabled)",
    inverse:   "var(--color-text-inverse)",
  },
  border: {
    default: "var(--color-border)",
    strong:  "var(--color-border-strong)",
    subtle:  "var(--color-border-subtle)",
  },
  accent: {
    default: "var(--color-accent)",
    hover:   "var(--color-accent-hover)",
    subtle:  "var(--color-accent-subtle)",
    border:  "var(--color-accent-border)",
  },
  /** AI 응답 특화 토큰 */
  ai: {
    bubbleBg:          "var(--color-bubble-ai)",
    bubbleBorder:      "var(--color-bubble-ai-border)",
    streamingCursor:   "var(--color-streaming-cursor)",
    streamingGlow:     "var(--color-streaming-glow)",
    streamingBorder:   "var(--color-streaming-border)",
    shimmerBase:       "var(--color-shimmer-base)",
    shimmerHighlight:  "var(--color-shimmer-highlight)",
  },
  user: {
    bubbleBg:     "var(--color-bubble-user)",
    bubbleBorder: "var(--color-bubble-user-border)",
  },
  status: {
    error:          "var(--color-error)",
    errorBg:        "var(--color-error-bg)",
    errorBorder:    "var(--color-error-border)",
    success:        "var(--color-success)",
    successBg:      "var(--color-success-bg)",
    successBorder:  "var(--color-success-border)",
    warning:        "var(--color-warning)",
    warningBg:      "var(--color-warning-bg)",
    warningBorder:  "var(--color-warning-border)",
    info:           "var(--color-info)",
    infoBg:         "var(--color-info-bg)",
    infoBorder:     "var(--color-info-border)",
  },
} as const;

/* ── Typography ── */
export const typography = {
  fontFamily: {
    sans: "var(--font-sans)",
    mono: "var(--font-mono)",
  },
  fontSize: {
    xs:   "var(--font-size-xs)",
    sm:   "var(--font-size-sm)",
    base: "var(--font-size-base)",
    md:   "var(--font-size-md)",
    lg:   "var(--font-size-lg)",
    xl:   "var(--font-size-xl)",
    "2xl":"var(--font-size-2xl)",
  },
  fontWeight: {
    normal:   "400",
    medium:   "500",
    semibold: "600",
    bold:     "700",
  },
  lineHeight: {
    tight:   "var(--line-height-tight)",
    snug:    "var(--line-height-snug)",
    normal:  "var(--line-height-normal)",
    relaxed: "var(--line-height-relaxed)",
    loose:   "var(--line-height-loose)",
  },
} as const;

/* ── Spacing ── */
export const spacing = {
  1:  "var(--space-1)",
  2:  "var(--space-2)",
  3:  "var(--space-3)",
  4:  "var(--space-4)",
  5:  "var(--space-5)",
  6:  "var(--space-6)",
  8:  "var(--space-8)",
  10: "var(--space-10)",
  12: "var(--space-12)",
  16: "var(--space-16)",
} as const;

/* ── Radius ── */
export const radius = {
  sm:     "var(--radius-sm)",
  md:     "var(--radius-md)",
  lg:     "var(--radius-lg)",
  xl:     "var(--radius-xl)",
  full:   "var(--radius-full)",
  bubble: "var(--radius-bubble)",
} as const;

/* ── Animation ── */
export const animation = {
  duration: {
    instant: "var(--duration-instant)",
    fast:    "var(--duration-fast)",
    normal:  "var(--duration-normal)",
    slow:    "var(--duration-slow)",
    slower:  "var(--duration-slower)",
    stream:  "var(--duration-stream)",
  },
  ease: {
    default: "var(--ease-default)",
    spring:  "var(--ease-spring)",
    out:     "var(--ease-out)",
  },
} as const;

/* ── Chat Layout ── */
export const chatLayout = {
  sidebarWidth:   "var(--chat-sidebar-width)",
  maxWidth:       "var(--chat-max-width)",
  inputMinHeight: "var(--chat-input-min-height)",
  inputMaxHeight: "var(--chat-input-max-height)",
} as const;

/* ── Shadow ── */
export const shadow = {
  sm:      "var(--shadow-sm)",
  md:      "var(--shadow-md)",
  lg:      "var(--shadow-lg)",
  glow:    "var(--shadow-glow)",
  streaming: "0 0 0 1px var(--color-streaming-border), 0 0 16px var(--color-streaming-glow)",
} as const;

/* 타입 추출 헬퍼 */
export type ColorToken = typeof colors;
export type TypographyToken = typeof typography;
export type SpacingToken = typeof spacing;
export type AnimationToken = typeof animation;

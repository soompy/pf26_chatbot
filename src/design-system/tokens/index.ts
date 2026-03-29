export const colors = {
  surface: {
    base: "var(--color-surface)",
    raised: "var(--color-surface-raised)",
    overlay: "var(--color-surface-overlay)",
  },
  text: {
    primary: "var(--color-text-primary)",
    secondary: "var(--color-text-secondary)",
    muted: "var(--color-text-muted)",
  },
  border: "var(--color-border)",
  accent: {
    DEFAULT: "var(--color-accent)",
    hover: "var(--color-accent-hover)",
  },
  chat: {
    ai: "var(--color-ai-bubble)",
    user: "var(--color-user-bubble)",
  },
  status: {
    error: "var(--color-error)",
    success: "var(--color-success)",
  },
} as const;

export const spacing = {
  xs: "4px",
  sm: "8px",
  md: "16px",
  lg: "24px",
  xl: "32px",
  "2xl": "48px",
  "3xl": "64px",
} as const;

export const radius = {
  sm: "6px",
  md: "10px",
  lg: "16px",
  full: "9999px",
} as const;

export const fontSize = {
  xs: "0.75rem",
  sm: "0.875rem",
  base: "1rem",
  lg: "1.125rem",
  xl: "1.25rem",
  "2xl": "1.5rem",
} as const;

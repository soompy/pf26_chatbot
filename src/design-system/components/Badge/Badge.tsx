import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "accent" | "success" | "error" | "model";
  size?: "sm" | "md";
  className?: string;
}

export function Badge({ children, variant = "default", size = "sm", className }: BadgeProps) {
  const base = "inline-flex items-center gap-1 font-medium rounded-full";

  const variants = {
    default: "bg-surface-overlay text-text-secondary border border-[var(--color-border)]",
    accent: "bg-accent/10 text-accent border border-accent/20",
    success: "bg-success/10 text-success border border-success/20",
    error: "bg-error/10 text-error border border-error/20",
    model: "bg-[#1e1e4a] text-[#8079ff] border border-[#6c63ff]/30",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
  };

  return (
    <span className={twMerge(clsx(base, variants[variant], sizes[size], className))}>
      {children}
    </span>
  );
}

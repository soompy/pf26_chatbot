"use client";

import { forwardRef } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ButtonProps } from "./Button.types";

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const base =
      "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-surface disabled:opacity-40 disabled:cursor-not-allowed select-none";

    const variants = {
      primary:
        "bg-accent hover:bg-accent-hover text-white shadow-sm active:scale-[0.98]",
      secondary:
        "bg-surface-raised hover:bg-surface-overlay text-text-primary border border-[var(--color-border)] active:scale-[0.98]",
      ghost:
        "hover:bg-surface-raised text-text-secondary hover:text-text-primary",
      danger: "bg-error/10 hover:bg-error/20 text-error border border-error/30",
    };

    const sizes = {
      sm: "h-7 px-3 text-xs",
      md: "h-9 px-4 text-sm",
      lg: "h-11 px-5 text-base",
      icon: "h-9 w-9 p-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={twMerge(clsx(base, variants[variant], sizes[size], className))}
        {...props}
      >
        {isLoading ? (
          <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";

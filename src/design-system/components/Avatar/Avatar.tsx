import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface AvatarProps {
  role: "user" | "assistant" | "system";
  size?: "sm" | "md";
  className?: string;
}

const AI_ICON = (
  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" aria-hidden="true">
    <path
      d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const USER_ICON = (
  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" aria-hidden="true">
    <path
      d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export function Avatar({ role, size = "md", className }: AvatarProps) {
  const sizes = { sm: "h-6 w-6", md: "h-8 w-8" };

  const styles = {
    user: "bg-user-bubble text-[#8079ff] border border-[#6c63ff]/30",
    assistant: "bg-accent/20 text-accent border border-accent/30",
    system: "bg-surface-overlay text-text-muted border border-[var(--color-border)]",
  };

  return (
    <div
      className={twMerge(
        clsx(
          "shrink-0 rounded-full flex items-center justify-center",
          sizes[size],
          styles[role],
          className
        )
      )}
      aria-label={role === "assistant" ? "AI" : "You"}
    >
      {role === "assistant" ? AI_ICON : USER_ICON}
    </div>
  );
}

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "block" | "circle";
  lines?: number;
}

export function Skeleton({ className, variant = "block", lines = 1 }: SkeletonProps) {
  const base = "animate-skeleton-pulse bg-surface-overlay rounded";

  if (variant === "text") {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={twMerge(
              clsx(base, "h-4", i === lines - 1 && lines > 1 ? "w-3/4" : "w-full", className)
            )}
          />
        ))}
      </div>
    );
  }

  if (variant === "circle") {
    return <div className={twMerge(clsx(base, "rounded-full", className))} />;
  }

  return <div className={twMerge(clsx(base, className))} />;
}

export function MessageSkeleton() {
  return (
    <div className="flex gap-3 px-4 py-3 animate-fade-in">
      <Skeleton variant="circle" className="h-8 w-8 shrink-0 mt-0.5" />
      <div className="flex-1 space-y-2 pt-1">
        <Skeleton variant="text" lines={3} />
      </div>
    </div>
  );
}

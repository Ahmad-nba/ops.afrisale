interface LoadingSkeletonProps {
  variant?: "card" | "row" | "text";
  count?: number;
  className?: string;
}

/** Animated placeholder used while the first load is in flight. */
export function LoadingSkeleton({ variant = "card", count = 1, className = "" }: LoadingSkeletonProps) {
  const items = Array.from({ length: count });
  if (variant === "card") {
    return (
      <>
        {items.map((_, i) => (
          <div
            key={i}
            className={`h-32 animate-pulse rounded-2xl border border-slate-200 bg-slate-100 ${className}`}
          />
        ))}
      </>
    );
  }
  if (variant === "row") {
    return (
      <div className={`space-y-2 ${className}`}>
        {items.map((_, i) => (
          <div key={i} className="h-10 animate-pulse rounded-lg bg-slate-100" />
        ))}
      </div>
    );
  }
  return (
    <div className={`space-y-2 ${className}`}>
      {items.map((_, i) => (
        <div key={i} className="h-4 w-full animate-pulse rounded bg-slate-100" />
      ))}
    </div>
  );
}

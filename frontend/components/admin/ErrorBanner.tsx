interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

/** Non-fatal error surface — the dashboard keeps rendering last-known data. */
export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
      <div className="flex items-center gap-2 text-sm text-rose-700">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-xs font-bold text-white">
          !
        </span>
        <span>{message}</span>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-100"
        >
          Retry
        </button>
      )}
    </div>
  );
}

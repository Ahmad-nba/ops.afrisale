"use client";

import { formatRelativeTime } from "@/lib/admin/format";
import { IconRefresh } from "./icons";

interface RefreshButtonProps {
  onRefresh: () => void;
  refreshing?: boolean;
  lastUpdated?: number | null;
}

/** Manual-refresh control with a live "updated Xs ago" timestamp. */
export function RefreshButton({ onRefresh, refreshing = false, lastUpdated }: RefreshButtonProps) {
  return (
    <div className="flex items-center gap-3">
      {lastUpdated != null && (
        <span className="hidden text-xs text-slate-400 sm:inline">
          Updated {formatRelativeTime(new Date(lastUpdated).toISOString())}
        </span>
      )}
      <button
        type="button"
        onClick={onRefresh}
        disabled={refreshing}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-60"
      >
        <span className={`text-base ${refreshing ? "animate-spin" : ""}`}>
          <IconRefresh />
        </span>
        Refresh
      </button>
    </div>
  );
}

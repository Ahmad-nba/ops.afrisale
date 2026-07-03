import { formatMs, formatNumber } from "@/lib/admin/format";
import type { DurationStat } from "@/lib/admin/types";

interface LatencyCardProps {
  label: string;
  stat: DurationStat | null | undefined;
}

/** Latency KPI showing average prominently plus max/sample-count context. */
export function LatencyCard({ label, stat }: LatencyCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
        {formatMs(stat?.avg_ms)}
      </p>
      <p className="mt-1 text-xs text-slate-500">average</p>
      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3 text-xs">
        <div>
          <span className="block text-slate-400">Max</span>
          <span className="font-medium text-slate-700">{formatMs(stat?.max_ms)}</span>
        </div>
        <div>
          <span className="block text-slate-400">Samples</span>
          <span className="font-medium text-slate-700">{formatNumber(stat?.count)}</span>
        </div>
      </div>
    </div>
  );
}

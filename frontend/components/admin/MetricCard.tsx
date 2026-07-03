import type { ReactNode } from "react";

import type { Tone } from "./StatusBadge";

const ACCENT: Record<Tone, string> = {
  success: "text-emerald-600",
  warning: "text-amber-600",
  danger: "text-rose-600",
  neutral: "text-slate-900",
  info: "text-sky-600",
};

interface MetricCardProps {
  label: string;
  value: ReactNode;
  sublabel?: ReactNode;
  icon?: ReactNode;
  tone?: Tone;
  footer?: ReactNode;
}

/** Large operational KPI card. The single card primitive for all dashboards. */
export function MetricCard({
  label,
  value,
  sublabel,
  icon,
  tone = "neutral",
  footer,
}: MetricCardProps) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {icon && <span className="text-lg text-slate-400">{icon}</span>}
      </div>
      <div className="mt-3">
        <p className={`text-3xl font-semibold tracking-tight ${ACCENT[tone]}`}>{value}</p>
        {sublabel && <p className="mt-1 text-sm text-slate-500">{sublabel}</p>}
      </div>
      {footer && <div className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">{footer}</div>}
    </div>
  );
}

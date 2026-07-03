import { StatusBadge } from "./StatusBadge";

interface HealthIndicatorProps {
  label: string;
  status: string | null | undefined;
}

/** A labeled component-health row, e.g. "Database — healthy". */
export function HealthIndicator({ label, status }: HealthIndicatorProps) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <StatusBadge status={status} />
    </div>
  );
}

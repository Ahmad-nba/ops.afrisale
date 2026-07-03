import { titleize } from "@/lib/admin/format";

export type Tone = "success" | "warning" | "danger" | "neutral" | "info";

const TONE_CLASSES: Record<Tone, string> = {
  success: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  warning: "bg-amber-50 text-amber-700 ring-amber-600/20",
  danger: "bg-rose-50 text-rose-700 ring-rose-600/20",
  neutral: "bg-slate-100 text-slate-600 ring-slate-500/20",
  info: "bg-sky-50 text-sky-700 ring-sky-600/20",
};

const DOT_CLASSES: Record<Tone, string> = {
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-rose-500",
  neutral: "bg-slate-400",
  info: "bg-sky-500",
};

/** Maps backend status vocabularies (health + readiness) to a semantic tone. */
export function toneForStatus(status: string | null | undefined): Tone {
  const value = (status || "").toLowerCase();
  if (["healthy", "ok", "ready", "success", "up"].includes(value)) return "success";
  if (["degraded", "unconfigured", "pending", "warning"].includes(value)) return "warning";
  if (["unhealthy", "failed", "down", "error", "timeout"].includes(value)) return "danger";
  return "neutral";
}

interface StatusBadgeProps {
  status: string | null | undefined;
  tone?: Tone;
  label?: string;
  withDot?: boolean;
}

export function StatusBadge({ status, tone, label, withDot = true }: StatusBadgeProps) {
  const resolvedTone = tone ?? toneForStatus(status);
  const text = label ?? (status ? titleize(status) : "Unknown");
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${TONE_CLASSES[resolvedTone]}`}
    >
      {withDot && <span className={`h-1.5 w-1.5 rounded-full ${DOT_CLASSES[resolvedTone]}`} />}
      {text}
    </span>
  );
}

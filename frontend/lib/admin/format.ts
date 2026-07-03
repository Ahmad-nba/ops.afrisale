/**
 * Presentation helpers for the Operations Console. Pure functions only — no
 * React, no fetch — so they are trivially reusable across cards and tables.
 */

export function formatNumber(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatMs(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  if (value < 1) return "<1 ms";
  if (value < 1000) return `${Math.round(value)} ms`;
  return `${(value / 1000).toFixed(2)} s`;
}

export function formatPercent(
  value: number | null | undefined,
  fractionDigits = 1,
): string {
  if (value == null || Number.isNaN(value)) return "—";
  return `${value.toFixed(fractionDigits)}%`;
}

/** USD with adaptive precision — tiny per-conversation costs stay legible. */
export function formatUsd(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  if (value === 0) return "$0.00";
  const digits = value < 0.01 ? 4 : value < 1 ? 3 : 2;
  return `$${value.toFixed(digits)}`;
}

export function ratioPercent(
  numerator: number | null | undefined,
  denominator: number | null | undefined,
): number | null {
  if (numerator == null || denominator == null || denominator === 0) return null;
  return (numerator / denominator) * 100;
}

export function titleize(value: string): string {
  return value
    .replace(/[_.]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

export function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return iso;
  const diffSec = Math.round((Date.now() - then) / 1000);
  if (diffSec < 5) return "just now";
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return new Date(iso).toLocaleString();
}

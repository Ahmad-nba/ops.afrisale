"use client";

import { useEffect, useMemo, useState } from "react";

import { DashboardSection } from "@/components/admin/DashboardSection";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { MetricTable, type Column } from "@/components/admin/MetricTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { IconSearch } from "@/components/admin/icons";
import { formatMs, formatRelativeTime } from "@/lib/admin/format";
import { logsAdapter, type LogPage } from "@/lib/admin/logs-adapter";
import type { LogEntry } from "@/lib/admin/types";

const PAGE_SIZE = 15;

const COLUMNS: Column<LogEntry>[] = [
  {
    key: "correlationId",
    header: "Correlation ID",
    render: (r) => <span className="font-mono text-xs text-slate-500">{r.correlationId}</span>,
  },
  { key: "timestamp", header: "Timestamp", render: (r) => formatRelativeTime(r.timestamp) },
  { key: "customer", header: "Customer", render: (r) => <span className="font-mono text-xs">{r.customer}</span> },
  { key: "event", header: "Event", render: (r) => r.event.replace(/_/g, " ") },
  { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
  {
    key: "duration",
    header: "Duration",
    align: "right",
    render: (r) => formatMs(r.durationMs),
  },
  { key: "tool", header: "Tool", render: (r) => r.tool ?? "—" },
  { key: "provider", header: "Provider", render: (r) => r.provider ?? "—" },
];

export default function LogsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [tool, setTool] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<LogPage | null>(null);
  const [loading, setLoading] = useState(true);

  const { statuses, tools } = useMemo(() => logsAdapter.available(), []);

  useEffect(() => {
    setPage(1);
  }, [search, status, tool]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    logsAdapter
      .query({ search, status, tool, page, pageSize: PAGE_SIZE })
      .then((res) => {
        if (active) setResult(res);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [search, status, tool, page]);

  const total = result?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="space-y-6">
      <DashboardSection
        title="Logs"
        description="Searchable conversation and tool-execution trace (sample data)."
      >
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-700">
          Showing sample data. This view is wired through a swappable adapter and
          will use the backend log API once available.
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <IconSearch />
            </span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search correlation ID, customer, event, tool…"
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          >
            <option value="">All statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            value={tool}
            onChange={(e) => setTool(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          >
            <option value="">All tools</option>
            {tools.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {loading && !result ? (
          <LoadingSkeleton variant="row" count={8} />
        ) : (
          <MetricTable
            columns={COLUMNS}
            rows={result?.entries ?? []}
            rowKey={(r) => r.correlationId}
            emptyMessage="No log entries match your filters."
          />
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
          <span>
            {total === 0 ? "No results" : `Showing ${rangeStart}–${rangeEnd} of ${total}`}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-medium text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-2">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-medium text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </DashboardSection>
    </div>
  );
}

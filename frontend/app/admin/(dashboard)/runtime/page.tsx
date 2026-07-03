"use client";

import { CardGrid, DashboardSection } from "@/components/admin/DashboardSection";
import { ErrorBanner } from "@/components/admin/ErrorBanner";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { MetricCard } from "@/components/admin/MetricCard";
import { MetricTable, type Column } from "@/components/admin/MetricTable";
import { RefreshButton } from "@/components/admin/RefreshButton";
import { formatMs, formatNumber, titleize } from "@/lib/admin/format";
import { useRuntimeMetrics } from "@/lib/admin/hooks";
import type { DurationStat } from "@/lib/admin/types";

interface ToolRow {
  op: string;
  stat: DurationStat;
}

const TOOL_COLUMNS: Column<ToolRow>[] = [
  { key: "tool", header: "Tool", render: (r) => titleize(r.op.replace(/^tool:/, "")) },
  { key: "count", header: "Calls", align: "right", render: (r) => formatNumber(r.stat.count) },
  { key: "avg", header: "Avg", align: "right", render: (r) => formatMs(r.stat.avg_ms) },
  { key: "max", header: "Max", align: "right", render: (r) => formatMs(r.stat.max_ms) },
];

export default function RuntimePage() {
  const { data, error, loading, refreshing, lastUpdated, refresh } = useRuntimeMetrics();

  const counters = data?.counters ?? {};
  const durations = data?.durations ?? {};
  const request = durations["request"];
  const provider = durations["provider"];
  const recovery = data?.outbound_recovery;

  const toolRows: ToolRow[] = Object.entries(durations)
    .filter(([op]) => op.startsWith("tool:"))
    .map(([op, stat]) => ({ op, stat }));

  const recovered =
    (counters["outbound_recovered"] ?? 0) + (counters["outbound_recovered_immediate"] ?? 0);

  return (
    <div className="space-y-8">
      <DashboardSection
        title="Runtime"
        description="Operational health of the running application. Auto-refreshes every 10s."
        actions={<RefreshButton onRefresh={refresh} refreshing={refreshing} lastUpdated={lastUpdated} />}
      >
        {error && !data && <ErrorBanner message={error} onRetry={refresh} />}

        {loading && !data ? (
          <CardGrid>
            <LoadingSkeleton variant="card" count={8} />
          </CardGrid>
        ) : (
          <CardGrid>
            <MetricCard label="Total Requests" value={formatNumber(counters["requests"] ?? 0)} tone="info" />
            <MetricCard label="Avg Request Latency" value={formatMs(request?.avg_ms)} />
            <MetricCard label="Max Request Latency" value={formatMs(request?.max_ms)} />
            <MetricCard label="Provider Latency" value={formatMs(provider?.avg_ms)} sublabel={`max ${formatMs(provider?.max_ms)}`} />
            <MetricCard
              label="Timeout Count"
              value={formatNumber(counters["timeouts"] ?? 0)}
              tone={(counters["timeouts"] ?? 0) > 0 ? "warning" : "success"}
            />
            <MetricCard
              label="Failure Count"
              value={formatNumber(counters["failures"] ?? 0)}
              tone={(counters["failures"] ?? 0) > 0 ? "danger" : "success"}
            />
            <MetricCard
              label="Recovery Queue"
              value={formatNumber(recovery?.pending ?? 0)}
              tone={(recovery?.pending ?? 0) > 0 ? "warning" : "success"}
            />
            <MetricCard label="Recovered Messages" value={formatNumber(recovered)} tone="success" />
            <MetricCard
              label="Permanent Failures"
              value={formatNumber(counters["outbound_failed_permanent"] ?? 0)}
              tone={(counters["outbound_failed_permanent"] ?? 0) > 0 ? "danger" : "success"}
            />
          </CardGrid>
        )}
      </DashboardSection>

      <DashboardSection title="Tool Latencies" description="Per-tool execution timing">
        <MetricTable
          columns={TOOL_COLUMNS}
          rows={toolRows}
          rowKey={(r) => r.op}
          emptyMessage="No tool executions recorded yet."
        />
      </DashboardSection>

      <DashboardSection title="Counters" description="Raw runtime counters">
        <MetricTable
          columns={[
            { key: "name", header: "Counter", render: (r: { name: string; value: number }) => titleize(r.name) },
            { key: "value", header: "Value", align: "right", render: (r) => formatNumber(r.value) },
          ]}
          rows={Object.entries(counters).map(([name, value]) => ({ name, value }))}
          rowKey={(r) => r.name}
          emptyMessage="No counters recorded yet."
        />
      </DashboardSection>
    </div>
  );
}

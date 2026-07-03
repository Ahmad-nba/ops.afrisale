"use client";

import { CardGrid, DashboardSection } from "@/components/admin/DashboardSection";
import { ErrorBanner } from "@/components/admin/ErrorBanner";
import { LatencyCard } from "@/components/admin/LatencyCard";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { MetricCard } from "@/components/admin/MetricCard";
import { MetricTable, type Column } from "@/components/admin/MetricTable";
import { RefreshButton } from "@/components/admin/RefreshButton";
import { formatNumber } from "@/lib/admin/format";
import { useBusinessMetrics, useRuntimeMetrics } from "@/lib/admin/hooks";

interface DeliveryRow {
  label: string;
  value: number;
}

const DELIVERY_COLUMNS: Column<DeliveryRow>[] = [
  { key: "label", header: "Metric", render: (r) => r.label },
  { key: "value", header: "Count", align: "right", render: (r) => formatNumber(r.value) },
];

export default function MessagingPage() {
  const runtime = useRuntimeMetrics();
  const business = useBusinessMetrics();

  const counters = runtime.data?.counters ?? {};
  const recovery = runtime.data?.outbound_recovery;
  const twilioLatency = business.data?.latency_ms?.twilio_send;

  const recovered =
    (counters["outbound_recovered"] ?? 0) + (counters["outbound_recovered_immediate"] ?? 0);
  const permanent = counters["outbound_failed_permanent"] ?? 0;
  const persisted = counters["outbound_persisted"] ?? 0;

  const deliveryRows: DeliveryRow[] = [
    { label: "Persisted for retry", value: persisted },
    { label: "Recovered (background)", value: counters["outbound_recovered"] ?? 0 },
    { label: "Recovered (immediate)", value: counters["outbound_recovered_immediate"] ?? 0 },
    { label: "Permanent failures", value: permanent },
  ];

  return (
    <div className="space-y-8">
      <DashboardSection
        title="Messaging"
        description="Outbound delivery, recovery queue and Twilio send performance."
        actions={
          <RefreshButton
            onRefresh={() => {
              runtime.refresh();
              business.refresh();
            }}
            refreshing={runtime.refreshing || business.refreshing}
            lastUpdated={runtime.lastUpdated}
          />
        }
      >
        {runtime.error && !runtime.data && <ErrorBanner message={runtime.error} onRetry={runtime.refresh} />}

        {runtime.loading && !runtime.data ? (
          <CardGrid>
            <LoadingSkeleton variant="card" count={4} />
          </CardGrid>
        ) : (
          <CardGrid>
            <MetricCard
              label="Outbound Recovery Queue"
              value={formatNumber(recovery?.pending ?? 0)}
              tone={(recovery?.pending ?? 0) > 0 ? "warning" : "success"}
            />
            <MetricCard label="Recovered Messages" value={formatNumber(recovered)} tone="success" />
            <MetricCard
              label="Permanent Failures"
              value={formatNumber(permanent)}
              tone={permanent > 0 ? "danger" : "success"}
            />
            <MetricCard
              label="Retry Queue (failed)"
              value={formatNumber(recovery?.failed ?? 0)}
              tone={(recovery?.failed ?? 0) > 0 ? "danger" : "success"}
            />
          </CardGrid>
        )}
      </DashboardSection>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DashboardSection title="Twilio Send Latency" description="Time to hand off to Twilio">
          <div className="max-w-sm">
            <LatencyCard label="Twilio Send" stat={twilioLatency} />
          </div>
        </DashboardSection>

        <DashboardSection title="Message Delivery Statistics" description="Outbound recovery breakdown">
          <MetricTable
            columns={DELIVERY_COLUMNS}
            rows={deliveryRows}
            rowKey={(r) => r.label}
          />
        </DashboardSection>
      </div>

      <DashboardSection title="Manual Actions" description="Reserved for future retry controls">
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500">
          Manual retry of failed messages will be available here once the backend
          exposes a retry endpoint. The table above is retry-action ready.
        </div>
      </DashboardSection>
    </div>
  );
}

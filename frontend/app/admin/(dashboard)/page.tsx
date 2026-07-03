"use client";

import { CardGrid, DashboardSection } from "@/components/admin/DashboardSection";
import { ErrorBanner } from "@/components/admin/ErrorBanner";
import { HealthIndicator } from "@/components/admin/HealthIndicator";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { MetricCard } from "@/components/admin/MetricCard";
import { RefreshButton } from "@/components/admin/RefreshButton";
import { StatusBadge, toneForStatus } from "@/components/admin/StatusBadge";
import { formatMs, formatNumber, formatPercent, formatUsd, ratioPercent } from "@/lib/admin/format";
import { useOverview } from "@/lib/admin/hooks";

export default function OverviewPage() {
  const { health, readiness, runtime, business, loading, refreshing, refresh } = useOverview();

  const healthReport = health.data;
  const readinessReport = readiness.data;
  const summary = business.data;
  const runtimeData = runtime.data;

  const systemHealthy =
    healthReport?.status === "healthy" && readinessReport?.status === "ready";
  const systemTone = systemHealthy
    ? "success"
    : healthReport || readinessReport
      ? "warning"
      : "neutral";
  const systemLabel = systemHealthy
    ? "Operational"
    : healthReport || readinessReport
      ? "Degraded"
      : "Unknown";

  const conversations = summary?.conversations;
  const successRate = ratioPercent(conversations?.successful, conversations?.total);
  const pipelineLatency = summary?.latency_ms?.pipeline?.avg_ms;
  const aiLatency = summary?.latency_ms?.final?.avg_ms;
  const recoveryPending = runtimeData?.outbound_recovery?.pending ?? null;
  const dailyCost = summary?.cost?.daily_cost_usd;

  const backendUnreachable =
    health.error && !healthReport && business.error && !summary;

  return (
    <div className="space-y-8">
      <DashboardSection
        title="Overview"
        description="Live snapshot of Afrisale's health and today's activity."
        actions={
          <RefreshButton
            onRefresh={refresh}
            refreshing={refreshing}
            lastUpdated={business.lastUpdated ?? health.lastUpdated}
          />
        }
      >
        {backendUnreachable && (
          <ErrorBanner
            message="Unable to reach the backend. Showing no data until it recovers."
            onRetry={refresh}
          />
        )}

        {loading && !summary && !healthReport ? (
          <CardGrid>
            <LoadingSkeleton variant="card" count={8} />
          </CardGrid>
        ) : (
          <CardGrid>
            <MetricCard
              label="System Status"
              value={<StatusBadge status={systemLabel} tone={systemTone} />}
              sublabel={systemHealthy ? "All systems normal" : "Check components below"}
              tone={systemTone}
            />
            <MetricCard
              label="Health"
              value={<StatusBadge status={healthReport?.status} />}
              sublabel="Aggregate component health"
            />
            <MetricCard
              label="Readiness"
              value={<StatusBadge status={readinessReport?.status} />}
              sublabel="Deployment dependencies"
            />
            <MetricCard
              label="Conversations Today"
              value={formatNumber(conversations?.total)}
              sublabel={`${formatNumber(conversations?.successful)} successful`}
              tone="info"
            />
            <MetricCard
              label="Orders Created"
              value={formatNumber(summary?.orders?.created)}
              sublabel={`${formatNumber(summary?.orders?.completed)} completed`}
              tone="info"
            />
            <MetricCard
              label="Conversation Success Rate"
              value={formatPercent(successRate)}
              sublabel="Today"
              tone={
                successRate == null ? "neutral" : successRate >= 80 ? "success" : "warning"
              }
            />
            <MetricCard
              label="Avg Pipeline Latency"
              value={formatMs(pipelineLatency)}
              sublabel="End-to-end per turn"
            />
            <MetricCard
              label="Avg AI Latency"
              value={formatMs(aiLatency)}
              sublabel="Final generation"
            />
            <MetricCard
              label="Pending Recovery Queue"
              value={formatNumber(recoveryPending)}
              sublabel="Outbound messages awaiting retry"
              tone={recoveryPending && recoveryPending > 0 ? "warning" : "success"}
            />
            <MetricCard
              label="Estimated AI Cost Today"
              value={formatUsd(dailyCost)}
              sublabel="Gemini token spend"
            />
          </CardGrid>
        )}
      </DashboardSection>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DashboardSection title="Component Health" description="From /api/health and /api/ready">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            {health.loading && !healthReport ? (
              <LoadingSkeleton variant="row" count={4} />
            ) : (
              <div className="divide-y divide-slate-100">
                <HealthIndicator label="Database" status={healthReport?.database} />
                <HealthIndicator label="Provider (Gemini)" status={healthReport?.provider} />
                <HealthIndicator label="Storage" status={healthReport?.storage} />
                <HealthIndicator label="Readiness — Twilio" status={readinessReport?.twilio} />
              </div>
            )}
          </div>
        </DashboardSection>

        <DashboardSection title="Recent Alerts" description="Surfaced from current status">
          <RecentAlerts
            healthStatus={healthReport?.status}
            readinessStatus={readinessReport?.status}
            recoveryPending={recoveryPending}
            failures={runtimeData?.counters?.failures ?? 0}
            timeouts={runtimeData?.counters?.timeouts ?? 0}
          />
        </DashboardSection>
      </div>
    </div>
  );
}

interface RecentAlertsProps {
  healthStatus?: string;
  readinessStatus?: string;
  recoveryPending: number | null;
  failures: number;
  timeouts: number;
}

function RecentAlerts({
  healthStatus,
  readinessStatus,
  recoveryPending,
  failures,
  timeouts,
}: RecentAlertsProps) {
  const alerts: { message: string; tone: "warning" | "danger" }[] = [];
  if (healthStatus && healthStatus !== "healthy") {
    alerts.push({ message: `System health is ${healthStatus}.`, tone: toneForStatus(healthStatus) === "danger" ? "danger" : "warning" });
  }
  if (readinessStatus && readinessStatus !== "ready") {
    alerts.push({ message: `System readiness is ${readinessStatus}.`, tone: "warning" });
  }
  if (recoveryPending && recoveryPending > 0) {
    alerts.push({ message: `${recoveryPending} outbound message(s) pending retry.`, tone: "warning" });
  }
  if (failures > 0) {
    alerts.push({ message: `${failures} runtime failure(s) recorded.`, tone: "danger" });
  }
  if (timeouts > 0) {
    alerts.push({ message: `${timeouts} timeout(s) recorded.`, tone: "warning" });
  }

  if (alerts.length === 0) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <p className="text-sm font-medium text-emerald-700">No active alerts. All clear.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {alerts.map((alert, i) => (
        <div
          key={i}
          className={`rounded-xl border px-4 py-3 text-sm ${
            alert.tone === "danger"
              ? "border-rose-200 bg-rose-50 text-rose-700"
              : "border-amber-200 bg-amber-50 text-amber-700"
          }`}
        >
          {alert.message}
        </div>
      ))}
    </div>
  );
}

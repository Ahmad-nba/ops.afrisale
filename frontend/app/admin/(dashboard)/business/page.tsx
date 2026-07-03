"use client";

import { CardGrid, DashboardSection } from "@/components/admin/DashboardSection";
import { ErrorBanner } from "@/components/admin/ErrorBanner";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { MetricCard } from "@/components/admin/MetricCard";
import { RefreshButton } from "@/components/admin/RefreshButton";
import { formatNumber, formatPercent, formatUsd, ratioPercent } from "@/lib/admin/format";
import { useBusinessMetrics } from "@/lib/admin/hooks";

export default function BusinessPage() {
  const { data, error, loading, refreshing, lastUpdated, refresh } = useBusinessMetrics();

  const conv = data?.conversations;
  const orders = data?.orders;
  const successRate = ratioPercent(conv?.successful, conv?.total);
  const completionRate = ratioPercent(orders?.completed, orders?.created);

  return (
    <div className="space-y-8">
      <DashboardSection
        title="Business"
        description="Conversation outcomes and order performance (all-time)."
        actions={<RefreshButton onRefresh={refresh} refreshing={refreshing} lastUpdated={lastUpdated} />}
      >
        {error && !data && <ErrorBanner message={error} onRetry={refresh} />}

        {loading && !data ? (
          <CardGrid>
            <LoadingSkeleton variant="card" count={8} />
          </CardGrid>
        ) : (
          <CardGrid>
            <MetricCard label="Total Conversations" value={formatNumber(conv?.total)} tone="info" />
            <MetricCard label="Successful" value={formatNumber(conv?.successful)} tone="success" />
            <MetricCard
              label="Failed"
              value={formatNumber(conv?.failed)}
              tone={(conv?.failed ?? 0) > 0 ? "danger" : "neutral"}
            />
            <MetricCard
              label="Escalated"
              value={formatNumber(conv?.escalated)}
              tone={(conv?.escalated ?? 0) > 0 ? "warning" : "neutral"}
            />
            <MetricCard label="Orders Created" value={formatNumber(orders?.created)} tone="info" />
            <MetricCard label="Orders Completed" value={formatNumber(orders?.completed)} tone="success" />
            <MetricCard
              label="Conversation Success %"
              value={formatPercent(successRate)}
              tone={successRate == null ? "neutral" : successRate >= 80 ? "success" : "warning"}
            />
            <MetricCard
              label="Order Completion %"
              value={formatPercent(completionRate)}
              tone={completionRate == null ? "neutral" : completionRate >= 50 ? "success" : "warning"}
            />
          </CardGrid>
        )}
      </DashboardSection>

      <DashboardSection title="Daily Summary" description="Cost and volume for the current day">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <MetricCard label="Daily AI Cost" value={formatUsd(data?.cost?.daily_cost_usd)} />
          <MetricCard
            label="Estimated Cost (scope)"
            value={formatUsd(data?.cost?.estimated_cost_usd)}
            sublabel={data?.scope === "all_time" ? "All-time" : data?.scope}
          />
          <MetricCard
            label="Cost / Conversation"
            value={formatUsd(data?.cost?.cost_per_conversation_usd)}
          />
        </div>
      </DashboardSection>
    </div>
  );
}

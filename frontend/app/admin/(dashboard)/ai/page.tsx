"use client";

import { CardGrid, DashboardSection } from "@/components/admin/DashboardSection";
import { ErrorBanner } from "@/components/admin/ErrorBanner";
import { LatencyCard } from "@/components/admin/LatencyCard";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { MetricCard } from "@/components/admin/MetricCard";
import { RefreshButton } from "@/components/admin/RefreshButton";
import { formatMs, formatNumber, formatUsd } from "@/lib/admin/format";
import { useAIMetrics, useRuntimeMetrics } from "@/lib/admin/hooks";

export default function AIPage() {
  const ai = useAIMetrics();
  const runtime = useRuntimeMetrics();

  const summary = ai.data;
  const latency = summary?.latency_ms ?? {};
  const cost = summary?.cost;
  const provider = runtime.data?.durations?.["provider"];
  const failures = runtime.data?.counters?.["failures"] ?? 0;

  return (
    <div className="space-y-8">
      <DashboardSection
        title="AI"
        description="Model latency, token usage and cost from the Gemini pipeline."
        actions={
          <RefreshButton
            onRefresh={() => {
              ai.refresh();
              runtime.refresh();
            }}
            refreshing={ai.refreshing || runtime.refreshing}
            lastUpdated={ai.lastUpdated}
          />
        }
      >
        {ai.error && !summary && <ErrorBanner message={ai.error} onRetry={ai.refresh} />}

        {ai.loading && !summary ? (
          <CardGrid>
            <LoadingSkeleton variant="card" count={4} />
          </CardGrid>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <LatencyCard label="Planner Latency" stat={latency.planner} />
            <LatencyCard label="Final Generation Latency" stat={latency.final} />
            <LatencyCard label="Provider Latency (runtime)" stat={provider} />
          </div>
        )}
      </DashboardSection>

      <DashboardSection title="Tokens & Cost" description="Estimated Gemini spend">
        <CardGrid>
          <MetricCard label="Prompt Tokens" value={formatNumber(cost?.prompt_tokens)} />
          <MetricCard label="Completion Tokens" value={formatNumber(cost?.completion_tokens)} />
          <MetricCard label="Estimated Cost" value={formatUsd(cost?.estimated_cost_usd)} tone="info" />
          <MetricCard label="Cost / Conversation" value={formatUsd(cost?.cost_per_conversation_usd)} />
          <MetricCard label="Daily Cost" value={formatUsd(cost?.daily_cost_usd)} />
        </CardGrid>
      </DashboardSection>

      <DashboardSection title="Provider Reliability" description="Retries and failures">
        <CardGrid>
          <MetricCard
            label="Provider Failures"
            value={formatNumber(failures)}
            tone={failures > 0 ? "danger" : "success"}
            footer="Runtime failure counter (provider/tool/request)."
          />
          <MetricCard
            label="Provider Retries"
            value="—"
            footer="Not currently exposed by the metrics API."
          />
          <MetricCard
            label="Peak Provider Latency"
            value={formatMs(provider?.max_ms)}
            footer="From /api/metrics durations."
          />
        </CardGrid>
      </DashboardSection>
    </div>
  );
}

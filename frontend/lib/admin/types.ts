/**
 * TypeScript contracts for the Operations Console.
 *
 * Shapes mirror the FastAPI responses:
 *   GET /api/health          -> HealthReport
 *   GET /api/ready           -> ReadinessReport
 *   GET /api/metrics         -> RuntimeMetrics
 *   GET /api/metrics/summary -> BusinessSummary
 *   GET /api/admin/me        -> AdminMe
 *
 * Fields are intentionally permissive (optional / index signatures) so a
 * malformed or partial backend response degrades gracefully in the UI rather
 * than crashing the dashboard.
 */

export type ComponentHealth =
  | "healthy"
  | "degraded"
  | "unhealthy"
  | "unconfigured"
  | string;

export type ComponentReadiness = "ok" | "failed" | "unconfigured" | string;

export interface HealthReport {
  status: ComponentHealth;
  database: ComponentHealth;
  provider: ComponentHealth;
  storage: ComponentHealth;
  [key: string]: ComponentHealth;
}

export interface ReadinessReport {
  status: "ready" | "degraded" | string;
  database: ComponentReadiness;
  gemini: ComponentReadiness;
  storage: ComponentReadiness;
  twilio: ComponentReadiness;
  [key: string]: string;
}

export interface DurationStat {
  count: number;
  avg_ms: number;
  max_ms: number;
  last_ms?: number;
}

export interface OutboundRecovery {
  pending: number;
  failed: number;
}

export interface RuntimeMetrics {
  counters: Record<string, number>;
  durations: Record<string, DurationStat>;
  outbound_recovery?: OutboundRecovery;
}

export interface ConversationCounts {
  total: number;
  successful: number;
  failed: number;
  escalated: number;
}

export interface OrderCounts {
  created: number;
  completed: number;
}

export interface CostSummary {
  prompt_tokens: number;
  completion_tokens: number;
  estimated_cost_usd: number;
  cost_per_conversation_usd: number;
  daily_cost_usd: number;
}

export interface BusinessSummary {
  scope: string;
  conversations: ConversationCounts;
  orders: OrderCounts;
  latency_ms: Record<string, DurationStat>;
  cost: CostSummary;
  error?: string;
}

export interface AdminMe {
  email: string;
  authenticated: boolean;
}

export interface LoginResult {
  success: boolean;
  email: string;
}

/** A single row for the Logs page. Sourced from a mock adapter for now. */
export interface LogEntry {
  correlationId: string;
  timestamp: string;
  customer: string;
  event: string;
  status: "success" | "failed" | "timeout" | "escalated" | string;
  durationMs: number | null;
  tool: string | null;
  provider: string | null;
}

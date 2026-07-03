/**
 * Logs data adapter.
 *
 * A structured log-query API does not exist yet, so the Logs page reads through
 * this adapter interface backed by a deterministic mock. When a backend
 * endpoint lands, implement `ApiLogsAdapter` with the same signature and swap
 * the export — the page and table stay unchanged.
 */

import type { LogEntry } from "./types";

export interface LogQuery {
  search?: string;
  status?: string;
  tool?: string;
  page: number;
  pageSize: number;
}

export interface LogPage {
  entries: LogEntry[];
  total: number;
  page: number;
  pageSize: number;
}

export interface LogsAdapter {
  query(params: LogQuery): Promise<LogPage>;
  available(): { statuses: string[]; tools: string[] };
}

const STATUSES: LogEntry["status"][] = ["success", "failed", "timeout", "escalated"];
const TOOLS = ["catalog_search", "image_search", "create_order", "price_lookup", "none"];
const PROVIDERS = ["gemini", "twilio", "none"];
const EVENTS = [
  "inbound_message",
  "tool_execution",
  "final_response",
  "provider_call",
  "outbound_send",
];

function seededRandom(seed: number): () => number {
  let value = seed % 2147483647;
  if (value <= 0) value += 2147483646;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function generateMockLogs(count: number): LogEntry[] {
  const rand = seededRandom(42);
  const now = Date.now();
  const entries: LogEntry[] = [];
  for (let i = 0; i < count; i += 1) {
    const status = STATUSES[Math.floor(rand() * STATUSES.length)];
    const tool = TOOLS[Math.floor(rand() * TOOLS.length)];
    const provider = PROVIDERS[Math.floor(rand() * PROVIDERS.length)];
    const event = EVENTS[Math.floor(rand() * EVENTS.length)];
    entries.push({
      correlationId: `cid_${(1000000 + Math.floor(rand() * 8999999)).toString(16)}`,
      timestamp: new Date(now - i * 1000 * 60 * Math.floor(rand() * 7 + 1)).toISOString(),
      customer: `+2547${Math.floor(10000000 + rand() * 89999999)}`,
      event,
      status,
      durationMs: Math.round(rand() * 4000),
      tool: tool === "none" ? null : tool,
      provider: provider === "none" ? null : provider,
    });
  }
  return entries;
}

/** In-memory mock adapter with client-side search/filter/pagination. */
export class MockLogsAdapter implements LogsAdapter {
  private readonly data: LogEntry[];

  constructor(count = 120) {
    this.data = generateMockLogs(count);
  }

  available() {
    return { statuses: STATUSES, tools: TOOLS.filter((t) => t !== "none") };
  }

  async query(params: LogQuery): Promise<LogPage> {
    const search = (params.search || "").trim().toLowerCase();
    let filtered = this.data;
    if (search) {
      filtered = filtered.filter(
        (e) =>
          e.correlationId.toLowerCase().includes(search) ||
          e.customer.toLowerCase().includes(search) ||
          e.event.toLowerCase().includes(search) ||
          (e.tool ?? "").toLowerCase().includes(search),
      );
    }
    if (params.status) {
      filtered = filtered.filter((e) => e.status === params.status);
    }
    if (params.tool) {
      filtered = filtered.filter((e) => e.tool === params.tool);
    }
    const total = filtered.length;
    const start = (params.page - 1) * params.pageSize;
    const entries = filtered.slice(start, start + params.pageSize);
    // Simulate async latency so the loading state is exercised.
    await new Promise((resolve) => setTimeout(resolve, 150));
    return { entries, total, page: params.page, pageSize: params.pageSize };
  }
}

export const logsAdapter: LogsAdapter = new MockLogsAdapter();

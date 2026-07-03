/**
 * Centralized Operations Console API client.
 *
 * The single source of truth for talking to the FastAPI backend from the admin
 * app. All requests send the HttpOnly JWT cookie via `credentials: "include"`;
 * no token is ever read or stored in JS/localStorage. Components never call
 * `fetch` directly — they go through the typed functions below (and the hooks
 * that wrap them), so error handling, timeouts and retries live in one place.
 */

import type {
  AdminMe,
  BusinessSummary,
  HealthReport,
  LoginResult,
  ReadinessReport,
  RuntimeMetrics,
} from "./types";

const API_BASE_ENV = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");
const DEFAULT_TIMEOUT_MS = 12_000;

function apiBase(): string {
  return API_BASE_ENV || "http://localhost:8000";
}

/** Normalized API error carrying the HTTP status so callers can branch (401). */
export class ApiError extends Error {
  readonly status: number;
  readonly isNetwork: boolean;

  constructor(message: string, status: number, isNetwork = false) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.isNetwork = isNetwork;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }
}

interface RequestOptions {
  method?: "GET" | "POST";
  body?: unknown;
  timeoutMs?: number;
  /** Retry idempotent GETs on transient network/5xx failures. */
  retries?: number;
  signal?: AbortSignal;
}

async function parseError(response: Response): Promise<string> {
  try {
    const data = await response.json();
    if (data && typeof data === "object") {
      const detail = (data as Record<string, unknown>).detail;
      const message = (data as Record<string, unknown>).message;
      if (typeof detail === "string") return detail;
      if (typeof message === "string") return message;
    }
  } catch {
    /* fall through to status text */
  }
  return response.statusText || `Request failed (${response.status})`;
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, timeoutMs = DEFAULT_TIMEOUT_MS, retries = 0 } = opts;
  const maxAttempts = Math.max(1, retries + 1);
  let lastError: ApiError | null = null;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    // Chain an externally-provided signal into our timeout controller.
    if (opts.signal) {
      if (opts.signal.aborted) controller.abort();
      else opts.signal.addEventListener("abort", () => controller.abort(), { once: true });
    }
    try {
      const response = await fetch(`${apiBase()}${path}`, {
        method,
        credentials: "include",
        cache: "no-store",
        headers: body != null ? { "Content-Type": "application/json", Accept: "application/json" } : { Accept: "application/json" },
        body: body != null ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!response.ok) {
        const message = await parseError(response);
        const error = new ApiError(message, response.status);
        // Retry transient 5xx on GETs; never retry auth failures.
        if (method === "GET" && response.status >= 500 && attempt < maxAttempts - 1) {
          lastError = error;
          continue;
        }
        throw error;
      }

      if (response.status === 204) return undefined as T;
      const text = await response.text();
      if (!text) return undefined as T;
      try {
        return JSON.parse(text) as T;
      } catch {
        throw new ApiError("Malformed response from server.", response.status);
      }
    } catch (err) {
      clearTimeout(timer);
      if (err instanceof ApiError) {
        if (err.status >= 500 && method === "GET" && attempt < maxAttempts - 1) {
          lastError = err;
          continue;
        }
        throw err;
      }
      // AbortError (timeout) or network failure.
      const aborted = err instanceof DOMException && err.name === "AbortError";
      const netError = new ApiError(
        aborted ? "Request timed out." : "Network error — backend unreachable.",
        0,
        true,
      );
      if (method === "GET" && attempt < maxAttempts - 1) {
        lastError = netError;
        continue;
      }
      throw netError;
    }
  }
  throw lastError ?? new ApiError("Request failed.", 0, true);
}

// --- Authentication --------------------------------------------------------

export function login(email: string, password: string): Promise<LoginResult> {
  return request<LoginResult>("/api/admin/login", {
    method: "POST",
    body: { email, password },
  });
}

export function logout(): Promise<{ success: boolean }> {
  return request<{ success: boolean }>("/api/admin/logout", { method: "POST" });
}

export function getMe(signal?: AbortSignal): Promise<AdminMe> {
  return request<AdminMe>("/api/admin/me", { signal });
}

// --- Operational data (polled) ---------------------------------------------

export function getHealth(signal?: AbortSignal): Promise<HealthReport> {
  return request<HealthReport>("/api/health", { retries: 1, signal });
}

export function getReadiness(signal?: AbortSignal): Promise<ReadinessReport> {
  return request<ReadinessReport>("/api/ready", { retries: 1, signal });
}

export function getRuntimeMetrics(signal?: AbortSignal): Promise<RuntimeMetrics> {
  return request<RuntimeMetrics>("/api/metrics", { retries: 1, signal });
}

export function getSummary(signal?: AbortSignal, day?: string): Promise<BusinessSummary> {
  const query = day ? `?day=${encodeURIComponent(day)}` : "";
  return request<BusinessSummary>(`/api/metrics/summary${query}`, { retries: 1, signal });
}

/** UTC date string (YYYY-MM-DD) matching the backend's day bucketing. */
export function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

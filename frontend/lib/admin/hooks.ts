"use client";

/**
 * Data-fetching hooks for the Operations Console.
 *
 * A single `usePolling` primitive encapsulates loading/error/refresh state,
 * a configurable interval, tab-visibility pausing, in-flight cancellation and
 * mid-session 401 handling. The per-endpoint hooks are thin wrappers so pages
 * never duplicate fetch/poll logic.
 */

import { useCallback, useEffect, useRef, useState } from "react";

import { ApiError } from "./admin-api";
import * as api from "./admin-api";
import { useAdminAuth } from "./auth-context";
import type {
  BusinessSummary,
  HealthReport,
  ReadinessReport,
  RuntimeMetrics,
} from "./types";

export const DEFAULT_POLL_MS = 10_000;

export interface PollingResult<T> {
  data: T | null;
  error: string | null;
  /** True only during the very first load (drives skeletons). */
  loading: boolean;
  /** True during background refreshes (drives the spinner on the button). */
  refreshing: boolean;
  lastUpdated: number | null;
  refresh: () => void;
}

export function usePolling<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  intervalMs: number = DEFAULT_POLL_MS,
): PollingResult<T> {
  const { handleAuthError } = useAdminAuth();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const mountedRef = useRef(true);
  const inFlightRef = useRef<AbortController | null>(null);
  const hasLoadedRef = useRef(false);

  const run = useCallback(async () => {
    inFlightRef.current?.abort();
    const controller = new AbortController();
    inFlightRef.current = controller;
    if (hasLoadedRef.current) setRefreshing(true);
    try {
      const result = await fetcherRef.current(controller.signal);
      if (!mountedRef.current || controller.signal.aborted) return;
      setData(result);
      setError(null);
      setLastUpdated(Date.now());
      hasLoadedRef.current = true;
    } catch (err) {
      if (!mountedRef.current || controller.signal.aborted) return;
      if (err instanceof ApiError && err.isUnauthorized) {
        handleAuthError(err);
        return;
      }
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [handleAuthError]);

  const refresh = useCallback(() => {
    void run();
  }, [run]);

  useEffect(() => {
    mountedRef.current = true;
    void run();

    let timer: ReturnType<typeof setInterval> | null = null;
    const start = () => {
      if (timer != null) return;
      timer = setInterval(() => {
        if (typeof document === "undefined" || document.visibilityState === "visible") {
          void run();
        }
      }, intervalMs);
    };
    const stop = () => {
      if (timer != null) {
        clearInterval(timer);
        timer = null;
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        void run();
        start();
      } else {
        stop();
      }
    };

    start();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      mountedRef.current = false;
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
      inFlightRef.current?.abort();
    };
    // run is stable via useCallback; interval fixed per hook instance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run, intervalMs]);

  return { data, error, loading, refreshing, lastUpdated, refresh };
}

export function useHealth(intervalMs = DEFAULT_POLL_MS): PollingResult<HealthReport> {
  return usePolling<HealthReport>(api.getHealth, intervalMs);
}

export function useReadiness(intervalMs = DEFAULT_POLL_MS): PollingResult<ReadinessReport> {
  return usePolling<ReadinessReport>(api.getReadiness, intervalMs);
}

export function useRuntimeMetrics(intervalMs = DEFAULT_POLL_MS): PollingResult<RuntimeMetrics> {
  return usePolling<RuntimeMetrics>(api.getRuntimeMetrics, intervalMs);
}

export function useBusinessMetrics(intervalMs = DEFAULT_POLL_MS): PollingResult<BusinessSummary> {
  return usePolling<BusinessSummary>(api.getSummary, intervalMs);
}

/** AI page reuses the persisted summary (latency + token/cost live there). */
export function useAIMetrics(intervalMs = DEFAULT_POLL_MS): PollingResult<BusinessSummary> {
  return useBusinessMetrics(intervalMs);
}

export interface OverviewData {
  health: PollingResult<HealthReport>;
  readiness: PollingResult<ReadinessReport>;
  runtime: PollingResult<RuntimeMetrics>;
  business: PollingResult<BusinessSummary>;
  /** Aggregate flags across all sources for page-level chrome. */
  loading: boolean;
  refreshing: boolean;
  refresh: () => void;
}

/** Composes every source the Overview landing page aggregates (today-scoped). */
export function useOverview(intervalMs = DEFAULT_POLL_MS): OverviewData {
  const health = useHealth(intervalMs);
  const readiness = useReadiness(intervalMs);
  const runtime = useRuntimeMetrics(intervalMs);
  // Overview reflects "today" so conversation/success/latency cards are current.
  const business = usePolling<BusinessSummary>(
    (signal) => api.getSummary(signal, api.todayUtc()),
    intervalMs,
  );

  const refresh = useCallback(() => {
    health.refresh();
    readiness.refresh();
    runtime.refresh();
    business.refresh();
  }, [health, readiness, runtime, business]);

  return {
    health,
    readiness,
    runtime,
    business,
    loading: health.loading || readiness.loading || runtime.loading || business.loading,
    refreshing:
      health.refreshing || readiness.refreshing || runtime.refreshing || business.refreshing,
    refresh,
  };
}

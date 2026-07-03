"use client";

/**
 * Admin authentication context.
 *
 * Because the JWT lives in an HttpOnly cookie set on the *backend* domain, the
 * frontend cannot read it directly (and Next.js middleware on Vercel can't see
 * a cookie scoped to another domain). Auth state is therefore established by
 * calling GET /api/admin/me on startup — exactly the flow in the spec.
 *
 * This context is the ONLY place that knows about the auth mechanism, so the
 * pages/guard stay decoupled and the backend auth can be swapped without UI
 * changes. `handleAuthError` lets data hooks surface a mid-session expiry
 * (a 401 from any polled endpoint) and drop the user back to login.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { ApiError, getMe, login as apiLogin, logout as apiLogout } from "./admin-api";
import { DEV_ADMIN_EMAIL, isAdminAuthDisabled } from "./config";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthState {
  status: AuthStatus;
  email: string | null;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  /** Called by data hooks when a request returns 401 mid-session. */
  handleAuthError: (error: unknown) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const authDisabled = isAdminAuthDisabled();
  // In bypass mode, start already authenticated so the guard never redirects.
  const [state, setState] = useState<AuthState>(
    authDisabled
      ? { status: "authenticated", email: DEV_ADMIN_EMAIL }
      : { status: "loading", email: null },
  );
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    if (authDisabled) {
      if (mountedRef.current) setState({ status: "authenticated", email: DEV_ADMIN_EMAIL });
      return;
    }
    try {
      const me = await getMe();
      if (!mountedRef.current) return;
      setState({ status: "authenticated", email: me.email });
    } catch (err) {
      if (!mountedRef.current) return;
      // Any failure (401, network, timeout) => treat as not authenticated so
      // the guard shows login rather than a broken shell.
      setState({ status: "unauthenticated", email: null });
      if (!(err instanceof ApiError) || !err.isUnauthorized) {
        // Non-auth failures are non-fatal; startup simply resolves to login.
      }
    }
  }, [authDisabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    if (authDisabled) {
      if (mountedRef.current) {
        setState({ status: "authenticated", email: email || DEV_ADMIN_EMAIL });
      }
      return;
    }
    const result = await apiLogin(email, password);
    if (mountedRef.current) {
      setState({ status: "authenticated", email: result.email });
    }
  }, [authDisabled]);

  const logout = useCallback(async () => {
    if (authDisabled) {
      if (mountedRef.current) {
        setState({ status: "unauthenticated", email: null });
      }
      return;
    }
    try {
      await apiLogout();
    } finally {
      if (mountedRef.current) {
        setState({ status: "unauthenticated", email: null });
      }
    }
  }, [authDisabled]);

  const handleAuthError = useCallback((error: unknown): boolean => {
    // With auth bypassed there is no session to expire on a 401.
    if (authDisabled) return false;
    if (error instanceof ApiError && error.isUnauthorized) {
      if (mountedRef.current) {
        setState({ status: "unauthenticated", email: null });
      }
      return true;
    }
    return false;
  }, [authDisabled]);

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, login, logout, refresh, handleAuthError }),
    [state, login, logout, refresh, handleAuthError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAdminAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return ctx;
}

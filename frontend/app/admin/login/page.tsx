"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import { ApiError } from "@/lib/admin/admin-api";
import { useAdminAuth } from "@/lib/admin/auth-context";

export default function AdminLoginPage() {
  const router = useRouter();
  const { status, login } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Already authenticated (e.g. navigated to /admin/login directly) -> dashboard.
  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/admin");
    }
  }, [status, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      router.replace("/admin");
    } catch (err) {
      // Generic message — never disclose which field was wrong.
      if (err instanceof ApiError && err.status === 503) {
        setError("Admin login is not configured on the server.");
      } else if (err instanceof ApiError && err.isNetwork) {
        setError("Cannot reach the server. Please try again.");
      } else {
        setError("Invalid email or password.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-xl font-bold text-white">
            A
          </span>
          <h1 className="mt-4 text-xl font-semibold text-white">Operations Console</h1>
          <p className="mt-1 text-sm text-slate-400">Sign in to continue</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-slate-800 bg-slate-800/50 p-6 shadow-xl"
        >
          {error && (
            <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40"
              placeholder="admin@afrisale.io"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={submitting || status === "loading"}
            className="w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          Afrisale internal tool — authorized personnel only.
        </p>
      </div>
    </div>
  );
}

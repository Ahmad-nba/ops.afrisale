"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { useAdminAuth } from "@/lib/admin/auth-context";

/** Full-screen spinner while auth status is resolving or a redirect is pending. */
function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-brand" />
        <p className="text-sm text-slate-500">Checking your session…</p>
      </div>
    </div>
  );
}

/**
 * Client-side route protection. Because the JWT cookie is HttpOnly and scoped
 * to the backend domain, protection is enforced by the auth-context `me` probe
 * rather than Next.js middleware. Unauthenticated users are redirected to login.
 */
export function AdminGuard({ children }: { children: ReactNode }) {
  const { status } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/admin/login");
    }
  }, [status, router]);

  if (status === "authenticated") {
    return <>{children}</>;
  }
  return <FullScreenLoader />;
}

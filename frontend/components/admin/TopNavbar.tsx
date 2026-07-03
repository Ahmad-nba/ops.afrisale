"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { useAdminAuth } from "@/lib/admin/auth-context";
import { isAdminAuthDisabled } from "@/lib/admin/config";
import { IconLogout, IconMenu } from "./icons";
import { labelForPath } from "./nav";

interface TopNavbarProps {
  onToggleSidebar: () => void;
}

export function TopNavbar({ onToggleSidebar }: TopNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { email, logout } = useAdminAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      router.replace("/admin/login");
    }
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          aria-label="Toggle navigation"
        >
          <span className="text-xl">
            <IconMenu />
          </span>
        </button>
        <h1 className="text-lg font-semibold text-slate-900">{labelForPath(pathname)}</h1>
      </div>
      <div className="flex items-center gap-3">
        {isAdminAuthDisabled() && (
          <span className="hidden rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20 sm:inline">
            Auth bypassed (dev)
          </span>
        )}
        {email && (
          <span className="hidden text-sm text-slate-500 sm:inline">{email}</span>
        )}
        <div className="hidden h-8 w-8 items-center justify-center rounded-full bg-brand-light text-sm font-semibold text-brand-dark sm:flex">
          {(email || "A").charAt(0).toUpperCase()}
        </div>
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-60"
        >
          <span className="text-base">
            <IconLogout />
          </span>
          <span className="hidden sm:inline">{loggingOut ? "Signing out…" : "Logout"}</span>
        </button>
      </div>
    </header>
  );
}

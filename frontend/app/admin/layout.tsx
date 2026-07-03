import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AdminAuthProvider } from "@/lib/admin/auth-context";

export const metadata: Metadata = {
  title: "Afrisale Operations Console",
  description: "Internal operations dashboard for Afrisale administrators.",
  robots: { index: false, follow: false },
};

/**
 * Root of the admin app. Provides auth context to everything under /admin
 * (login page included, so it can call login() and redirect on success). The
 * dashboard shell + route guard live in the (dashboard) route group so the
 * login page renders without them.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminAuthProvider>{children}</AdminAuthProvider>;
}

import type { ReactNode } from "react";

import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminShell } from "@/components/admin/AdminShell";

/**
 * Protected dashboard layout. The (dashboard) route group keeps URLs at /admin,
 * /admin/business, etc. while isolating the guarded shell from the login page.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AdminGuard>
      <AdminShell>{children}</AdminShell>
    </AdminGuard>
  );
}

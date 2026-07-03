import type { ReactNode } from "react";

import {
  IconAI,
  IconBusiness,
  IconLogs,
  IconMessaging,
  IconOverview,
  IconRuntime,
  IconSettings,
} from "./icons";

export interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
}

/** Single source of truth for admin routes — used by Sidebar and TopNavbar. */
export const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Overview", icon: <IconOverview /> },
  { href: "/admin/business", label: "Business", icon: <IconBusiness /> },
  { href: "/admin/runtime", label: "Runtime", icon: <IconRuntime /> },
  { href: "/admin/ai", label: "AI", icon: <IconAI /> },
  { href: "/admin/messaging", label: "Messaging", icon: <IconMessaging /> },
  { href: "/admin/logs", label: "Logs", icon: <IconLogs /> },
  { href: "/admin/settings", label: "Settings", icon: <IconSettings /> },
];

/** Resolve the current page's nav label from the pathname (exact-or-prefix). */
export function labelForPath(pathname: string): string {
  // Prefer the most specific (longest) matching href so /admin/ai doesn't match /admin.
  const match = [...NAV_ITEMS]
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
  return match?.label ?? "Operations Console";
}

export function isActivePath(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

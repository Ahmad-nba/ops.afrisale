"use client";

import { useState, type ReactNode } from "react";

import { Sidebar } from "./Sidebar";
import { TopNavbar } from "./TopNavbar";

/** Chrome for every authenticated admin page: sidebar + top bar + content. */
export function AdminShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopNavbar onToggleSidebar={() => setSidebarOpen((v) => !v)} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

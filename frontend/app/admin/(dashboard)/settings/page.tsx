"use client";

import { DashboardSection } from "@/components/admin/DashboardSection";
import { EmptyState } from "@/components/admin/EmptyState";

const SECTIONS: { title: string; description: string }[] = [
  { title: "System Configuration", description: "Business name, personas and core toggles." },
  { title: "Feature Flags", description: "Enable/disable runtime, observability and recovery features." },
  { title: "Runtime Configuration", description: "Timeouts, retry policy and polling intervals." },
  { title: "Environment Information", description: "Deployment version, git commit and Cloud Run revision." },
];

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <DashboardSection
        title="Settings"
        description="Configuration surfaces for the Operations Console (coming soon)."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {SECTIONS.map((section) => (
            <div
              key={section.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">{section.title}</h3>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                  Planned
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500">{section.description}</p>
            </div>
          ))}
        </div>
      </DashboardSection>

      <DashboardSection title="Deployment" description="Build and revision metadata">
        <EmptyState
          message="Deployment metadata will appear here"
          hint="Version, git commit and Cloud Run revision — pending a backend info endpoint."
        />
      </DashboardSection>
    </div>
  );
}

import type { ReactNode } from "react";

import { IconInbox } from "./icons";

interface EmptyStateProps {
  message: string;
  hint?: string;
  icon?: ReactNode;
}

export function EmptyState({ message, hint, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
      <span className="text-2xl text-slate-300">{icon ?? <IconInbox />}</span>
      <p className="mt-2 text-sm font-medium text-slate-600">{message}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

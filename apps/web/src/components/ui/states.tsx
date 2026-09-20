import type { ReactNode } from "react";

/** États réutilisables (constitution : chaque interface couvre loading/empty/error/success). */

export function Loading({ label = "Chargement…" }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex items-center gap-3 p-6 text-muted">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-brand" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function EmptyState({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="rounded-[var(--radius)] border border-dashed border-border p-8 text-center">
      <p className="font-semibold">{title}</p>
      {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ title = "Une erreur est survenue", detail, retry }: { title?: string; detail?: string; retry?: ReactNode }) {
  return (
    <div role="alert" className="rounded-[var(--radius)] border border-border bg-surface p-6">
      <p className="font-semibold text-brand">{title}</p>
      {detail && <p className="mt-1 text-sm text-muted">{detail}</p>}
      {retry && <div className="mt-4">{retry}</div>}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

type Status = "idle" | "loading" | "success" | "error";

function readUtm(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const p = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  for (const k of ["source", "medium", "campaign", "term", "content"]) {
    const v = p.get(`utm_${k}`);
    if (v) utm[k] = v;
  }
  return utm;
}

export function LeadForm({
  source,
  landingPageId,
  ctaLabel = "Confier un recrutement",
}: {
  source: string;
  landingPageId?: number;
  ctaLabel?: string;
}) {
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setStatus("loading");
    const body = {
      contactName: fd.get("contactName"),
      email: fd.get("email"),
      company: fd.get("company"),
      phone: fd.get("phone"),
      profileSought: fd.get("profileSought"),
      comment: fd.get("comment"),
      company_url: fd.get("company_url"), // honeypot
      ...(landingPageId != null ? { landingPage: landingPageId } : {}),
      source,
      utm: readUtm(),
    };
    try {
      const res = await fetch("/submit-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div role="status" className="rounded-[var(--radius)] border border-border bg-surface p-6">
        <p className="font-semibold text-accent">Merci — votre demande est bien reçue.</p>
        <p className="mt-1 text-sm text-muted">Un consultant Maximerit vous recontacte rapidement.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3" noValidate>
      {/* honeypot anti-spam : caché, doit rester vide */}
      <input
        type="text"
        name="company_url"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="contactName" required placeholder="Nom *" className="rounded-[var(--radius)] border border-border bg-background px-3 py-2 text-sm" />
        <input name="email" type="email" required placeholder="Email professionnel *" className="rounded-[var(--radius)] border border-border bg-background px-3 py-2 text-sm" />
        <input name="company" placeholder="Société" className="rounded-[var(--radius)] border border-border bg-background px-3 py-2 text-sm" />
        <input name="phone" placeholder="Téléphone" className="rounded-[var(--radius)] border border-border bg-background px-3 py-2 text-sm" />
        <input name="profileSought" placeholder="Profil recherché" className="rounded-[var(--radius)] border border-border bg-background px-3 py-2 text-sm sm:col-span-2" />
      </div>
      <textarea name="comment" placeholder="Votre besoin" rows={3} className="rounded-[var(--radius)] border border-border bg-background px-3 py-2 text-sm" />
      {status === "error" && (
        <p role="alert" className="text-sm text-brand">Une erreur est survenue. Vérifiez vos informations et réessayez.</p>
      )}
      <Button type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Envoi…" : ctaLabel}
      </Button>
    </form>
  );
}

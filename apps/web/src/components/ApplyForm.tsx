"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { pushEvent, trackOnce } from "@/lib/analytics";

type Status = "idle" | "loading" | "success" | "error";

export function ApplyForm({ jobId, jobTitle }: { jobId?: number | string; jobTitle?: string }) {
  const trackId = jobId ?? "spontanee";
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (!fd.get("consent")) {
      setStatus("error");
      return;
    }
    const profile = {
      firstName: fd.get("firstName"),
      lastName: fd.get("lastName"),
      email: fd.get("email"),
      phone: fd.get("phone"),
      consent: true,
      currentPosition: fd.get("currentPosition"),
    };
    const body = new FormData();
    body.set("profile", JSON.stringify(profile));
    if (jobId != null) body.set("jobId", String(jobId));
    const cv = fd.get("cv");
    if (cv) body.set("cv", cv);
    body.set("company_url", String(fd.get("company_url") ?? "")); // honeypot

    setStatus("loading");
    try {
      const res = await fetch("/apply", { method: "POST", body });
      if (res.ok) {
        pushEvent("upload_cv", { jobId: trackId });
        pushEvent("submit_application", { jobId: trackId });
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div role="status" className="rounded-[var(--radius)] border border-border bg-surface p-6">
        <p className="font-semibold text-accent">Candidature envoyée — merci !</p>
        <p className="mt-1 text-sm text-muted">Votre profil rejoint notre vivier. Un consultant vous recontacte si votre profil correspond.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} onFocus={() => trackOnce(`apply_start:${trackId}`, "start_application", { jobId: trackId })} className="grid gap-3" noValidate>
      <input type="text" name="company_url" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      {jobTitle ? <p className="text-sm text-muted">Postuler à : <strong>{jobTitle}</strong></p> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="firstName" required placeholder="Prénom *" className="rounded-[var(--radius)] border border-border bg-background px-3 py-2 text-sm" />
        <input name="lastName" required placeholder="Nom *" className="rounded-[var(--radius)] border border-border bg-background px-3 py-2 text-sm" />
        <input name="email" type="email" required placeholder="Email *" className="rounded-[var(--radius)] border border-border bg-background px-3 py-2 text-sm" />
        <input name="phone" required placeholder="Téléphone *" className="rounded-[var(--radius)] border border-border bg-background px-3 py-2 text-sm" />
      </div>
      <input name="currentPosition" placeholder="Poste actuel" className="rounded-[var(--radius)] border border-border bg-background px-3 py-2 text-sm" />
      <label className="text-sm">CV (PDF ou DOCX) *<input name="cv" type="file" required accept=".pdf,.docx" className="mt-1 block w-full text-sm" /></label>
      <label className="flex items-start gap-2 text-sm text-muted">
        <input name="consent" type="checkbox" required className="mt-1" />
        <span>J&apos;accepte que Maximerit traite mes données pour cette candidature et son vivier de talents.</span>
      </label>
      {status === "error" && <p role="alert" className="text-sm text-brand">Vérifiez vos informations (consentement, email, CV PDF/DOCX ≤ 5 Mo) et réessayez.</p>}
      <Button type="submit" disabled={status === "loading"}>{status === "loading" ? "Envoi…" : "Envoyer ma candidature"}</Button>
    </form>
  );
}

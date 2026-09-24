"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { pushEvent, trackOnce } from "@/lib/analytics";

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

const LEAD_COPY = {
  fr: {
    successTitle: "Merci — votre demande est bien reçue.",
    successBody: "Un consultant Maximerit vous recontacte rapidement.",
    contactName: "Nom *", email: "Email professionnel *", company: "Société", phone: "Téléphone",
    profileSought: "Profil recherché", comment: "Votre besoin",
    error: "Une erreur est survenue. Vérifiez vos informations et réessayez.",
    sending: "Envoi…", cta: "Confier un recrutement",
  },
  en: {
    successTitle: "Thank you — your request has been received.",
    successBody: "A Maximerit consultant will get back to you shortly.",
    contactName: "Name *", email: "Work email *", company: "Company", phone: "Phone",
    profileSought: "Profile sought", comment: "Your need",
    error: "Something went wrong. Check your details and try again.",
    sending: "Sending…", cta: "Send",
  },
} as const;

export function LeadForm({
  source,
  landingPageId,
  lang = "fr",
  ctaLabel,
}: {
  source: string;
  landingPageId?: number;
  lang?: "fr" | "en";
  ctaLabel?: string;
}) {
  const t = LEAD_COPY[lang];
  const cta = ctaLabel ?? t.cta;
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
      if (res.ok) {
        pushEvent("submit_lead_form", { source });
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
        <p className="font-semibold text-accent">{t.successTitle}</p>
        <p className="mt-1 text-sm text-muted">{t.successBody}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} onFocus={() => trackOnce(`lead_start:${source}`, "start_lead_form", { source })} className="grid gap-3" noValidate>
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
        <input name="contactName" required placeholder={t.contactName} className="rounded-[var(--radius)] border border-border bg-background px-3 py-2 text-sm" />
        <input name="email" type="email" required placeholder={t.email} className="rounded-[var(--radius)] border border-border bg-background px-3 py-2 text-sm" />
        <input name="company" placeholder={t.company} className="rounded-[var(--radius)] border border-border bg-background px-3 py-2 text-sm" />
        <input name="phone" placeholder={t.phone} className="rounded-[var(--radius)] border border-border bg-background px-3 py-2 text-sm" />
        <input name="profileSought" placeholder={t.profileSought} className="rounded-[var(--radius)] border border-border bg-background px-3 py-2 text-sm sm:col-span-2" />
      </div>
      <textarea name="comment" placeholder={t.comment} rows={3} className="rounded-[var(--radius)] border border-border bg-background px-3 py-2 text-sm" />
      {status === "error" && (
        <p role="alert" className="text-sm text-brand">{t.error}</p>
      )}
      <Button type="submit" disabled={status === "loading"}>
        {status === "loading" ? t.sending : cta}
      </Button>
    </form>
  );
}

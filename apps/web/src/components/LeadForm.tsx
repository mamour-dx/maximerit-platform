"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Turnstile, captchaOnPage } from "@/components/Turnstile";
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
    captcha: "La vérification anti-robot n'a pas abouti. Réessayez.",
    captchaPending: "Patientez quelques secondes : la vérification anti-robot est en cours.",
    sending: "Envoi…", cta: "Confier un recrutement",
  },
  en: {
    successTitle: "Thank you — your request has been received.",
    successBody: "A Maximerit consultant will get back to you shortly.",
    contactName: "Name *", email: "Work email *", company: "Company", phone: "Phone",
    profileSought: "Profile sought", comment: "Your need",
    error: "Something went wrong. Check your details and try again.",
    captcha: "The anti-bot check did not complete. Please try again.",
    captchaPending: "Please wait a few seconds: the anti-bot check is in progress.",
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
  const [message, setMessage] = useState<string>(t.error);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaKey, setCaptchaKey] = useState(0); // remonte le widget → nouveau jeton après chaque tentative

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (captchaOnPage && !captchaToken) {
      setMessage(t.captchaPending);
      setStatus("error");
      return;
    }
    setStatus("loading");
    const body = {
      contactName: fd.get("contactName"),
      email: fd.get("email"),
      company: fd.get("company"),
      phone: fd.get("phone"),
      profileSought: fd.get("profileSought"),
      comment: fd.get("comment"),
      company_url: fd.get("company_url"), // honeypot
      captchaToken,
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
        setMessage(res.status === 403 ? t.captcha : t.error);
        setStatus("error");
      }
    } catch {
      setMessage(t.error);
      setStatus("error");
    } finally {
      setCaptchaToken(null);
      setCaptchaKey((k) => k + 1);
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
        <input name="contactName" required placeholder={t.contactName} className="field" />
        <input name="email" type="email" required placeholder={t.email} className="field" />
        <input name="company" placeholder={t.company} className="field" />
        <input name="phone" placeholder={t.phone} className="field" />
        <input name="profileSought" placeholder={t.profileSought} className="field sm:col-span-2" />
      </div>
      <textarea name="comment" placeholder={t.comment} rows={3} className="field" />
      <Turnstile key={captchaKey} lang={lang} action="lead" onToken={setCaptchaToken} />
      {status === "error" && (
        <p role="alert" className="text-sm text-brand">{message}</p>
      )}
      <Button type="submit" disabled={status === "loading"} className="mt-1 py-3">
        {status === "loading" ? t.sending : cta}
      </Button>
    </form>
  );
}

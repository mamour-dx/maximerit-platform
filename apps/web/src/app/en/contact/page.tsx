import type { Metadata } from "next";
import { LeadForm } from "@/components/LeadForm";
import { hreflang } from "@/lib/i18n";
import { SetLang } from "@/components/site/SetLang";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Maximerit — recruitment, executive search and staffing in West Africa.",
  alternates: { canonical: "/en/contact/", languages: hreflang("/contact/", "/en/contact/") },
};

const CARDS = [
  { label: "Phone", value: "+221 33 824 46 06", href: "tel:+221338244606" },
  { label: "Email", value: "contact@maximerit.com", href: "mailto:contact@maximerit.com" },
  { label: "Address", value: "Sacré Cœur 3 Pyrotechnie, lot 115 — Dakar" },
];

export default function ContactEn() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-16">
      <SetLang lang="en" />
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">Contact</p>
      <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">Let&apos;s talk about your need</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">A specialist consultant will get back to you quickly — recruitment, executive search or staffing.</p>
      <div className="mt-12 grid gap-10 md:grid-cols-2">
        <div className="grid gap-4">
          {CARDS.map((c) => (
            <div key={c.label} className="rounded-[var(--radius)] border border-border p-5">
              <div className="text-xs font-semibold uppercase tracking-wide text-brand">{c.label}</div>
              {c.href ? <a href={c.href} className="mt-1 block text-lg font-medium hover:text-brand">{c.value}</a> : <div className="mt-1 text-lg font-medium">{c.value}</div>}
            </div>
          ))}
        </div>
        <div className="rounded-[var(--radius)] border border-border p-6">
          <h2 className="font-display text-2xl font-bold">Hire with us</h2>
          <p className="mt-1 mb-5 text-sm text-muted">Describe your need and we&apos;ll come back within 48h.</p>
          <LeadForm source="contact-en" lang="en" ctaLabel="Send" />
        </div>
      </div>
    </main>
  );
}

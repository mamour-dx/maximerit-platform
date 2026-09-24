import type { Metadata } from "next";
import { LeadForm } from "@/components/LeadForm";
import { hreflang } from "@/lib/i18n";
import { LocationMap } from "@/components/site/LocationMap";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contactez Maximerit — recrutement, executive search et mise à disposition en Afrique de l'Ouest.",
  alternates: { canonical: "/contact/", languages: hreflang("/contact/", "/en/contact/") },
};

const CARDS = [
  { label: "Téléphone", value: "+221 33 824 46 06", href: "tel:+221338244606" },
  { label: "Email", value: "contact@maximerit.com", href: "mailto:contact@maximerit.com" },
  { label: "Adresse", value: "Sacré Cœur 3 Pyrotechnie, lot 115 — Dakar" },
];

export default function ContactPage() {
  return (
    <main>
      <div className="mx-auto w-full max-w-6xl px-6 py-16">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">Contact</p>
        <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">Parlons de votre besoin</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted">
          Un consultant spécialisé vous répond rapidement — recrutement, executive search, intérim ou mise à disposition.
        </p>

        <div className="mt-12 grid gap-10 md:grid-cols-2">
          <div className="grid gap-4">
            {CARDS.map((c) => (
              <div key={c.label} className="rounded-[var(--radius)] border border-border p-5">
                <div className="text-xs font-semibold uppercase tracking-wide text-brand">{c.label}</div>
                {c.href ? (
                  <a href={c.href} className="mt-1 block text-lg font-medium hover:text-brand">{c.value}</a>
                ) : (
                  <div className="mt-1 text-lg font-medium">{c.value}</div>
                )}
              </div>
            ))}
          </div>
          <div className="rounded-[var(--radius)] border border-border p-6">
            <h2 className="font-display text-2xl font-bold">Confier un recrutement</h2>
            <p className="mt-1 mb-5 text-sm text-muted">Décrivez votre besoin, nous revenons vers vous sous 48 h.</p>
            <LeadForm source="contact" />
          </div>
        </div>
      </div>

      <LocationMap lang="fr" />
    </main>
  );
}

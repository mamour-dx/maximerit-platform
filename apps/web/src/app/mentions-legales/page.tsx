import type { Metadata } from "next";
import { hreflang } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales du site Maximerit.",
  alternates: { canonical: "/mentions-legales/", languages: hreflang("/mentions-legales/", "/en/mentions-legales/") },
  robots: { index: false },
};

export default function MentionsLegales() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <h1 className="font-display text-4xl font-bold">Mentions légales</h1>
      <div className="mt-8 space-y-4 text-muted">
        <p><strong className="text-foreground">Éditeur.</strong> Maximerit — Conseil, Formation, Recrutement. Sacré Cœur 3 Pyrotechnie, lot 115, Dakar, Sénégal.</p>
        <p><strong className="text-foreground">Contact.</strong> +221 33 824 46 06 — contact@maximerit.com.</p>
        <p><strong className="text-foreground">Hébergement.</strong> À compléter (fournisseur d&apos;hébergement de production).</p>
        <p><strong className="text-foreground">Propriété intellectuelle.</strong> L&apos;ensemble des contenus du site est la propriété de Maximerit, sauf mention contraire.</p>
        <p className="text-xs">Document à faire valider juridiquement avant mise en production.</p>
      </div>
    </main>
  );
}

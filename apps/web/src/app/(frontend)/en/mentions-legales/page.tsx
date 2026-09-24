import type { Metadata } from "next";
import { hreflang } from "@/lib/i18n";
import { SetLang } from "@/components/site/SetLang";

export const metadata: Metadata = {
  title: "Legal notice",
  description: "Legal notice for the Maximerit website.",
  alternates: { canonical: "/en/mentions-legales/", languages: hreflang("/mentions-legales/", "/en/mentions-legales/") },
  robots: { index: false },
};

export default function MentionsLegalesEn() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <SetLang lang="en" />
      <h1 className="font-display text-4xl font-bold">Legal notice</h1>
      <div className="mt-8 space-y-4 text-muted">
        <p><strong className="text-foreground">Publisher.</strong> Maximerit — Advisory, Training, Recruitment. Sacré Cœur 3 Pyrotechnie, lot 115, Dakar, Senegal.</p>
        <p><strong className="text-foreground">Contact.</strong> +221 33 824 46 06 — contact@maximerit.com.</p>
        <p><strong className="text-foreground">Hosting.</strong> To be completed (production hosting provider).</p>
        <p><strong className="text-foreground">Intellectual property.</strong> All site content is the property of Maximerit unless otherwise stated.</p>
        <p className="text-xs">Document to be legally reviewed before going live.</p>
      </div>
    </main>
  );
}

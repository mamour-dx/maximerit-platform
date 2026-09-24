import Link from "next/link";
import type { Metadata } from "next";
import { mining } from "@maximerit/domain";
import { disciplineSeg } from "@/lib/mining-nav";
import { hreflang } from "@/lib/i18n";
import { SetLang } from "@/components/site/SetLang";

export const metadata: Metadata = {
  title: "Mining roles",
  description: "All mining roles recruited by Maximerit in West Africa: geology, operations, finance, leadership.",
  alternates: { canonical: "/en/mines/metiers/", languages: hreflang("/mines/metiers/", "/en/mines/metiers/") },
};

export default function MetiersEn() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-16">
      <SetLang lang="en" />
      <nav aria-label="Breadcrumb" className="text-sm text-muted"><Link href="/en/mines/">Mining &amp; Resources</Link> <span aria-hidden>›</span> <span>Roles</span></nav>
      <h1 className="mt-3 font-display text-4xl font-bold">Mining roles</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">The skills that keep mining operations running, by pillar.</p>
      <div className="mt-10 space-y-10">
        {mining.disciplines.map((d) => (
          <section key={d.slug}>
            <h2 className="text-xl font-semibold"><Link href={`/en/mines/${disciplineSeg(d.url)}/`} className="hover:text-brand">{d.label_en}</Link></h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {d.specialties.map((s) => (
                <Link key={s.slug} href={`/en/mines/metiers/${s.slug}/`} className="rounded-[var(--radius)] border border-border p-4 text-sm transition hover:border-brand">
                  <span className="font-semibold">{s.label_en}</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}

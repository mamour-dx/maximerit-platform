import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPayload } from "payload";
import config from "@payload-config";
import { LeadForm } from "@/components/LeadForm";
import { hreflang } from "@/lib/i18n";

export const dynamic = "force-dynamic";

const TYPES: Record<string, string> = { guides: "Guides", etudes: "Études", barometres: "Baromètres" };
type Args = { params: Promise<{ type: string; slug: string }> };
type Resource = { id: number; type?: string; slug?: string; title?: string; description?: string; content?: string; gated?: boolean; seoTitle?: string; seoDescription?: string };

async function getResource(type: string, slug: string): Promise<Resource | null> {
  const payload = await getPayload({ config });
  const res = await payload.find({ collection: "resources", where: { and: [{ type: { equals: type } }, { slug: { equals: slug } }, { status: { equals: "published" } }] }, limit: 1 });
  return (res.docs[0] as Resource) ?? null;
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { type, slug } = await params;
  if (!TYPES[type]) return {};
  const r = await getResource(type, slug);
  if (!r) return {};
  return { title: r.seoTitle || r.title, description: r.seoDescription || r.description || undefined, alternates: { canonical: `/ressources/${type}/${slug}/`, languages: hreflang(`/ressources/${type}/${slug}/`, `/en/ressources/${type}/${slug}/`) } };
}

export default async function ResourceDetail({ params }: Args) {
  const { type, slug } = await params;
  if (!TYPES[type]) notFound();
  const r = await getResource(type, slug);
  if (!r) notFound();

  const paragraphs = String(r.content ?? "").split(/\n{2,}/).filter(Boolean);

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <nav aria-label="Fil d'Ariane" className="text-sm text-muted"><Link href={`/ressources/${type}/`}>{TYPES[type]}</Link> <span aria-hidden>›</span> <span>{r.title}</span></nav>
      <h1 className="mt-3 text-4xl font-bold">{r.title}</h1>
      {r.description ? <p className="mt-3 text-lg text-muted">{r.description}</p> : null}

      {r.gated ? (
        <section className="mt-10 rounded-[var(--radius)] border border-border p-6">
          <h2 className="text-2xl font-bold">Recevoir ce contenu</h2>
          <p className="mt-1 mb-5 text-sm text-muted">Accédez à « {r.title} » — nous vous l&apos;envoyons par email.</p>
          <LeadForm source={`resource:${slug}`} ctaLabel="Recevoir le contenu" />
        </section>
      ) : (
        <div className="mt-6 space-y-4">{paragraphs.map((p, i) => <p key={i}>{p}</p>)}</div>
      )}
    </main>
  );
}

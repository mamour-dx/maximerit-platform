import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPayload } from "payload";
import config from "@payload-config";
import { EmptyState } from "@/components/ui/states";
import { hreflang } from "@/lib/i18n";

export const dynamic = "force-dynamic";

const TYPES: Record<string, string> = { guides: "Guides", etudes: "Études", barometres: "Baromètres" };
type Args = { params: Promise<{ type: string }> };
type Resource = { id: number; slug?: string; title?: string; description?: string; gated?: boolean };

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { type } = await params;
  if (!TYPES[type]) return {};
  return { title: TYPES[type], alternates: { canonical: `/ressources/${type}/`, languages: hreflang(`/ressources/${type}/`, `/en/ressources/${type}/`) } };
}

export default async function ResourceListing({ params }: Args) {
  const { type } = await params;
  if (!TYPES[type]) notFound();
  const payload = await getPayload({ config });
  const res = await payload.find({ collection: "resources", where: { and: [{ type: { equals: type } }, { status: { equals: "published" } }] }, limit: 50, depth: 0, sort: "-publishedAt" });
  const items = res.docs as Resource[];

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-16">
      <h1 className="text-4xl font-bold">{TYPES[type]}</h1>
      {items.length === 0 ? (
        <div className="mt-10"><EmptyState title={`Aucun contenu « ${TYPES[type]} » publié pour le moment`} /></div>
      ) : (
        <ul className="mt-10 divide-y divide-border">
          {items.map((r) => (
            <li key={r.id} className="py-4">
              <Link href={`/ressources/${type}/${r.slug}/`} className="text-xl font-semibold hover:text-brand">{r.title}</Link>
              {r.gated ? <span className="ml-2 rounded-full bg-surface px-2 py-0.5 text-xs text-muted">sur demande</span> : null}
              {r.description ? <p className="mt-1 text-sm text-muted">{r.description}</p> : null}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

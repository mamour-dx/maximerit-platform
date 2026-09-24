import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPayload } from "payload";
import config from "@payload-config";
import { EmptyState } from "@/components/ui/states";
import { hreflang } from "@/lib/i18n";
import { SetLang } from "@/components/site/SetLang";

export const dynamic = "force-dynamic";

const TYPES: Record<string, string> = { guides: "Guides", etudes: "Studies", barometres: "Barometers" };
type Args = { params: Promise<{ type: string }> };
type Resource = { id: number; slug?: string; title?: string; description?: string; gated?: boolean };

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { type } = await params;
  if (!TYPES[type]) return {};
  return { title: TYPES[type], alternates: { canonical: `/en/ressources/${type}/`, languages: hreflang(`/ressources/${type}/`, `/en/ressources/${type}/`) } };
}

export default async function ResourceListingEn({ params }: Args) {
  const { type } = await params;
  if (!TYPES[type]) notFound();
  const payload = await getPayload({ config });
  const res = await payload.find({ collection: "resources", where: { and: [{ type: { equals: type } }, { status: { equals: "published" } }] }, limit: 50, depth: 0, sort: "-publishedAt", locale: "en" });
  const items = res.docs as Resource[];

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-16">
      <SetLang lang="en" />
      <h1 className="text-4xl font-bold">{TYPES[type]}</h1>
      {items.length === 0 ? (
        <div className="mt-10"><EmptyState title={`No “${TYPES[type]}” content published yet`} /></div>
      ) : (
        <ul className="mt-10 divide-y divide-border">
          {items.map((r) => (
            <li key={r.id} className="py-4">
              <Link href={`/en/ressources/${type}/${r.slug}/`} className="text-xl font-semibold hover:text-brand">{r.title}</Link>
              {r.gated ? <span className="ml-2 rounded-full bg-surface px-2 py-0.5 text-xs text-muted">on request</span> : null}
              {r.description ? <p className="mt-1 text-sm text-muted">{r.description}</p> : null}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

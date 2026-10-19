import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPayload } from "payload";
import config from "@payload-config";
import { safeRead } from "@/lib/db-safe";
import { hreflang } from "@/lib/i18n";
import { ResourcePage, type ResourceType } from "@/components/views/resources";

export const dynamic = "force-dynamic";

const TYPES: Record<string, string> = { guides: "Guides", etudes: "Études", barometres: "Baromètres" };
type Args = { params: Promise<{ type: string; slug: string }> };
type Resource = { id: number; type?: string; slug?: string; title?: string; description?: string; content?: string; gated?: boolean; seoTitle?: string; seoDescription?: string };

async function getResource(type: string, slug: string): Promise<Resource | null> {
  return safeRead("resource", async () => {
    const payload = await getPayload({ config });
    const res = await payload.find({ collection: "resources", where: { and: [{ type: { equals: type } }, { slug: { equals: slug } }, { status: { equals: "published" } }] }, limit: 1 });
    return (res.docs[0] as Resource) ?? null;
  }, null);
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
  return <ResourcePage lang="fr" type={type as ResourceType} resource={r} slug={slug} />;
}

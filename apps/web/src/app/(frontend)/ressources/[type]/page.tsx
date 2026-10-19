import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPayload } from "payload";
import config from "@payload-config";
import { safeRead } from "@/lib/db-safe";
import { hreflang } from "@/lib/i18n";
import { ResourceListPage, type ResourceCard, type ResourceType } from "@/components/views/resources";

export const dynamic = "force-dynamic";

const TYPES: Record<string, string> = { guides: "Guides", etudes: "Études", barometres: "Baromètres" };
type Args = { params: Promise<{ type: string }> };

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { type } = await params;
  if (!TYPES[type]) return {};
  return { title: TYPES[type], alternates: { canonical: `/ressources/${type}/`, languages: hreflang(`/ressources/${type}/`, `/en/ressources/${type}/`) } };
}

export default async function ResourceListing({ params }: Args) {
  const { type } = await params;
  if (!TYPES[type]) notFound();
  const items = await safeRead("resources", async () => {
    const payload = await getPayload({ config });
    const res = await payload.find({ collection: "resources", where: { and: [{ type: { equals: type } }, { status: { equals: "published" } }] }, limit: 50, depth: 0, sort: "-publishedAt" });
    return res.docs as ResourceCard[];
  }, []);
  return <ResourceListPage lang="fr" type={type as ResourceType} items={items} />;
}

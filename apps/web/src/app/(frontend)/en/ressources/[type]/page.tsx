import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPayload } from "payload";
import config from "@payload-config";
import { hreflang } from "@/lib/i18n";
import { ResourceListPage, type ResourceCard, type ResourceType } from "@/components/views/resources";

export const dynamic = "force-dynamic";

const TYPES: Record<string, string> = { guides: "Guides", etudes: "Studies", barometres: "Barometers" };
type Args = { params: Promise<{ type: string }> };

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
  return <ResourceListPage lang="en" type={type as ResourceType} items={res.docs as ResourceCard[]} />;
}

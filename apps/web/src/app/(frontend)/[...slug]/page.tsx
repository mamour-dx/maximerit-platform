import { notFound } from "next/navigation";
import { draftMode } from "next/headers";
import type { Metadata } from "next";
import { getPayload, type Where } from "payload";
import config from "@payload-config";
import { Page, PageHero, Prose, Section } from "@/components/site/PageKit";

export const dynamic = "force-dynamic";

type Args = { params: Promise<{ slug: string[] }> };

async function getPage(slug: string, preview: boolean) {
  const payload = await getPayload({ config });
  const conditions: Where[] = [{ slug: { equals: slug } }];
  if (!preview) conditions.push({ status: { equals: "published" } });
  const res = await payload.find({ collection: "pages", where: { and: conditions }, limit: 1 });
  return res.docs[0] ?? null;
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params;
  const path = `/${slug.join("/")}/`;
  const { isEnabled } = await draftMode();
  const page = await getPage(slug.join("/"), isEnabled);
  if (!page) return {};
  return {
    title: (page.seoTitle as string) || (page.title as string),
    description: (page.seoDescription as string) || undefined,
    alternates: { canonical: path },
    robots: page.status === "published" ? undefined : { index: false, follow: false },
  };
}

export default async function CmsPage({ params }: Args) {
  const { slug } = await params;
  const { isEnabled } = await draftMode();
  const page = await getPage(slug.join("/"), isEnabled);
  if (!page) notFound();

  return (
    <Page lang="fr">
      <PageHero
        lang="fr"
        title={page.title as string}
        compact
        eyebrow={isEnabled && page.status !== "published" ? "Aperçu — brouillon" : undefined}
      />
      <Section narrow>
        <Prose text={page.content as string} />
      </Section>
    </Page>
  );
}

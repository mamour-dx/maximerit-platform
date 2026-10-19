import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPayload } from "payload";
import config from "@payload-config";
import { safeRead } from "@/lib/db-safe";
import { hreflang } from "@/lib/i18n";
import { LandingPage, type LandingDoc } from "@/components/views/resources";

export const dynamic = "force-dynamic";

type Args = { params: Promise<{ slug: string }> };

async function getLandingPage(slug: string) {
  return safeRead("landing-page", async () => {
    const payload = await getPayload({ config });
    const res = await payload.find({
      collection: "landing-pages",
      where: { and: [{ slug: { equals: slug } }, { status: { equals: "published" } }] },
      limit: 1,
    });
    return res.docs[0] ?? null;
  }, null);
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params;
  const lp = await getLandingPage(slug);
  if (!lp) return {};
  return {
    title: (lp.seoTitle as string) || (lp.title as string),
    description: (lp.seoDescription as string) || (lp.promise as string) || undefined,
    robots: lp.indexable ? undefined : { index: false, follow: false },
    alternates: { canonical: `/lp/${slug}/`, languages: hreflang(`/lp/${slug}/`, `/en/lp/${slug}/`) },
  };
}

export default async function LandingPageView({ params }: Args) {
  const { slug } = await params;
  const lp = await getLandingPage(slug);
  if (!lp) notFound();
  return <LandingPage lang="fr" lp={lp as unknown as LandingDoc} slug={slug} />;
}

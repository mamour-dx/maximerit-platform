import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPayload } from "payload";
import config from "@payload-config";
import { safeRead } from "@/lib/db-safe";
import { hreflang } from "@/lib/i18n";
import { ArticlePage } from "@/components/views/resources";

export const dynamic = "force-dynamic";

type Args = { params: Promise<{ slug: string }> };
type Article = { id: number; slug?: string; title?: string; excerpt?: string; content?: string; seoTitle?: string; seoDescription?: string; related?: { slug?: string; title?: string }[] };

async function getArticle(slug: string): Promise<Article | null> {
  return safeRead("article", async () => {
    const payload = await getPayload({ config });
    const res = await payload.find({ collection: "articles", where: { and: [{ slug: { equals: slug } }, { status: { equals: "published" } }] }, limit: 1, depth: 1, locale: "en" });
    return (res.docs[0] as Article) ?? null;
  }, null);
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params;
  const a = await getArticle(slug);
  if (!a) return {};
  return {
    title: a.seoTitle || a.title,
    description: a.seoDescription || a.excerpt || undefined,
    alternates: { canonical: `/en/ressources/blog/${slug}/`, languages: hreflang(`/ressources/blog/${slug}/`, `/en/ressources/blog/${slug}/`) },
  };
}

export default async function ArticleDetailEn({ params }: Args) {
  const { slug } = await params;
  const a = await getArticle(slug);
  if (!a) notFound();
  return <ArticlePage lang="en" article={a} />;
}

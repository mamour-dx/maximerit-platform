import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPayload } from "payload";
import config from "@payload-config";
import { hreflang } from "@/lib/i18n";
import { SetLang } from "@/components/site/SetLang";

export const dynamic = "force-dynamic";

type Args = { params: Promise<{ slug: string }> };
type Article = { id: number; slug?: string; title?: string; excerpt?: string; content?: string; seoTitle?: string; seoDescription?: string; related?: { slug?: string; title?: string }[] };

async function getArticle(slug: string): Promise<Article | null> {
  const payload = await getPayload({ config });
  const res = await payload.find({ collection: "articles", where: { and: [{ slug: { equals: slug } }, { status: { equals: "published" } }] }, limit: 1, depth: 1, locale: "en" });
  return (res.docs[0] as Article) ?? null;
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
  const paragraphs = String(a.content ?? "").split(/\n{2,}/).filter(Boolean);
  const related = (a.related ?? []).filter((r) => r && typeof r === "object" && r.slug);

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <SetLang lang="en" />
      <nav aria-label="Breadcrumb" className="text-sm text-muted"><Link href="/en/ressources/blog/">Blog</Link> <span aria-hidden>›</span> <span>{a.title}</span></nav>
      <h1 className="mt-3 text-4xl font-bold">{a.title}</h1>
      {a.excerpt ? <p className="mt-3 text-lg text-muted">{a.excerpt}</p> : null}
      <div className="mt-6 space-y-4">{paragraphs.map((p, i) => <p key={i}>{p}</p>)}</div>
      {related.length > 0 ? (
        <aside className="mt-12 border-t border-border pt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Related reading</h2>
          <ul className="mt-2">{related.map((r) => <li key={r.slug}><Link href={`/en/ressources/blog/${r.slug}/`} className="hover:text-brand">{r.title}</Link></li>)}</ul>
        </aside>
      ) : null}
    </main>
  );
}

import Link from "next/link";
import type { Metadata } from "next";
import { getPayload } from "payload";
import config from "@payload-config";
import { EmptyState } from "@/components/ui/states";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog",
  description: "Analyses et guides Maximerit : recrutement, compétences et marché de l'emploi en Afrique de l'Ouest.",
  alternates: { canonical: "/ressources/blog/" },
};

type Article = { id: number; slug?: string; title?: string; excerpt?: string; category?: string };

export default async function Blog() {
  const payload = await getPayload({ config });
  const res = await payload.find({ collection: "articles", where: { status: { equals: "published" } }, limit: 50, sort: "-publishedAt" });
  const articles = res.docs as Article[];

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-16">
      <h1 className="text-4xl font-bold">Blog</h1>
      <p className="mt-3 text-lg text-muted">Recrutement, compétences et marché de l&apos;emploi en Afrique de l&apos;Ouest.</p>
      {articles.length === 0 ? (
        <div className="mt-10"><EmptyState title="Aucun article publié pour le moment" /></div>
      ) : (
        <ul className="mt-10 divide-y divide-border">
          {articles.map((a) => (
            <li key={a.id} className="py-4">
              {a.category ? <span className="text-xs font-semibold uppercase tracking-wide text-brand">{a.category}</span> : null}
              <Link href={`/ressources/blog/${a.slug}/`} className="block text-xl font-semibold hover:text-brand">{a.title}</Link>
              {a.excerpt ? <p className="mt-1 text-sm text-muted">{a.excerpt}</p> : null}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

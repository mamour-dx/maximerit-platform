import type { Metadata } from "next";
import { getPayload } from "payload";
import config from "@payload-config";
import { safeRead } from "@/lib/db-safe";
import { hreflang } from "@/lib/i18n";
import { BlogListPage, type ArticleCard } from "@/components/views/resources";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog",
  description: "Analyses et guides Maximerit : recrutement, compétences et marché de l'emploi en Afrique de l'Ouest.",
  alternates: { canonical: "/ressources/blog/", languages: hreflang("/ressources/blog/", "/en/ressources/blog/") },
};


export default async function Blog() {
  const articles = await safeRead("articles", async () => {
    const payload = await getPayload({ config });
    const res = await payload.find({ collection: "articles", where: { status: { equals: "published" } }, limit: 50, depth: 0, sort: "-publishedAt" });
    return res.docs as ArticleCard[];
  }, []);
  return <BlogListPage lang="fr" articles={articles} />;
}

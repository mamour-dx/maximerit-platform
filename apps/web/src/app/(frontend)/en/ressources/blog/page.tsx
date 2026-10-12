import type { Metadata } from "next";
import { getPayload } from "payload";
import config from "@payload-config";
import { hreflang } from "@/lib/i18n";
import { BlogListPage, type ArticleCard } from "@/components/views/resources";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog",
  description: "Maximerit analysis and guides: recruitment, skills and the job market in West Africa.",
  alternates: { canonical: "/en/ressources/blog/", languages: hreflang("/ressources/blog/", "/en/ressources/blog/") },
};


export default async function BlogEn() {
  const payload = await getPayload({ config });
  const res = await payload.find({ collection: "articles", where: { status: { equals: "published" } }, limit: 50, depth: 0, sort: "-publishedAt", locale: "en" });
  return <BlogListPage lang="en" articles={res.docs as ArticleCard[]} />;
}

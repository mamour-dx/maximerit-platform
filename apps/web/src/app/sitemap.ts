import type { MetadataRoute } from "next";
import { getPayload } from "payload";
import config from "@payload-config";
import { buildSitemap, STATIC_INDEXABLE, type SitemapInput } from "@/lib/seo";
import { isLive, type JobLike } from "@/lib/job";

export const dynamic = "force-dynamic";

type Doc = { slug?: string; type?: string; updatedAt?: string; publishedAt?: string | null };

// /sitemap.xml — pages statiques indexables + contenus CMS publiés (Pages, Articles, Ressources, Offres actives).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config });
  const pub = { status: { equals: "published" } };
  const [pages, articles, resources, jobs] = await Promise.all([
    payload.find({ collection: "pages", where: pub, limit: 1000, depth: 0 }),
    payload.find({ collection: "articles", where: pub, limit: 1000, depth: 0 }),
    payload.find({ collection: "resources", where: pub, limit: 1000, depth: 0 }),
    payload.find({ collection: "jobs", where: { status: { equals: "publiee" } }, limit: 1000, depth: 0 }),
  ]);

  const entries: SitemapInput[] = [
    ...STATIC_INDEXABLE.map((path) => ({ path })),
    ...(pages.docs as Doc[]).map((d) => ({ path: `/${d.slug}/`, lastmod: d.updatedAt })),
    ...(articles.docs as Doc[]).map((d) => ({ path: `/ressources/blog/${d.slug}/`, lastmod: d.updatedAt })),
    ...(articles.docs as Doc[]).map((d) => ({ path: `/en/ressources/blog/${d.slug}/`, lastmod: d.updatedAt })),
    ...(resources.docs as Doc[]).map((d) => ({ path: `/ressources/${d.type}/${d.slug}/`, lastmod: d.updatedAt })),
    ...(resources.docs as Doc[]).map((d) => ({ path: `/en/ressources/${d.type}/${d.slug}/`, lastmod: d.updatedAt })),
    ...(jobs.docs as (Doc & JobLike)[]).filter((j) => isLive(j)).map((d) => ({ path: `/jobs/${d.slug}/`, lastmod: d.publishedAt ?? d.updatedAt })),
  ];
  return buildSitemap(entries);
}

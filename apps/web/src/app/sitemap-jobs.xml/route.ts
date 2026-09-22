import { getPayload } from "payload";
import config from "@payload-config";
import { isLive, type JobLike } from "@/lib/job";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.maximerit.com";

// Sitemap dédié aux offres (cahier §28) : uniquement les offres actives (publiées, non expirées).
export async function GET(): Promise<Response> {
  const payload = await getPayload({ config });
  const res = await payload.find({ collection: "jobs", where: { status: { equals: "publiee" } }, limit: 1000, depth: 0 });
  const jobs = (res.docs as JobLike[]).filter((j) => isLive(j));

  const urls = jobs
    .map((j) => `  <url><loc>${SITE}/jobs/${j.slug}/</loc>${j.publishedAt ? `<lastmod>${new Date(j.publishedAt).toISOString()}</lastmod>` : ""}</url>`)
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;

  return new Response(xml, { headers: { "Content-Type": "application/xml" } });
}

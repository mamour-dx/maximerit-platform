import { getPayload } from "payload";
import config from "@payload-config";
import type { BoardJob, Lang } from "@/lib/job-board";

// Accès données du job board (serveur uniquement). depth:0 : pas de jointure inutile (Phase 10).

export async function getPublishedJobs(lang: Lang): Promise<BoardJob[]> {
  const payload = await getPayload({ config });
  const res = await payload.find({
    collection: "jobs",
    where: { status: { equals: "publiee" } },
    limit: 500,
    depth: 0,
    sort: "-publishedAt",
    locale: lang,
  });
  return res.docs as BoardJob[];
}

export async function getJobBySlug(slug: string, lang: Lang): Promise<BoardJob | null> {
  const payload = await getPayload({ config });
  const res = await payload.find({ collection: "jobs", where: { slug: { equals: slug } }, limit: 1, depth: 0, locale: lang });
  return (res.docs[0] as BoardJob) ?? null;
}

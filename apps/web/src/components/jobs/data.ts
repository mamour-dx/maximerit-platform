import { getPayload } from "payload";
import config from "@payload-config";
import { safeRead } from "@/lib/db-safe";
import type { BoardJob, Lang } from "@/lib/job-board";

// Accès données du job board (serveur uniquement). depth:0 : pas de jointure inutile (Phase 10).

export async function getPublishedJobs(lang: Lang): Promise<BoardJob[]> {
  return safeRead("jobs", async () => {
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
  }, []);
}

export async function getJobBySlug(slug: string, lang: Lang): Promise<BoardJob | null> {
  return safeRead("job", async () => {
    const payload = await getPayload({ config });
    const res = await payload.find({ collection: "jobs", where: { slug: { equals: slug } }, limit: 1, depth: 0, locale: lang });
    return (res.docs[0] as BoardJob) ?? null;
  }, null);
}

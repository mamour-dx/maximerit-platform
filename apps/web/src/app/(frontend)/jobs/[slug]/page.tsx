import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isExpired, isLive } from "@/lib/job";
import { similarJobs } from "@/lib/job-board";
import { JobDetail } from "@/components/jobs/JobDetail";
import { getJobBySlug, getPublishedJobs } from "@/components/jobs/data";
import { hreflang } from "@/lib/i18n";

export const dynamic = "force-dynamic";

type Args = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJobBySlug(slug, "fr");
  if (!job) return {};
  return {
    title: job.title,
    description: (job.mission || job.title || "").slice(0, 160),
    alternates: { canonical: `/jobs/${slug}/`, languages: hreflang(`/jobs/${slug}/`, `/en/jobs/${slug}/`) },
    // Offre expirée : on laisse la page mais on la retire de l'index (Google déconseille l'indexation d'offres expirées).
    robots: isLive(job) ? undefined : { index: false, follow: true },
  };
}

export default async function JobDetailPage({ params }: Args) {
  const { slug } = await params;
  const [job, pool] = await Promise.all([getJobBySlug(slug, "fr"), getPublishedJobs("fr")]);
  if (!job || (job.status !== "publiee" && !isExpired(job))) notFound();

  return <JobDetail job={job} similar={similarJobs(job, pool)} lang="fr" />;
}

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isExpired, isLive } from "@/lib/job";
import { similarJobs } from "@/lib/job-board";
import { JobDetail } from "@/components/jobs/JobDetail";
import { getJobBySlug, getPublishedJobs } from "@/components/jobs/data";
import { hreflang } from "@/lib/i18n";
import { SetLang } from "@/components/site/SetLang";

export const dynamic = "force-dynamic";

type Args = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJobBySlug(slug, "en");
  if (!job) return {};
  return {
    title: job.title,
    description: (job.mission || job.title || "").slice(0, 160),
    alternates: { canonical: `/en/jobs/${slug}/`, languages: hreflang(`/jobs/${slug}/`, `/en/jobs/${slug}/`) },
    robots: isLive(job) ? undefined : { index: false, follow: true },
  };
}

export default async function JobDetailEn({ params }: Args) {
  const { slug } = await params;
  const [job, pool] = await Promise.all([getJobBySlug(slug, "en"), getPublishedJobs("en")]);
  if (!job || (job.status !== "publiee" && !isExpired(job))) notFound();

  return (
    <>
      <SetLang lang="en" />
      <JobDetail job={job} similar={similarJobs(job, pool)} lang="en" />
    </>
  );
}

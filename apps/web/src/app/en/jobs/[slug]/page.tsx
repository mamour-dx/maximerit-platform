import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPayload } from "payload";
import config from "@payload-config";
import { buildJobPostingJsonLd, isExpired, isLive, type JobLike } from "@/lib/job";
import { ApplyForm } from "@/components/ApplyForm";
import { TrackView } from "@/components/site/TrackView";
import { hreflang } from "@/lib/i18n";
import { SetLang } from "@/components/site/SetLang";

export const dynamic = "force-dynamic";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.maximerit.com";
type Args = { params: Promise<{ slug: string }> };

async function getJob(slug: string): Promise<JobLike | null> {
  const payload = await getPayload({ config });
  const res = await payload.find({ collection: "jobs", where: { slug: { equals: slug } }, limit: 1, locale: "en" });
  return (res.docs[0] as JobLike) ?? null;
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJob(slug);
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
  const job = await getJob(slug);
  if (!job || (job.status !== "publiee" && !isExpired(job))) notFound();

  const expired = isExpired(job);
  const jsonLd = isLive(job) ? buildJobPostingJsonLd(job, SITE) : null;

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <SetLang lang="en" />
      <TrackView event="view_job" params={{ slug }} />
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/en/candidats/offres-demploi/">Jobs</Link> <span aria-hidden>›</span> <span>{job.title}</span>
      </nav>
      <h1 className="mt-3 text-4xl font-bold">{job.title}</h1>
      <p className="mt-2 text-sm text-muted">
        {[job.location, job.country, job.contractType].filter(Boolean).join(" · ")}
      </p>

      {expired ? (
        <p className="mt-6 rounded-[var(--radius)] border border-border bg-surface p-4 text-sm">
          This opening is no longer active. Submit your CV to join our talent pool.
        </p>
      ) : null}

      {job.mission ? <section className="mt-8"><h2 className="text-xl font-semibold">Mission</h2><p className="mt-2 text-muted">{job.mission}</p></section> : null}
      {job.responsibilities ? <section className="mt-6"><h2 className="text-xl font-semibold">Responsibilities</h2><p className="mt-2 text-muted">{job.responsibilities}</p></section> : null}
      {job.requirements ? <section className="mt-6"><h2 className="text-xl font-semibold">Requirements</h2><p className="mt-2 text-muted">{job.requirements}</p></section> : null}

      {!expired ? (
        <section className="mt-12 rounded-[var(--radius)] border border-border p-6">
          <h2 className="text-2xl font-bold">Apply</h2>
          <p className="mt-1 mb-5 text-sm text-muted">CV required (PDF/DOCX). Your data joins our talent pool with your consent.</p>
          <ApplyForm jobId={job.id} jobTitle={job.title ?? "this opening"} lang="en" />
        </section>
      ) : null}
    </main>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPayload } from "payload";
import config from "@payload-config";
import { buildJobPostingJsonLd, isExpired, isLive, type JobLike } from "@/lib/job";
import { ApplyForm } from "@/components/ApplyForm";
import { TrackView } from "@/components/site/TrackView";
import { hreflang } from "@/lib/i18n";

export const dynamic = "force-dynamic";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.maximerit.com";
type Args = { params: Promise<{ slug: string }> };

async function getJob(slug: string): Promise<JobLike | null> {
  const payload = await getPayload({ config });
  const res = await payload.find({ collection: "jobs", where: { slug: { equals: slug } }, limit: 1 });
  return (res.docs[0] as JobLike) ?? null;
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJob(slug);
  if (!job) return {};
  return {
    title: job.title,
    description: (job.mission || job.title || "").slice(0, 160),
    alternates: { canonical: `/jobs/${slug}/`, languages: hreflang(`/jobs/${slug}/`, `/en/jobs/${slug}/`) },
    // Offre expirée : on laisse la page mais on la retire de l'index (Google déconseille l'indexation d'offres expirées).
    robots: isLive(job) ? undefined : { index: false, follow: true },
  };
}

export default async function JobDetail({ params }: Args) {
  const { slug } = await params;
  const job = await getJob(slug);
  if (!job || (job.status !== "publiee" && !isExpired(job))) notFound();

  const expired = isExpired(job);
  const jsonLd = isLive(job) ? buildJobPostingJsonLd(job, SITE) : null;

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <TrackView event="view_job" params={{ slug }} />
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
      <nav aria-label="Fil d'Ariane" className="text-sm text-muted">
        <Link href="/candidats/offres-demploi/">Offres</Link> <span aria-hidden>›</span> <span>{job.title}</span>
      </nav>
      <h1 className="mt-3 text-4xl font-bold">{job.title}</h1>
      <p className="mt-2 text-sm text-muted">
        {[job.location, job.country, job.contractType].filter(Boolean).join(" · ")}
      </p>

      {expired ? (
        <p className="mt-6 rounded-[var(--radius)] border border-border bg-surface p-4 text-sm">
          Cette offre n&apos;est plus active. Déposez votre CV pour rejoindre notre vivier.
        </p>
      ) : null}

      {job.mission ? <section className="mt-8"><h2 className="text-xl font-semibold">Mission</h2><p className="mt-2 text-muted">{job.mission}</p></section> : null}
      {job.responsibilities ? <section className="mt-6"><h2 className="text-xl font-semibold">Responsabilités</h2><p className="mt-2 text-muted">{job.responsibilities}</p></section> : null}
      {job.requirements ? <section className="mt-6"><h2 className="text-xl font-semibold">Profil recherché</h2><p className="mt-2 text-muted">{job.requirements}</p></section> : null}

      {!expired ? (
        <section className="mt-12 rounded-[var(--radius)] border border-border p-6">
          <h2 className="text-2xl font-bold">Postuler</h2>
          <p className="mt-1 mb-5 text-sm text-muted">CV requis (PDF/DOCX). Vos données rejoignent notre vivier avec votre consentement.</p>
          <ApplyForm jobId={job.id} jobTitle={job.title ?? "cette offre"} />
        </section>
      ) : null}
    </main>
  );
}

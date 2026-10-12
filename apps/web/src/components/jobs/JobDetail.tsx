import Link from "next/link";
import { ApplyForm } from "@/components/ApplyForm";
import { TrackView } from "@/components/site/TrackView";
import { Icon, type IconName } from "@/components/ui/Icon";
import { buildJobPostingJsonLd, isExpired, isLive } from "@/lib/job";
import { contractLabel, countryLabel, disciplineLabel, isNew, postedLabel, type BoardJob, type Lang } from "@/lib/job-board";
import { JobCard } from "./JobCard";
import { jobsCopy } from "./copy";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.maximerit.com";

function Section({ title, body }: { title: string; body?: string }) {
  if (!body) return null;
  return (
    <section className="border-t border-border pt-8 first:border-t-0 first:pt-0">
      <h2 className="font-display text-2xl font-bold">{title}</h2>
      <p className="mt-3 whitespace-pre-line leading-relaxed text-foreground/80">{body}</p>
    </section>
  );
}

/** Page offre partagée FR/EN : en-tête, contenu, fiche synthèse collante, candidature, offres similaires. */
export function JobDetail({ job, similar, lang }: { job: BoardJob; similar: BoardJob[]; lang: Lang }) {
  const t = jobsCopy(lang);
  const expired = isExpired(job);
  const jsonLd = isLive(job) ? buildJobPostingJsonLd(job, SITE) : null;
  const country = countryLabel(job.country, lang);
  const place = [job.location, country].filter(Boolean).join(", ");
  const discipline = disciplineLabel(job.discipline, lang);
  const contract = contractLabel(job.contractType, lang);
  const deadline = job.expiresAt
    ? new Intl.DateTimeFormat(t.locale, { day: "numeric", month: "long", year: "numeric" }).format(new Date(job.expiresAt))
    : "";

  const facts: [IconName, string, string][] = (
    [
      ["mapPin", t.location, place],
      ["briefcase", t.contractLabel, contract],
      ["layers", t.disciplineLabel, discipline],
      ["target", t.experience, job.experienceMin ? t.experienceValue(job.experienceMin) : ""],
      ["clock", t.deadline, expired ? "" : deadline],
    ] as [IconName, string, string][]
  ).filter(([, , v]) => v);

  return (
    <main>
      <TrackView event="view_job" params={{ slug: job.slug ?? "" }} />
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}

      <section className="hero-bg border-b border-border">
        <div className="container-page pt-10 pb-12 sm:pt-14">
          <nav aria-label={t.breadcrumb} className="flex items-center gap-2 text-sm text-muted">
            <Link href={t.listingPath} className="hover:text-brand">{t.title}</Link>
            <span aria-hidden="true">/</span>
            <span className="truncate text-foreground/70">{job.title}</span>
          </nav>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            {discipline ? <span className="chip">{discipline}</span> : null}
            {contract ? <span className="chip">{contract}</span> : null}
            {!expired && isNew(job.publishedAt) ? <span className="chip chip-brand">{t.newBadge}</span> : null}
          </div>
          <h1 className="mt-4 max-w-4xl font-display text-4xl font-bold leading-[1.1] sm:text-5xl">{job.title}</h1>
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-muted">
            {place ? <li className="inline-flex items-center gap-1.5"><Icon name="mapPin" size={18} />{place}</li> : null}
            {job.publishedAt ? <li className="inline-flex items-center gap-1.5"><Icon name="clock" size={18} />{postedLabel(job.publishedAt, lang)}</li> : null}
          </ul>
          {!expired ? (
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#postuler" className="btn btn-primary">{t.apply} <Icon name="arrowRight" size={18} /></a>
              <Link href={t.listingPath} className="btn btn-outline">{t.allJobs}</Link>
            </div>
          ) : null}
        </div>
      </section>

      <div className="container-page grid gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid content-start gap-8">
          {expired ? (
            <div role="status" className="card flex gap-4 border-brand/30 bg-brand-soft/50 p-5">
              <Icon name="clock" className="mt-0.5 shrink-0 text-brand" />
              <div>
                <p className="text-sm">{t.expired}</p>
                <Link href={t.cvPath} className="btn btn-primary btn-sm mt-3">{t.cvCta}</Link>
              </div>
            </div>
          ) : null}

          <Section title={t.mission} body={job.mission} />
          <Section title={t.responsibilities} body={job.responsibilities} />
          <Section title={t.requirements} body={job.requirements} />

          {!expired ? (
            <section id="postuler" className="card scroll-mt-24 p-6 sm:p-8">
              <span className="icon-chip"><Icon name="file" /></span>
              <h2 className="mt-4 font-display text-2xl font-bold">{t.apply}</h2>
              <p className="mt-1 mb-6 text-sm text-muted">{t.applyIntro}</p>
              <ApplyForm jobId={job.id} jobTitle={job.title ?? t.applyFallbackTitle} lang={lang} />
            </section>
          ) : null}
        </div>

        <aside className="grid content-start gap-5 lg:sticky lg:top-24 lg:self-start">
          {facts.length ? (
            <div className="card p-6">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">{t.summary}</h2>
              <dl className="mt-4 grid gap-4">
                {facts.map(([icon, label, value]) => (
                  <div key={label} className="flex items-start gap-3">
                    <span className="mt-0.5 text-brand"><Icon name={icon} size={18} /></span>
                    <div>
                      <dt className="text-xs text-muted">{label}</dt>
                      <dd className="text-sm font-medium">{value}</dd>
                    </div>
                  </div>
                ))}
              </dl>
              {!expired ? <a href="#postuler" className="btn btn-primary mt-6 w-full">{t.apply}</a> : null}
            </div>
          ) : null}
          <div className="card bg-surface p-6">
            <h2 className="font-semibold">{t.questions}</h2>
            <p className="mt-1 text-sm text-muted">{t.questionsBody}</p>
            <ul className="mt-3 grid gap-1 text-sm">
              <li><a href="tel:+221338244606" className="font-medium hover:text-brand">+221 33 824 46 06</a></li>
              <li><a href="mailto:contact@maximerit.com" className="font-medium hover:text-brand">contact@maximerit.com</a></li>
            </ul>
          </div>
        </aside>
      </div>

      {similar.length ? (
        <section className="border-t border-border bg-surface">
          <div className="container-page py-14">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="section-title">{t.similar}</h2>
              <Link href={t.listingPath} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
                {t.allJobs} <Icon name="arrowRight" size={16} />
              </Link>
            </div>
            <ul className="mt-8 grid gap-4 md:grid-cols-3">
              {similar.map((j) => (
                <li key={j.id} className="grid">
                  <JobCard job={j} lang={lang} compact />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </main>
  );
}

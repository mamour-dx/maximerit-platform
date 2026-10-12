import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { isLive } from "@/lib/job";
import {
  contractLabel,
  countryLabel,
  disciplineLabel,
  filterJobs,
  hasActiveFilters,
  jobFacets,
  type BoardJob,
  type JobFilters as Filters,
  type Lang,
} from "@/lib/job-board";
import { JobCard } from "./JobCard";
import { JobFilters } from "./JobFilters";
import { jobsCopy } from "./copy";

/** URL de la liste sans un filtre donné (pastilles « retirer »). */
function withoutFilter(base: string, filters: Filters, key: keyof Filters): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(filters) as [keyof Filters, string][]) {
    if (k !== key && v) params.set(k, v);
  }
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

export function JobBoard({ lang, jobs, filters }: { lang: Lang; jobs: BoardJob[]; filters: Filters }) {
  const t = jobsCopy(lang);
  const facets = jobFacets(jobs, lang);
  const results = filterJobs(jobs, filters, lang);
  const liveCount = jobs.filter((j) => isLive(j)).length;
  const active = hasActiveFilters(filters);

  const chips: { key: keyof Filters; label: string }[] = [
    filters.q ? { key: "q" as const, label: lang === "en" ? `“${filters.q}”` : `« ${filters.q} »` } : null,
    filters.country ? { key: "country" as const, label: countryLabel(filters.country, lang) } : null,
    filters.discipline ? { key: "discipline" as const, label: disciplineLabel(filters.discipline, lang) } : null,
    filters.contract ? { key: "contract" as const, label: contractLabel(filters.contract, lang) } : null,
  ].filter((c): c is { key: keyof Filters; label: string } => c !== null);

  return (
    <main>
      {/* En-tête */}
      <section className="hero-bg border-b border-border">
        <div className="container-page pt-14 pb-24 sm:pt-20">
          <p className="eyebrow rise-in">{t.eyebrow}</p>
          <h1 className="rise-in mt-4 max-w-3xl font-display text-4xl font-bold leading-[1.1] sm:text-5xl">{t.title}</h1>
          <p className="rise-in rise-in-delay mt-4 max-w-2xl text-lg text-muted">{t.intro}</p>
          {liveCount > 0 ? (
            <ul className="rise-in rise-in-delay mt-8 flex flex-wrap gap-x-10 gap-y-4">
              {[
                [liveCount, t.statOpen(liveCount)],
                [facets.countries.length, t.statCountries(facets.countries.length)],
              ].map(([n, label]) => (
                <li key={String(label)} className="flex items-baseline gap-2">
                  <span className="font-display text-3xl font-bold text-brand">{n}</span>
                  <span className="text-sm text-muted">{label}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>

      <div className="container-page relative z-10 -mt-14">
        <JobFilters key={JSON.stringify(filters)} lang={lang} filters={filters} facets={facets} />
      </div>

      <div className="container-page grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_300px]">
        <section aria-labelledby="results-title">
          <div className="flex flex-wrap items-center gap-3">
            <h2 id="results-title" className="text-lg font-semibold" aria-live="polite">{t.results(results.length)}</h2>
            {chips.map((c) => (
              <Link key={c.key} href={withoutFilter(t.listingPath, filters, c.key)} scroll={false} className="chip chip-brand hover:opacity-80" aria-label={`${t.removeFilter} : ${c.label}`}>
                {c.label}
                <Icon name="x" size={14} />
              </Link>
            ))}
            {active ? (
              <Link href={t.listingPath} scroll={false} className="text-sm font-medium text-muted underline-offset-4 hover:text-brand hover:underline">
                {t.reset}
              </Link>
            ) : null}
          </div>

          {results.length === 0 ? (
            <div className="card mt-6 flex flex-col items-center px-6 py-14 text-center">
              <span className="icon-chip"><Icon name="search" /></span>
              <p className="mt-4 text-lg font-semibold">{liveCount === 0 ? t.noJobsTitle : t.emptyTitle}</p>
              <p className="mt-2 max-w-md text-sm text-muted">{liveCount === 0 ? t.noJobsHint : t.emptyHint}</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link href={t.cvPath} className="btn btn-primary">{t.cvCta}</Link>
                {active ? <Link href={t.listingPath} scroll={false} className="btn btn-outline">{t.reset}</Link> : null}
              </div>
            </div>
          ) : (
            <ul className="mt-6 grid gap-4">
              {results.map((j) => (
                <li key={j.id}>
                  <JobCard job={j} lang={lang} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="grid content-start gap-5 lg:sticky lg:top-24 lg:self-start">
          <div className="card p-6">
            <span className="icon-chip"><Icon name="users" /></span>
            <h2 className="mt-4 text-lg font-semibold">{t.asideTitle}</h2>
            <p className="mt-2 text-sm text-muted">{t.asideBody}</p>
            <ul className="mt-4 grid gap-2 text-sm">
              {t.asidePoints.map((p) => (
                <li key={p} className="flex items-start gap-2">
                  <Icon name="check" size={18} className="mt-0.5 shrink-0 text-accent" />
                  {p}
                </li>
              ))}
            </ul>
            <Link href={t.cvPath} className="btn btn-primary mt-5 w-full">{t.cvCta}</Link>
            <Link href={t.poolPath} className="btn btn-outline mt-2 w-full">{t.poolCta}</Link>
          </div>
          <div className="card bg-surface p-6">
            <h2 className="font-semibold">{t.employerTitle}</h2>
            <p className="mt-1 text-sm text-muted">{t.employerBody}</p>
            <Link href={t.contactPath} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:gap-2.5 transition-all">
              {t.employerCta} <Icon name="arrowRight" size={16} />
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}

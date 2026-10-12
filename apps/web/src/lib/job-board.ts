// Phase 13 — Job board : filtres (mots-clés, pays, pôle, contrat), facettes et libellés FR/EN.
// Logique pure (testée) ; les pages chargent les offres live puis délèguent ici.

import { mining } from "@maximerit/domain";
import { isLive, type JobLike } from "@/lib/job";
import { MINING_COUNTRIES } from "@/lib/mining-countries";

export type Lang = "fr" | "en";

export interface BoardJob extends JobLike {
  discipline?: string;
  specialty?: string;
}

export interface JobFilters {
  q: string;
  country: string;
  discipline: string;
  contract: string;
}

export interface FacetOption {
  value: string;
  label: string;
  count: number;
}

export interface JobFacets {
  countries: FacetOption[];
  disciplines: FacetOption[];
  contracts: FacetOption[];
}

const CONTRACT_LABELS: Record<string, { fr: string; en: string }> = {
  cdi: { fr: "CDI", en: "Permanent" },
  cdd: { fr: "CDD", en: "Fixed-term" },
  "mission-interim": { fr: "Mission / intérim", en: "Interim assignment" },
  "consultant-freelance": { fr: "Consultant", en: "Consultant / freelance" },
  "fifo-roster": { fr: "FIFO / roster", en: "FIFO / roster" },
  stage: { fr: "Stage", en: "Internship" },
};

const one = (v: string | string[] | undefined): string => (Array.isArray(v) ? v[0] ?? "" : v ?? "").trim();

/** Lit les filtres depuis les searchParams (valeurs bornées : pas de chaîne arbitrairement longue). */
export function parseJobFilters(sp: Record<string, string | string[] | undefined>): JobFilters {
  return {
    q: one(sp.q).slice(0, 80),
    country: one(sp.country).slice(0, 40),
    discipline: one(sp.discipline).slice(0, 60),
    contract: one(sp.contract).slice(0, 40),
  };
}

export const hasActiveFilters = (f: JobFilters) => Boolean(f.q || f.country || f.discipline || f.contract);

/** Normalise pour une recherche insensible à la casse et aux accents. */
export function normalize(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export function contractLabel(value: string | undefined, lang: Lang): string {
  if (!value) return "";
  return CONTRACT_LABELS[value]?.[lang] ?? value;
}

export function countryLabel(value: string | undefined, lang: Lang): string {
  if (!value) return "";
  const c = MINING_COUNTRIES.find((m) => m.code === value.toUpperCase() || m.slug === value.toLowerCase());
  if (!c) return value;
  return lang === "en" ? c.labelEn : c.label;
}

export function disciplineLabel(value: string | undefined, lang: Lang): string {
  if (!value) return "";
  const d = mining.disciplines.find((x) => x.slug === value);
  if (!d) return value;
  return lang === "en" ? d.label_en : d.label_fr;
}

/** Une offre correspond-elle aux filtres ? Tous les mots-clés doivent apparaître (ET). */
export function matchesFilters(job: BoardJob, f: JobFilters, lang: Lang = "fr"): boolean {
  if (f.country && (job.country ?? "").toLowerCase() !== f.country.toLowerCase()) return false;
  if (f.discipline && job.discipline !== f.discipline) return false;
  if (f.contract && job.contractType !== f.contract) return false;
  if (f.q) {
    const haystack = normalize(
      [
        job.title,
        job.mission,
        job.requirements,
        job.location,
        job.specialty,
        job.sector,
        countryLabel(job.country, lang),
        disciplineLabel(job.discipline, lang),
      ]
        .filter(Boolean)
        .join(" "),
    );
    const terms = normalize(f.q).split(/\s+/).filter(Boolean);
    if (!terms.every((t) => haystack.includes(t))) return false;
  }
  return true;
}

/** Offres live filtrées, les plus récentes d'abord. */
export function filterJobs<T extends BoardJob>(jobs: T[], f: JobFilters, lang: Lang = "fr", now: Date = new Date()): T[] {
  return jobs
    .filter((j) => isLive(j, now) && matchesFilters(j, f, lang))
    .sort((a, b) => new Date(b.publishedAt ?? 0).getTime() - new Date(a.publishedAt ?? 0).getTime());
}

function facet(jobs: BoardJob[], key: (j: BoardJob) => string | undefined, label: (v: string) => string): FacetOption[] {
  const counts = new Map<string, number>();
  for (const j of jobs) {
    const v = key(j);
    if (v) counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([value, count]) => ({ value, label: label(value), count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

/** Facettes calculées sur les offres live (seules les valeurs réellement présentes sont proposées). */
export function jobFacets(jobs: BoardJob[], lang: Lang = "fr", now: Date = new Date()): JobFacets {
  const live = jobs.filter((j) => isLive(j, now));
  return {
    countries: facet(live, (j) => j.country, (v) => countryLabel(v, lang)),
    disciplines: facet(live, (j) => j.discipline, (v) => disciplineLabel(v, lang)),
    contracts: facet(live, (j) => j.contractType, (v) => contractLabel(v, lang)),
  };
}

/** Offres similaires : même pôle, puis même pays — hors offre courante, live uniquement. */
export function similarJobs<T extends BoardJob>(job: BoardJob, pool: T[], limit = 3, now: Date = new Date()): T[] {
  const score = (j: BoardJob) => (j.discipline && j.discipline === job.discipline ? 2 : 0) + (j.country && j.country === job.country ? 1 : 0);
  return pool
    .filter((j) => j.id !== job.id && isLive(j, now) && score(j) > 0)
    .sort((a, b) => score(b) - score(a) || new Date(b.publishedAt ?? 0).getTime() - new Date(a.publishedAt ?? 0).getTime())
    .slice(0, limit);
}

const DAY = 864e5;

/** « Publiée il y a 3 jours » / « Posted 3 days ago ». */
export function postedLabel(publishedAt: string | null | undefined, lang: Lang, now: Date = new Date()): string {
  if (!publishedAt) return "";
  const date = new Date(publishedAt);
  const days = Math.floor((now.getTime() - date.getTime()) / DAY);
  if (days < 1) return lang === "en" ? "Posted today" : "Publiée aujourd'hui";
  if (days === 1) return lang === "en" ? "Posted yesterday" : "Publiée hier";
  if (days < 30) return lang === "en" ? `Posted ${days} days ago` : `Publiée il y a ${days} jours`;
  const fmt = new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "fr-FR", { day: "numeric", month: "short", year: "numeric" });
  return lang === "en" ? `Posted ${fmt.format(date)}` : `Publiée le ${fmt.format(date)}`;
}

/** Nouvelle offre = publiée depuis moins de 7 jours. */
export function isNew(publishedAt: string | null | undefined, now: Date = new Date()): boolean {
  if (!publishedAt) return false;
  return now.getTime() - new Date(publishedAt).getTime() < 7 * DAY;
}

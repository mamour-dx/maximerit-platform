// Phase 6 — logique Offres : expiration, indexabilité, balisage Schema.org JobPosting.

export interface JobLike {
  id: number | string;
  title?: string;
  slug?: string;
  sector?: string;
  country?: string;
  location?: string;
  mission?: string;
  responsibilities?: string;
  requirements?: string;
  experienceMin?: number;
  contractType?: string;
  status?: string;
  publishedAt?: string | null;
  expiresAt?: string | null;
}

const EMPLOYMENT_TYPE: Record<string, string> = {
  cdi: "FULL_TIME",
  cdd: "TEMPORARY",
  "mission-interim": "TEMPORARY",
  "consultant-freelance": "CONTRACTOR",
  "fifo-roster": "FULL_TIME",
  stage: "INTERN",
};

/** Une offre est expirée par statut ou par date de fin dépassée. */
export function isExpired(job: JobLike, now: Date = new Date()): boolean {
  if (["expiree", "pourvue", "archivee"].includes(job.status ?? "")) return true;
  if (job.expiresAt && new Date(job.expiresAt).getTime() < now.getTime()) return true;
  return false;
}

/** Offre indexable/visible : publiée et non expirée. */
export function isLive(job: JobLike, now: Date = new Date()): boolean {
  return job.status === "publiee" && !isExpired(job, now);
}

/** Balisage Schema.org JobPosting (placé sur la page individuelle de l'offre — cahier §21). */
export function buildJobPostingJsonLd(job: JobLike, siteUrl: string): Record<string, unknown> {
  const description = [job.mission, job.responsibilities, job.requirements].filter(Boolean).join("\n\n");
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: description || job.title,
    datePosted: job.publishedAt ?? undefined,
    validThrough: job.expiresAt ?? undefined,
    employmentType: job.contractType ? EMPLOYMENT_TYPE[job.contractType] : undefined,
    hiringOrganization: { "@type": "Organization", name: "Maximerit", sameAs: siteUrl },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.location || undefined,
        addressCountry: job.country || undefined,
      },
    },
    directApply: true,
  };
  // Retire les clés undefined pour un JSON-LD propre.
  return JSON.parse(JSON.stringify(jsonLd));
}

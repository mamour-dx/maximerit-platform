import type { MetadataRoute } from "next";
import { SERVICES, SECTORS } from "@/lib/content";
import { miningIndexablePaths } from "@/lib/mining-nav";

// Phase 11 — logique SEO (robots + sitemap), pure et testable.

export const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.maximerit.com").replace(/\/$/, "");

// Pages publiques indexables construites en routes réelles (hors contenu CMS/DB).
export const STATIC_INDEXABLE = [
  "/",
  "/qui-nous-sommes/",
  "/contact/",
  "/entreprises/",
  ...SERVICES.map((s) => `/entreprises/${s.slug}/`),
  "/secteurs/",
  ...SECTORS.map((s) => `/secteurs/${s.slug}/`),
  "/mines/",
  ...miningIndexablePaths(),
  "/candidats/offres-demploi/",
  "/candidats/deposer-mon-cv/",
  "/candidats/rejoindre-le-vivier/",
  "/candidats/conseils-carriere/",
  "/ressources/blog/",
  "/ressources/outils/cout-vacance/",
  "/ressources/outils/cout-recrutement/",
  "/ressources/outils/benchmark-salaire/",
  "/ressources/outils/mining-team-planner/",
  // Volet anglais (fondation i18n)
  "/en/",
  "/en/mines/",
  "/en/contact/",
];

// Chemins jamais indexables (admin, API — dont les CV servis via /api/cvs — et actions).
export const DISALLOWED = [
  "/admin/", "/api/", "/apply/", "/submit-lead/", "/reparse-cv/", "/search-candidates/",
  "/preview/", "/exit-preview/",
];

export function isStaging(): boolean {
  return process.env.SEO_STAGING === "1";
}

/** Staging → tout bloqué (jamais indexé). Production → indexable sauf admin/API/actions. */
export function buildRobots(opts: { staging: boolean }): MetadataRoute.Robots {
  if (opts.staging) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/", disallow: DISALLOWED },
    sitemap: [`${SITE}/sitemap.xml`, `${SITE}/sitemap-jobs.xml`],
    host: SITE,
  };
}

export interface SitemapInput { path: string; lastmod?: string | null }

/** URLs absolues, dédupliquées, slash final conservé. */
export function buildSitemap(entries: SitemapInput[]): MetadataRoute.Sitemap {
  const seen = new Set<string>();
  const out: MetadataRoute.Sitemap = [];
  for (const e of entries) {
    if (seen.has(e.path)) continue;
    seen.add(e.path);
    out.push({ url: `${SITE}${e.path}`, lastModified: e.lastmod ? new Date(e.lastmod) : undefined });
  }
  return out;
}

# Phase 6 — Validation (GATE 6)

## Objectif
Offres d'emploi (URL propre + JobPosting + expiration) et candidatures reliées à l'ATS.

## Fonctionnalités livrées
- Collections `Jobs` (statut, dates, expiration) et `Applications` (job+candidat+cv+statut).
- Page détail `/jobs/[slug]` (SSR, JSON-LD JobPosting sur offres actives, mention + noindex si expirée),
  listing `/candidats/offres-demploi/`, sitemap `/sitemap-jobs.xml`.
- Candidature via `/apply` + `jobId` → crée candidat + CV (intake Phase 5a) **et** `Application` reliée.

## Tests exécutés
- Unit : 36/36 (dont `job.test.ts` 5). Intégration : 26/26 (dont `jobs.int.test.ts` 3).
- `tsc` 0 · `eslint` 0 · `next build` OK (`/jobs/[slug]`, `/sitemap-jobs.xml`, listing).
- Smoke runtime : listing = live only · JobPosting sur live · expirée = notice + noindex sans JobPosting · sitemap = live only.
- Migration `20260921_180118_jobs_applications` appliquée.

## Statut du gate
```
PHASE : 6 — Offres & candidatures
Specification PASS · Implementation PASS · Unit PASS (36/36) · Integration PASS (26/26)
Security/RBAC PASS · SEO PASS (JobPosting, canonical, noindex expirée, sitemap Jobs)
Build PASS · Lint PASS · Type-check PASS · Doc PASS
DÉCISION : GO
```

## Risques restants
- Sitemap général + hreflang → Phase 11. Tracking événements offres → Phase 8.

## GO / NO-GO
**GO.** Prochaine : Phase 7 (Contenus, outils & acquisition).

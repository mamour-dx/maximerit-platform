# Spec — Phase 6 : Offres & candidatures

## Besoin
Publier des offres avec URL propre indexable et balisage JobPosting, gérer leur expiration, et
recevoir des candidatures **reliées à l'ATS** (candidat + CV), avec sitemap dédié.

## Critères d'acceptation
1. Collection `Jobs` (poste, secteur, pays, localisation, mission, responsabilités, profil, expérience, contrat, statut, dates, offres similaires). ✅
2. URL propre `/jobs/<slug>/` (page détail SSR) + listing `/candidats/offres-demploi/`. ✅
3. **Schema.org JobPosting** (JSON-LD) sur la page individuelle des offres **actives** (avec `validThrough`, `employmentType`). ✅
4. **Expiration automatique** : offre expirée (statut ou `expiresAt` dépassée) → page conservée avec mention + `noindex`, **retirée du listing et du sitemap**, sans JobPosting. ✅
5. Candidature → `/apply` avec `jobId` : crée un candidat + CV (intake sécurisé Phase 5a) **et** une `Application` reliée (job+candidat+cv, statut `recue`). ✅
6. **Sitemap Jobs** `/sitemap-jobs.xml` : uniquement les offres actives. ✅
7. RBAC : `applications` non lisibles publiquement ; `jobs` publics en lecture. ✅
8. Tests : unit (expiration, JSON-LD) + intégration (candidature reliée, sitemap, RBAC) + smoke runtime. ✅

## Cas limites couverts
- Offre `brouillon` ou expirée → absente du listing/sitemap ; détail expiré = 200 + noindex (pas 404 pour préserver d'éventuels backlinks), sans JobPosting.
- Candidature réutilise l'anti-spam / validation / upload sécurisé de `/apply`.

## Tests
- Unit : `src/__tests__/job.test.ts` (5).
- Intégration : `src/__tests__/jobs.int.test.ts` (3).
- Smoke runtime : listing (live only), JSON-LD sur live, noindex sur expirée, sitemap (live only).

## Réserves
- Sitemap général `/sitemap.xml` (toutes pages indexables) + hreflang : Phase 11 (recette SEO).
- Événements de tracking `view_job` / `submit_application` : Phase 8 (points d'ancrage prêts).

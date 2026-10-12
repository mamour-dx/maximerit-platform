# Phase 13 — Validation (GATE 13)

## Objectif
Job board filtrable FR/EN, page offre enrichie, montée en gamme du design system et de l'accueil.

## Fonctionnalités livrées
- `lib/job-board.ts` (pur, testé) : `parseJobFilters`, `filterJobs`, `jobFacets`, `similarJobs`, libellés
  contrat/pays/pôle FR/EN, date relative, badge « nouvelle ».
- `components/jobs/*` : `JobBoard` (serveur), `JobFilters` (client, amélioration progressive), `JobCard`,
  `JobDetail` partagés FR/EN ; accès données `depth:0` + `locale`.
- Listing FR/EN (`searchParams`, noindex si filtré) ; détail FR/EN (synthèse, candidature, similaires).
- Design system : tokens + composants dans `globals.css`, `components/ui/Icon.tsx` ; header (lien actif,
  menu mobile), footer, formulaire de candidature ; accueil FR/EN unifié (`components/site/HomePage.tsx`).
- Seed démo : `payload seed-demo` (déclaré dans `bin` de `payload.config.ts`) — 9 offres FR+EN.

## Tests exécutés
- Unit : 85/85 (dont `job-board.test.ts` 12). Intégration : 39/39. SEO : 38 pass, 1 skip (inchangé).
- `tsc` 0 · `eslint` 0 · `next build` OK (accueil toujours statique).
- Runtime (dev, 1440px + 375px) : filtres pays/mot-clé (sans accent), pastilles, reset, détail + similaires,
  EN, menu mobile ; 0 erreur console/serveur. Routes : listing/détail FR/EN 200, slug inconnu 404,
  JobPosting présent sur offre live, notice sur offre expirée, `noindex, follow` sur liste filtrée.

## 13b — Design system sur tout le site
- `PageKit` (Page, PageHero, Breadcrumbs, Section, SectionHeading, LinkCard, InfoCard, CheckList, Steps,
  ChipList, FormCard, Prose, CtaBand, ArrowLink) + `localePath()` (i18n).
- Vues partagées FR/EN : `views/mining.tsx` (hub, pôle, pays, métiers, métier, page commerciale),
  `views/company.tsx` (expertises, secteurs, à propos, contact), `views/candidates.tsx`, `views/legal.tsx`,
  `views/resources.tsx` (blog, article, ressources, outils, landing pages). ~45 routes recâblées.
- Corrections au passage : lien « Je suis candidat » de `/en/mines/recrutement-minier/` pointait vers la
  version FR ; sections « problème » et « références » ajoutées à la version EN (parité FR/EN).
- Vérifié : 46 routes FR/EN → 200 (404 attendus sur URL inconnues), pages CMS de test (article, ressource
  gated/ouverte, landing page, page CMS) → 200, calculateur d'outil fonctionnel, rendu 1440px et 375px,
  0 erreur console (onglet neuf). Unit 85/85, intégration 39/39, SEO 38 pass / 1 skip, build OK (138 pages statiques).

## Statut du gate
```
PHASE : 13 — Job board & refonte visuelle
Specification PASS · Implementation PASS · Unit PASS (85/85) · Integration PASS (39/39)
SEO PASS (canonical, noindex filtré, JobPosting conservé) · Build PASS · Lint PASS · Type-check PASS · Doc PASS
DÉCISION : GO
```

## Risques restants
- Filtrage en mémoire sur ≤ 500 offres live : suffisant au volume actuel ; au-delà, basculer sur un index
  Meilisearch « jobs » (même contrat `JobFilters`).
- Les offres doivent renseigner `country` (code ISO, ex. `SN`) et `discipline` (slug du pôle) pour
  alimenter les facettes — à rappeler aux recruteurs dans l'admin.

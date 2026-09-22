# Phase 10 — Validation (GATE 10)

## Objectif
Performance & qualité : recherche à l'échelle, index DB, rendu, budget de perf.

## Fonctionnalités / vérifications livrées
- Recherche vivier à **gros volume** : test `perf.int.test.ts` (3000 candidats) — filtrage correct,
  `processingTimeMs < 150 ms`, pagination `limit`/`offset` (pages disjointes).
- Pagination ajoutée au moteur (`offset`).
- Requêtes de liste en `depth: 0` (offres, blog, ressources, sitemap) — anti N+1 / sur-récupération.
- Index DB sur les filtres réels (vérifiés en base).
- Stratégie de rendu documentée (statique / SSG / dynamique), JS client minimal, libs lourdes server-only.
- `docs/PERFORMANCE.md` (budget + outillage recette).

## Tests exécutés
- Intégration : 39/39 (dont `perf.int.test.ts` 2). Unit : 55/55. `tsc` 0 · `eslint` 0 · `next build` OK.

## Statut du gate
```
PHASE : 10 — Performance & qualité
Specification PASS · Implementation PASS · Perf (recherche 3000 < 150ms) PASS · Index DB PASS
Unit PASS (55/55) · Integration PASS (39/39) · Build PASS · Lint PASS · Type-check PASS · Doc PASS
DÉCISION : GO
```

## Risques restants (recette Phase 11/12)
- Core Web Vitals réels via Lighthouse CI ; load tests k6 ; cache/ISR si besoin mesuré.

## GO / NO-GO
**GO.** Prochaine : Phase 11 (Migration SEO & recette).

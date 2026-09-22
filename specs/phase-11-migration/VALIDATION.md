# Phase 11 — Validation (GATE 11)

## Objectif
Migration SEO & recette : sitemaps, robots, redirections vérifiées live, smoke SEO, checklist + suivi.

## Fonctionnalités / vérifications livrées
- `/robots.txt` (env-driven, staging vs prod), `/sitemap.xml` (statique + CMS publié + offres), `/sitemap-jobs.xml`.
- **Redirections vérifiées en mode LIVE** contre le serveur : 129 anciennes URLs → statut & destination conformes, sans chaîne.
- 0 CV indexable (robots `/api/` + RBAC), canonical par page, `SEO.md` complété (checklist §40 + suivi J+1/7/30/90).
- Page « Qui sommes-nous » (KEEP → 200) + module SEO pur testé.

## Tests exécutés
- Unit : 59/59 (dont `seo.test.ts` 4). Intégration : 39/39. Live redirect : ✅ (129 URLs, BASE_URL).
- `tsc` 0 · `eslint` 0 · `next build` OK (`/robots.txt`, `/sitemap.xml`). Smoke runtime robots/sitemap OK.

## Statut du gate
```
PHASE : 11 — Migration SEO & recette
Specification PASS · Implementation PASS · SEO (robots/sitemap/redirections live) PASS
Unit PASS (59/59) · Integration PASS (39/39) · Build PASS · Lint PASS · Type-check PASS · Doc PASS
DÉCISION : GO
```

## Risques restants
- hreflang FR/EN (rendu `/en/`) à brancher avant volet anglais. Crawl prod-like + Lighthouse en recette réelle.
- Finalisation « valeur » de la carte (GSC/GA4/backlinks) côté client (ADR-0005).

## GO / NO-GO
**GO.** Prochaine : Phase 12 (Production) — dernière phase.

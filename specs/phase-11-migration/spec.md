# Spec — Phase 11 : Migration SEO & recette

## Besoin
Préparer la bascule sans perte SEO : sitemaps, robots, redirections vérifiées en conditions réelles,
smoke SEO, checklist de recette et plan de suivi.

## Critères d'acceptation
1. `/robots.txt` env-driven (staging = tout bloqué ; prod = indexable sauf admin/API/actions) + `Sitemap:` déclarés. ✅
2. `/sitemap.xml` (pages statiques indexables + contenus CMS publiés + offres actives) + `/sitemap-jobs.xml`. ✅
3. **Tests de redirection en mode LIVE** (301/410 + destination, sans chaîne) exécutés contre le serveur réel (129 URLs). ✅
4. **0 CV indexable** (robots `/api/` + RBAC), canonical auto-référencée, 0 page stratégique en noindex. ✅
5. Checklist de recette (§40) + plan de suivi J+1/J+7/J+30/J+90 documentés (`docs/SEO.md`). ✅
6. Page « Qui sommes-nous » créée (KEEP de la carte de migration → 200). ✅

## Tests
- Unit : `seo.test.ts` (robots staging/prod, sitemap absolu/dédup).
- Live (recette) : `migration-map.test.mjs` avec `BASE_URL` (129 URLs vérifiées).
- Runtime smoke : robots.txt + sitemap.xml servis correctement.

## Réserves
- **hreflang FR/EN** : rendu des routes `/en/` à brancher avant ouverture du volet anglais (spécifié, non rendu).
- Crawl production-like complet + Lighthouse CI : sur l'environnement de recette réel.
- Enrichissement « valeur » de la carte (GSC/GA4/backlinks) : à finaliser côté client (ADR-0005).

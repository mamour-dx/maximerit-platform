# Spec — Phase 10 : Performance & qualité

## Besoin
Garantir que la plateforme tient les volumes réels (vivier de plusieurs milliers de candidats) et
offre une bonne base Core Web Vitals, sans dette de performance.

## Critères d'acceptation
1. Recherche vivier testée à gros volume (≥ 3000) : filtrage correct + budget de latence tenu. ✅
2. Pagination (`limit`/`offset`) fonctionnelle, pages disjointes. ✅
3. Index DB présents sur les filtres réels. ✅
4. Requêtes de liste sans sur-récupération (`depth: 0`) — anti N+1. ✅
5. Rendu optimisé (statique/SSG pour l'indexable, JS client minimal, libs lourdes server-only). ✅
6. Budget de performance documenté + plan d'outillage recette. ✅

## Tests
- Intégration : `perf.int.test.ts` (volume + pagination). Index vérifiés en base.

## Réserves
- Core Web Vitals réels (Lighthouse CI) et load tests (k6) : recette Phase 11/12.

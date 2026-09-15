# Spec — Phase 2 : Architecture UX + SEO

## Besoin
Définir l'architecture d'information, le plan d'URL en silos, la stratégie FR/EN et le maillage,
de façon à créer une topical authority (Mining prioritaire) et à garantir la cohérence avec la
migration SEO (Phase 0).

## Périmètre
Navigation, architecture de contenu, silos SEO, URLs, catégories/taxonomies, maillage interne,
stratégie FR/EN + hreflang, pages pays/métiers/secteurs/expertise, landing pages, sitemap logique.

## Critères d'acceptation
1. Registre de routes généré depuis la taxonomie/référentiels ; **aucun conflit de routes**. ✅
2. Silos Mining complets : hub `/mines/`, 4 disciplines, 26 fiches métiers, page commerciale, 7 pages pays. ✅
3. SEO 4 niveaux annotés sur chaque page de contenu. ✅
4. FR racine + EN `/en/` ; **hreflang réciproque** par groupe (hors single-locale). ✅
5. Maillage : tout parent (fil d'Ariane) résolu — **0 page orpheline**. ✅
6. Indexabilité : système non indexable, LP hors nav principale. ✅
7. **Bouclage Phase 0↔2** : 100 % des cibles KEEP/301 existent comme routes. ✅

## Cas limites
- Secteur Mining = hub `/mines/` (pas de page `/secteurs/mines…/` en doublon).
- Pages pays : seulement si valeur locale (`requiresLocalContent`).
- LP de campagne : indexables mais hors nav ; certaines `singleLocale`.

## Tests
`scripts/tests/routes.test.mjs` — **9 tests** (conflits, titres/H1, maillage, i18n, hreflang,
indexabilité, bouclage migration, silos Mining, niveaux SEO).

## Décisions
- Slugs de fiches métiers dérivés du label FR (slugify) / slug canonique EN — curables si besoin SEO.
- `/secteurs/` ne contient pas Mining (renvoi au hub) pour éviter la duplication de contenu.

## Réserves
- Le contenu réel des pages (copy, metadata) est produit en Phase 4/7 ; la Phase 2 fige la structure.
- Le rendu des balises (canonical/hreflang/Schema.org) est implémenté en Phase 3/4 et re-testé en Phase 11.

# Spec — Phase 0 : Audit & migration SEO

> Spec-Driven. Statut : implémentée (voir VALIDATION.md pour le GATE).

## Besoin
Avant toute refonte, sécuriser l'antériorité SEO : connaître l'existant, décider du sort de
chaque URL, et outiller la non-régression. « La refonte ne doit jamais démarrer par la suppression
du site actuel » (cahier §29).

## Périmètre
- Inventaire exhaustif des URLs du site actuel.
- Audit technique (statut HTTP, title, H1, canonical, indexabilité, hreflang, profondeur, liens internes).
- Croisement avec les données de valeur (Search Console : clics/impressions/position/requêtes ; Analytics ; backlinks).
- Classement des URLs par valeur ; stratégie de conservation.
- **Master URL Migration File** (KEEP / 301 / 410 / NOINDEX).
- Règles de redirection serveur sans chaîne.
- Validation canonicals / sitemap / robots.
- Tests automatisés de non-régression des URLs.

## Critères d'acceptation
1. 100 % des URLs connues du site actuel sont inventoriées et présentes dans la carte de migration.
2. Chaque URL a une action explicite et justifiée (KEEP/301/410/NOINDEX). Aucune disparition sans décision documentée.
3. Aucune chaîne de redirection (A→B→C) dans la carte.
4. La stratégie i18n de migration (`/language/en/` → `/en/`) est définie (ADR-0002).
5. Les tests de non-régression des URLs passent (mode intégrité hors-ligne ; mode live prêt pour la recette).
6. La méthodologie est reproductible (scripts) et documentée (`docs/SEO.md`).

## Cas limites
- Doublons/typos d'URL (ex. `/offre-demplois/`) → 301 vers l'URL canonique.
- Offres d'emploi expirées → 301 vers le listing (pas de 410 massif sans données de valeur).
- Pages de fonctions applicatives publiques (dashboard, publication d'offre) → retirées du public, redirigées vers une page pertinente.
- URL sans équivalent et sans valeur → candidate 410, **décision différée** jusqu'aux données GSC.

## Tests prévus / réalisés
- `scripts/tests/migration-map.test.mjs` : couverture 100 %, actions valides, KEEP=identité,
  pas d'auto-redirection, **pas de chaîne**, confiance valide. Mode live (`BASE_URL`) pour la recette.

## Dépendances / réserves
- **Google Search Console** (fourni par le client) : requis pour finaliser les 116 lignes `PENDING_GSC`.
- GA4 & export backlinks : non fournis → couche valeur partielle, réserve documentée.
- Crawl scripté bloqué par WAF → crawl via navigateur / contexte autorisé / ingestion GSC.

## Livrables
- `specs/phase-0-seo-migration/audit/url-inventory.csv` (129 URLs)
- `specs/phase-0-seo-migration/audit/master-url-migration-file.csv` (129 lignes)
- `scripts/build-url-inventory.mjs`, `scripts/build-migration-map.mjs`, `scripts/seo-crawl.mjs`
- `scripts/tests/migration-map.test.mjs`
- `docs/SEO.md`

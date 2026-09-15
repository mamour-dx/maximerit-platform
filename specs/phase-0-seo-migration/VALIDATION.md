# Phase 0 — Validation (GATE 0)

## Objectif
Sécuriser l'antériorité SEO avant la refonte : inventorier l'existant, décider du sort de chaque
URL, outiller la non-régression. Ne jamais démarrer par la suppression du site actuel.

## Fonctionnalités livrées
- Inventaire exhaustif : **129 URLs** (71 FR + 58 EN) depuis le sitemap Yoast faisant autorité.
- Détection des doublons/legacy et des offres expirées.
- **Master URL Migration File** : 129 lignes, actions KEEP/301/410 + justification + confiance.
- Stratégie i18n de migration `/language/en/` → `/en/` (ADR-0002).
- Outillage reproductible : `build-url-inventory`, `build-migration-map`, `seo-crawl` (+ ingestion GSC).
- Tests de non-régression des URLs (intégrité hors-ligne + mode live pour la recette).
- Documentation : `docs/SEO.md`, cette spec, ce rapport.

## Tests exécutés
`npm run test:seo` → **8 pass / 1 skip** (skip = mode live, activé en Phase 11 via `BASE_URL`).
Couvre : couverture 100 %, actions valides, KEEP=identité, pas d'auto-redirection,
**absence de chaîne A→B→C**, confiance valide.

## Résultats (chiffres)
- Actions : 3 KEEP · 126 × 301 · 0 × 410 (aucun 410 sans preuve d'absence de valeur — Art. V).
- Confiance : 13 HIGH · 116 PENDING_GSC.

## Sécurité
N/A à ce stade (aucun code applicatif). Constat d'audit : le serveur bloque le crawl scripté (WAF).

## SEO
Cœur de la phase. Principe de conservation appliqué ; carte de migration testée sans chaîne.

## Performance
N/A.

## Problèmes rencontrés
- WAF bloque `curl`/scripts (403) → inventaire récupéré via navigateur ; enrichissement par-URL à
  faire via contexte autorisé ou ingestion GSC.
- Sitemap sans articles (pas de blog) → tout le contenu SEO (dont Mining) est à créer.

## Corrections
- Choix conservateur : 301 par défaut plutôt que 410 tant que la valeur est inconnue.
- Tests d'intégrité ajoutés pour garantir l'absence de chaîne et la couverture 100 %.

## Décisions
- ADR-0002 (i18n `/en/`), ADR-0003 (staging isolé). Voir `docs/DECISIONS.md`.

## Statut du gate
```
PHASE : 0 — Audit & migration SEO
STATUT :
- Specification    : PASS
- Implementation   : PASS
- Unit tests       : PASS (8/8, mode intégrité)
- Integration/E2E  : N/A (mode live prêt, activé Phase 11)
- Security checks  : N/A
- SEO checks       : PASS (carte sans chaîne, couverture 100 %) / RÉSERVE valeur GSC
- Build            : N/A (pas encore de build applicatif)
- Lint             : N/A
- Type check       : N/A
- Documentation    : PASS
DÉCISION : GO (conditionnel)
BLOQUANTS : aucun pour passer en Phase 1 (indépendante, stack-agnostique).
ACTIONS RESTANTES (avant GATE 11, pas avant Phase 1) :
- Ingérer l'export Google Search Console et finaliser les 116 lignes PENDING_GSC (KEEP/301/410).
- Obtenir GA4 + export backlinks (réserve documentée).
- Enrichir l'inventaire (statut/title/canonical) via contexte autorisé par le WAF.
```

## Risques restants
- R1 (perte SEO à la migration) : mitigé par carte + tests ; se referme en Phase 11 avec données GSC.
- Décisions PENDING_GSC : ne pas exécuter les 410 avant confirmation de non-valeur.

## GO / NO-GO
**GO** pour engager la Phase 1 (Stratégie & domain model). La finalisation « valeur » de la carte
de migration se poursuit en parallèle et est re-gatée à la Phase 11 (recette de migration), point
où elle est réellement nécessaire.

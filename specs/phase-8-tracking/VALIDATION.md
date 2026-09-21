# Phase 8 — Validation (GATE 8)

## Objectif
Tracking & data : dataLayer/GTM/GA4/Search Console, catalogue d'événements, consentement, UTM.

## Fonctionnalités livrées
- `analytics.ts` : dataLayer, consentement (buffer/flush/refus), UTM (capture/attachement), `trackOnce`.
- `AnalyticsProvider` : bannière de consentement + chargement conditionnel GTM/GA4 (après accord uniquement).
- `TrackView` : événements de vue (`view_job`, `view_mining_page`).
- Instrumentation du tunnel : outils (`use_tool`), leads (`start_lead_form`/`submit_lead_form`),
  candidatures (`start_application`/`submit_application`/`upload_cv`).
- Vérification Search Console (meta) + env `NEXT_PUBLIC_GTM_ID`/`GA4_ID`/`GSC_VERIFICATION`.
- Documentation `docs/TRACKING.md` (catalogue versionné).

## Tests exécutés
- Unit : 53/53 (dont `analytics.test.ts` 9). `tsc` 0 · `eslint` 0 · `next build` OK (12 pages).
- Runtime : bannière affichée ; consentement accordé → clic outil → `{event:"use_tool", tool:"benchmark-salaire"}` présent dans `window.dataLayer` (aucun événement avant accord).

## Statut du gate
```
PHASE : 8 — Tracking & data
Specification PASS · Implementation PASS · Unit PASS (53/53) · Runtime PASS
Consentement/RGPD PASS · Build PASS · Lint PASS · Type-check PASS · Doc PASS
DÉCISION : GO
```

## Risques restants
- Câblage fin `download_guide` / `click_*` à finaliser (non bloquant).
- IDs GA4/GTM/GSC réels à fournir en production.

## GO / NO-GO
**GO.** Prochaine : Phase 9 (Sécurité) — audit consolidé.

# Spec — Phase 8 : Tracking & data

## Besoin
Mesurer l'intégralité du parcours (acquisition → contenu → lead/candidature) de façon documentée,
versionnée, testable et **respectueuse des données personnelles** (consentement).

## Critères d'acceptation
1. Couche `dataLayer` (GTM) + intégration GA4 + vérification Search Console, IDs par variable d'env, chargement non bloquant. ✅
2. Catalogue d'événements **versionné et documenté** (`docs/TRACKING.md`), aligné sur `@maximerit/domain` (test de non-dérive). ✅
3. **Consentement** : aucun événement/script tiers avant accord ; bannière Accepter/Refuser ; buffer vidé au consentement. ✅
4. **UTM conservés** (capture 1×/session, attachés aux événements, transmis aux leads). ✅
5. Événements instrumentés sur le tunnel : `use_tool`, `start_lead_form`/`submit_lead_form`, `start_application`/`submit_application`/`upload_cv`, `view_job`, `view_mining_page`. ✅
6. **Pas de double déclenchement** (`trackOnce`). ✅
7. Tests : bon moment, bons paramètres, gating consentement, dédup, UTM. ✅

## Cas limites couverts
- Aucun consentement → 0 événement dans le dataLayer (bufferisé) ; refus → événements jetés.
- Événement hors catalogue → rejeté. `trackOnce` → une seule occurrence.
- Env vides → aucun script tiers chargé.

## Tests
- Unit : `src/__tests__/analytics.test.ts` (9).
- Runtime : bannière visible ; accord → `use_tool` poussé dans le dataLayer (vérifié navigateur).

## Réserves
- `download_guide` et `click_phone/email/whatsapp` : points d'ancrage définis, câblage fin à finaliser
  (ressources gated / liens contact) — non bloquant.
- Envoi effectif à GA4/GTM nécessite les IDs (fournis par le client en production).

# TRACKING.md — Mesure & données (Phase 8)

> Couche : `src/lib/analytics.ts` (dataLayer + consentement + UTM), `AnalyticsProvider` (bannière +
> chargement GTM/GA4), `TrackView` (événements de vue). Catalogue versionné, aligné sur
> `@maximerit/domain` (`enums.trackingEvents`) — test de non-dérive `analytics.test.ts`.

## Principes
- **Aucune mesure avant consentement** : les événements sont bufferisés tant que le consentement
  n'est pas `granted` ; ils sont vidés dans le `dataLayer` au consentement, jetés au refus. GTM/GA4
  ne sont **chargés** qu'après accord.
- **UTM conservés** : capturés une fois par session (`utm_*` de l'URL), attachés à chaque événement
  et transmis aux leads/candidatures (source d'acquisition).
- **Anti double déclenchement** : `trackOnce(key, …)` pour les événements one-shot (start de formulaire).

## Catalogue d'événements
| Événement | Déclencheur | Paramètres |
|---|---|---|
| `view_service` | vue page service | — |
| `view_mining_page` | vue hub `/mines/` | `path` |
| `view_job` | vue page offre | `slug` |
| `start_application` | 1er focus formulaire candidature | `jobId` |
| `submit_application` | candidature envoyée | `jobId` |
| `upload_cv` | CV joint à une candidature | `jobId` |
| `start_lead_form` | 1er focus formulaire lead | `source` |
| `submit_lead_form` | lead envoyé | `source` |
| `download_guide` | téléchargement guide *(à câbler avec les ressources gated)* | `slug` |
| `use_tool` | calcul d'un outil | `tool` |
| `click_phone` / `click_email` / `click_whatsapp` | clic contact *(à câbler)* | — |

`source` porte le contexte d'acquisition : `lp:<slug>`, `tool:<slug>`, `resource:<slug>`, `contact`.

## Configuration (variables d'environnement)
```
NEXT_PUBLIC_GTM_ID=            # ex. GTM-XXXX (charge GTM après consentement)
NEXT_PUBLIC_GA4_ID=            # ex. G-XXXX (charge gtag après consentement)
NEXT_PUBLIC_GSC_VERIFICATION=  # jeton de vérification Google Search Console (balise meta)
```
Vides en local → aucun script tiers, aucune mesure. À renseigner en production (fournis par le client).

## Tests
`src/__tests__/analytics.test.ts` (9) : non-dérive du catalogue, gating de consentement (buffer/flush/refus),
rejet d'événement hors catalogue, `trackOnce` (une seule fois), capture et attachement des UTM.
Vérifié au runtime : consentement accordé → clic outil → `{event:"use_tool"}` dans le `dataLayer`.

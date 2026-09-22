# PERFORMANCE.md — Performance & qualité (Phase 10)

## Stratégie de rendu (Core Web Vitals)
D'après le build Next 16 :
- **Statique (○)** : `/`, `/contact`, `/mines` — HTML prérendu, JS client minimal.
- **SSG (●)** : les 4 outils `/ressources/outils/<slug>` — prérendus via `generateStaticParams`.
- **Dynamique (ƒ)** : pages pilotées par la base (offres, blog, ressources, LP, pages CMS, admin, API).

Le JS client est **volontairement réduit** : seuls de petits composants sont clients (Header, LeadForm,
ApplyForm, ToolCalculator, AnalyticsProvider, TrackView). Les libs lourdes sont **server-only**
(Payload, Meilisearch, `pdf-parse`, `mammoth` → `serverExternalPackages`), donc **hors bundle navigateur**.

## Recherche du vivier (à l'échelle) — mesuré
- Test `perf.int.test.ts` : **3000 candidats** indexés, requête canonique multicritère.
- **`processingTimeMs < 150 ms`** (budget), filtrage correct, **pagination** `limit`/`offset` (pages disjointes).
- La recherche s'appuie sur Meilisearch (attributs filtrables déclarés), pas sur des scans SQL.

## Base de données
- **Index** sur les filtres réels (vérifiés en base) : `candidates_status_idx`, `candidates_email_idx`,
  `jobs_status_idx`, `jobs_slug_idx`, `articles_status_idx`, index `slug` de chaque collection, `leads_email_idx`.
- **Anti sur-récupération** : les requêtes de liste utilisent `depth: 0` (pas de peuplement de relations inutile → évite les N+1).

## Images & assets
- Aucune image lourde à ce stade. Politique à l'ajout de médias : `next/image` (WebP/AVIF, lazy loading,
  dimensions explicites) + compression.

## Budget de performance
| Métrique | Budget | Statut |
|---|---|---|
| Recherche vivier (Meili, 3000 docs) | < 150 ms serveur | ✅ mesuré |
| Requêtes de liste | pas de N+1 (`depth:0`) | ✅ |
| JS client public | minimal (composants ciblés, libs server-only) | ✅ qualitatif |
| Core Web Vitals (LCP/CLS/INP) | Lighthouse en recette | 🔜 Phase 11/12 (Lighthouse CI) |

## À outiller en Phase 11/12
- **Lighthouse CI** (Core Web Vitals réels) sur les pages clés, en CI et en recette.
- Analyse de bundle (si un besoin de réduction apparaît).
- Cache HTTP/ISR sur les pages dynamiques à fort trafic (offres, blog) si nécessaire, mesuré.
- Load tests (k6) sur `/submit-lead`, `/apply`, `/search-candidates` avant montée en charge.

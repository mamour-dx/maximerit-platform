# Spec — Phase 4 : Site public + CMS

## Besoin
Permettre à l'équipe de gérer le contenu sans développeur et faire tourner le dispositif
d'acquisition (landing pages → leads) avec tracking et anti-spam. Le CMS pilote pages,
landing pages, redirections, formulaires, CTA, metadata.

## Découpage
- **4a — Acquisition « Landing Page → Lead »** (cette livraison) : collections `LandingPages`
  et `Leads`, rendu `/lp/[slug]`, formulaire, validation serveur, anti-spam, capture UTM/source, RBAC.
- **4b — Pages CMS & redirections** (à suivre) : rendu dynamique des `Pages` publiées (`/[...slug]`),
  preview brouillon (draft mode), moteur de redirections serveur depuis la collection `Redirects`
  (301/410/noindex), metadata/canonical/OpenGraph administrables.

## Critères d'acceptation — 4a
1. Collection `LandingPages` éditable (promesse, problème, profils, méthode, preuves, CTA, SEO, statut, indexable), localisée FR/EN. ✅
2. Collection `Leads` (champs qualifiants + source + UTM + relation landing page + statut). ✅
3. `/lp/[slug]` rend une LP **publiée** (404 si brouillon/inexistante), metadata SEO + canonical + `noindex` si `indexable=false`. ✅
4. Formulaire → `POST /submit-lead` : **validation serveur** (nom, email, headcount), **anti-spam** (honeypot), **rate limiting** best-effort, **capture UTM/source** filtrée. ✅
5. RBAC : création publique de lead **uniquement** via `/submit-lead` (REST create réservé à l'interne) ; **lecture des leads interdite au public** (réservée MARKETING/ADMIN). ✅
6. Tests : unit (validation/anti-spam/UTM) + intégration (parcours LP→lead, honeypot, invalide, RBAC). ✅

## Cas limites couverts
- Honeypot rempli → 202 sans stockage. Lead invalide → 400. Rate limit dépassé → 429.
- UTM arbitraires filtrées (seules source/medium/campaign/term/content conservées).
- LP en brouillon → 404 public.

## Tests
- Unit : `src/__tests__/lead.test.ts` (6).
- Intégration : `src/__tests__/lp-lead.int.test.ts` (4) + `payload.int.test.ts` (3).

## Réserves (→ 4b)
- Rendu des Pages CMS + preview brouillon + moteur de redirections serveur : Phase 4b.
- Rate limiting en mémoire (best-effort) → store partagé (Redis) en production.
- Tracking GA4/GTM des événements `submit_lead` : Phase 8 (le point de capture serveur est prêt).

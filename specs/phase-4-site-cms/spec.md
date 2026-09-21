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

## Critères d'acceptation — 4b
7. Champs `content` + SEO ajoutés à `Pages` (localisés) ; migration `pages_content`. ✅
8. Route catch-all `/[...slug]` rend une Page **publiée** (404 sinon) ; metadata SEO + canonical. ✅
9. **Preview** brouillon : `/preview` (secret) active le draft mode → brouillon visible ; `/exit-preview` le quitte ; mauvais secret → 401. ✅
10. **Moteur de redirections serveur** (middleware) : 301/410 depuis la table générée de la carte de migration (Phase 0), sans chaîne, slash final toléré. ✅
11. `trailingSlash: true` (URLs canoniques alignées registre Phase 2). ✅

## Vérifications runtime (4b)
- `/recrutement/` → 301 `/entreprises/recrutement/` ; `/language/en/recruitment/` → 301 `/en/entreprises/recrutement/`.
- `/test-published/` → 200 ; `/test-draft/` → 404 ; preview (secret) → 200 ; mauvais secret → 401.

## Réserves
- Rate limiting en mémoire (best-effort) → store partagé (Redis) en production (Phase 9/12).
- Redirections gérées par le CMS (collection `Redirects`) : sync vers la table runtime via hook Payload — Phase 6/11 (la baseline de migration Phase 0 est déjà appliquée).
- Tracking GA4/GTM des événements `submit_lead` : Phase 8 (point de capture serveur prêt).
- Rendu `content` en texte (paragraphes) ; rich text lexical → amélioration ultérieure.

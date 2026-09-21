# Phase 4 — Validation (GATE 4)

## Objectif
Site public + CMS. Sous-phase **4a** : cœur d'acquisition Landing Page → Lead.

## Fonctionnalités livrées (4a)
- Collections Payload `LandingPages` (localisée FR/EN, statut, indexable, SEO) et `Leads`
  (qualifiants + source + UTM + relation LP + statut).
- Route `/lp/[slug]` : rendu SSR des LP publiées, metadata SEO + canonical + noindex conditionnel.
- Formulaire client `LeadForm` (honeypot, capture UTM depuis l'URL) → `POST /submit-lead`.
- Endpoint `/submit-lead` : validation serveur, anti-spam honeypot, rate limiting, UTM/source filtrés,
  création du lead via Local API (overrideAccess après anti-spam).
- RBAC : lecture des leads réservée MARKETING/ADMIN ; création publique canalisée par `/submit-lead`.

## Tests exécutés
- Unit (Vitest) : 10/10 (`lead.test.ts` 6 + `smoke.test.tsx` 4).
- Intégration (Vitest node + PostgreSQL) : 7/7 (`lp-lead.int.test.ts` 4 + `payload.int.test.ts` 3).
- Node (SEO/domaine) : 38/39 (1 skip live).
- `tsc --noEmit` : 0 erreur · `eslint` : 0 erreur · `next build` : OK (`/lp/[slug]`, `/submit-lead`).
- Migration `20260921_105512_acquisition` appliquée sur base fraîche (initial + acquisition).

## Statut du gate
```
PHASE : 4a — Acquisition Landing Page → Lead
Specification PASS · Implementation PASS · Unit PASS (10/10) · Integration PASS (7/7)
Security/RBAC PASS · SEO PASS (canonical/noindex/metadata) · Build PASS · Lint PASS · Type-check PASS · Doc PASS
DÉCISION : GO

PHASE : 4b — Pages CMS + redirections + preview
Specification PASS · Implementation PASS · Unit PASS (redirects 5) · Integration PASS (pages 3)
Runtime PASS (301 FR/EN · page publiée 200 · brouillon 404 · preview 200 · secret KO 401)
Build PASS (middleware actif) · Lint PASS · Type-check PASS · Doc PASS
DÉCISION : GO
```

## Vérifications runtime 4b (serveur de production local)
- `/recrutement/` → 301 → `/entreprises/recrutement/` · `/language/en/recruitment/` → 301 → `/en/entreprises/recrutement/`
- `/test-published/` → 200 · `/test-draft/` → 404 · preview (bon secret) → 200 · mauvais secret → 401 · `/lp/…` → 200

## Bilan tests Phase 4 (4a + 4b)
- Unit (Vitest) : 15/15 · Intégration (PostgreSQL) : 10/10 · Node SEO/domaine : 38/39 (1 skip).

## Sécurité
Anti-spam honeypot + rate limiting ; validation serveur systématique ; whitelist des champs (jamais
le honeypot ni de champs arbitraires) ; leads non lisibles publiquement.

## Risques restants
- Rate limiting en mémoire (mono-instance) → Redis en prod (Phase 9/12).
- 4b requis avant la recette globale (rendu Pages + redirections de migration).

## GO / NO-GO
**GO (4a).** Prochaine : 4b (Pages CMS, preview, moteur de redirections).

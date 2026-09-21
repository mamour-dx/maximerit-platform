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
DÉCISION : À FAIRE (prochaine sous-phase)
```

## Sécurité
Anti-spam honeypot + rate limiting ; validation serveur systématique ; whitelist des champs (jamais
le honeypot ni de champs arbitraires) ; leads non lisibles publiquement.

## Risques restants
- Rate limiting en mémoire (mono-instance) → Redis en prod (Phase 9/12).
- 4b requis avant la recette globale (rendu Pages + redirections de migration).

## GO / NO-GO
**GO (4a).** Prochaine : 4b (Pages CMS, preview, moteur de redirections).

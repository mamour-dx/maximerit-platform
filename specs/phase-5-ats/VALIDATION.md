# Phase 5 — Validation (GATE 5)

## Objectif
ATS + vivier. Sous-phase **5a** : modèle candidat, upload CV sécurisé, intake candidature.

## Fonctionnalités livrées (5a)
- Collections Payload `Candidates` (identité, professionnel, bloc Mining, langues, tags, notes,
  pipeline 10+4 statuts, `parseStatus`, consentement), `CVs` (upload privé PDF/DOCX), `Tags`
  (taxonomie administrée — pas de création libre).
- Endpoint `/apply` (multipart profil + CV) : validation métier via `@maximerit/domain`
  (consentement obligatoire), anti-spam honeypot, rate limiting, contrôle type/taille/nom du fichier.
- RBAC : `candidates` et `cvs` non lisibles publiquement (Art. VI — aucun CV sur URL publique).

## Tests exécutés
- Unit (Vitest) : 21/21 (dont `upload.test.ts` 7).
- Intégration (Vitest node + PostgreSQL) : 17/17 (dont `apply.int.test.ts` 7).
- `tsc --noEmit` : 0 · `eslint` : 0 · `next build` : OK (`/apply`).
- Migration `20260921_125936_ats` appliquée (candidates, cvs, tags + tables relationnelles).

## Statut du gate
```
PHASE : 5a — Modèle candidat + upload CV sécurisé + intake
Specification PASS · Implementation PASS · Unit PASS (21/21) · Integration PASS (17/17)
Security/RBAC PASS (CV privé, upload contrôlé) · Build PASS · Lint PASS · Type-check PASS · Doc PASS
DÉCISION : GO

PHASE : 5b — Parsing CV (pipeline interne, ADR-0004)   → À FAIRE
PHASE : 5c — Recherche Meilisearch + viviers + shortlist → À FAIRE
```

## Sécurité
Upload : whitelist MIME (PDF/DOCX), taille ≤ 5 Mo, cohérence extension, nom sanitisé (anti
path-traversal). CV/candidats jamais exposés publiquement. Consentement obligatoire + horodaté.

## Risques restants
- Stockage CV local (dev) → objet privé S3-like en prod (Phase 12).
- Rate limiting mémoire → Redis en prod.

## GO / NO-GO
**GO (5a).** Prochaines : 5b (parsing), 5c (recherche/vivier).

# Phase 3 — Validation (GATE 3)

## Objectif
Socle technique réel (monorepo, Next.js, DB, CI) + design system.

## Fonctionnalités livrées (3a — socle front)
- Monorepo pnpm (`apps/web`, `packages/domain`), TypeScript strict, ESLint, Tailwind v4.
- App Next.js 16 : accueil + hub `/mines/` rendus en **SSG**, consommant `@maximerit/domain`.
- Package `@maximerit/domain` typé (types + validation + recherche, source unique).
- Design system : tokens de marque Maximerit (thème clair/sombre), `Button`, états loading/empty/error (accessibles).
- Socle données préparé : `docker-compose.yml` (PostgreSQL + Meilisearch), `.env.example`.
- CI étendue : job `web` (typecheck + lint + test + build).

## Tests exécutés
- `pnpm --filter web exec tsc --noEmit` → 0 erreur.
- `pnpm --filter web lint` → 0 erreur.
- `pnpm --filter web test --run` (Vitest) → **4/4**.
- `pnpm --filter web build` → **succès** (`/`, `/mines` prérendues SSG).
- `npm run test:seo` (Node) → **38/39** (1 skip live).

## Statut du gate
```
PHASE : 3a — Design system & socle technique (front)
STATUT :
- Specification    : PASS
- Implementation   : PASS
- Unit/Component   : PASS (Vitest 4/4)
- SEO tests        : PASS (38/39, 1 skip)
- Build            : PASS (next build, SSG)
- Lint             : PASS
- Type check       : PASS
- Documentation    : PASS
- Security checks   : N/A (auth/RBAC applicatif = 3b)
DÉCISION : GO (3a)

PHASE : 3b — CMS Payload + PostgreSQL
STATUT :
- Payload dans apps/web  : PASS (admin /admin → HTTP 200)
- PostgreSQL             : PASS (docker compose ; /ready → db:ok)
- Migrations versionnées : PASS (src/migrations/20260920_232903_initial.ts appliquée)
- Collections            : PASS (Users+RBAC, Pages localisées FR/EN, Redirects)
- RBAC                   : PASS (bootstrap 1er admin OK ; création anonyme → 403)
- Intégration DB         : PASS (payload.int.test.ts 3/3 ; job CI `integration` + service Postgres)
- Build                  : PASS (next build avec routes /admin, /api/*, /health, /ready)
DÉCISION : GO
```

## Notes techniques
- Node 23 + tsx@4.22.4 : la CLI Payload plante sur `require(ESM)` (TLA lexical) → contournée via `--use-swc` (@swc-node/register). Documenté pour les scripts (`generate:*`, `migrate`).
- `graphql` épinglé en ^16 (peer de Payload ; ^17 provoquait un unmet peer).

## Risques restants
- Aucun bloquant. La Phase 4 (Site + CMS) peut démarrer.

## GO / NO-GO
**GO (3a + 3b).** Prêt pour la Phase 4 (Site public + CMS).

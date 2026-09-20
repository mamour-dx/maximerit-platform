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
DÉCISION : NO-GO (bloqué infra)
BLOQUANT : démon Docker arrêté dans l'environnement → PostgreSQL indisponible.
ACTION REQUISE (utilisateur) : démarrer Docker Desktop, puis `docker compose up -d`.
Ensuite : intégration Payload dans apps/web, migrations, collections Users/Pages/Redirects, /health.
```

## Risques restants
- 3b non démarré : la Phase 4 (Site + CMS) **dépend** de 3b → doit être clôturé avant P4.

## GO / NO-GO
**GO pour 3a.** **3b en attente** du démon Docker (action utilisateur), à clôturer avant la Phase 4.

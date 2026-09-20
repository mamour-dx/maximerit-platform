# Spec — Phase 3 : Design system & socle technique

## Besoin
Mettre en place le socle applicatif réel (monorepo, framework, DB, CI) et un design system
cohérent, sur lequel les phases suivantes (site+CMS, ATS, offres…) se construisent.

## Périmètre
- Monorepo pnpm (`apps/*`, `packages/*`), TypeScript strict, ESLint, Tailwind v4.
- App **Next.js 16** (App Router, SSR/SSG) — socle du site public.
- Package **`@maximerit/domain`** : le domaine (Phase 1) devient un package typé, source unique
  consommée par l'app et les scripts SEO.
- **Design system** : tokens de marque Maximerit (thème clair/sombre), composants réutilisables
  (Button) et états standard (loading / empty / error).
- **Socle données** : `docker-compose` (PostgreSQL + Meilisearch), `.env.example`.
- **CI** : type-check + lint + tests + build de l'app, en plus des checks SEO.

## Découpage
- **3a — Socle front (sans DB)** : monorepo, Next, domaine, design system, CI, tests. **Vérifiable sans Docker.**
- **3b — CMS & DB** : intégration Payload dans `apps/web`, connexion PostgreSQL, migrations,
  1ères collections (Users/RBAC, Pages, Redirects). **Requiert le démon Docker actif.**

## Critères d'acceptation
### 3a (cette livraison)
1. `pnpm install` au niveau workspace lie `@maximerit/domain` et l'app. ✅
2. Type-check (`tsc --noEmit`) : **0 erreur**. ✅
3. Lint (`eslint`) : **0 erreur**. ✅
4. Tests : Vitest (app ↔ domaine, rendu design system) **verts** + suites SEO/domaine Node inchangées. ✅
5. `next build` : **succès** ; `/` et `/mines` prérendues (SSG) et consommant le domaine. ✅
6. Design system : tokens de marque + Button + états loading/empty/error, thème-aware, focus accessible. ✅
### 3b (nécessite Docker) — FAIT
7. Payload monté dans `apps/web`, admin `/admin` accessible (HTTP 200), connecté à PostgreSQL. ✅
8. Migrations versionnées (`src/migrations/…_initial.ts`) ; collections Users (RBAC), Pages (localisées FR/EN), Redirects. ✅
9. `/health` (200) + `/ready` (200, `db:ok`). ✅
10. RBAC vérifié : bootstrap du 1er admin autorisé, création anonyme suivante refusée (403) ; test d'intégration `payload.int.test.ts` (3/3). ✅

## Tests
- `apps/web` : Vitest (`src/__tests__/smoke.test.tsx`) — 4 tests.
- Racine : `node --test` (SEO + domaine) — 38 tests / 1 skip.

## Décisions
- ADR-0006 : PostgreSQL via docker-compose ; Payload dans `apps/web` ; domaine isolé en package.
- Next 16 (et non 15) : version courante au scaffolding — conventions vérifiées (params async, transpilePackages).

## Réserves
- 3b bloqué par le démon Docker (arrêté dans l'environnement). Dès Docker actif :
  `docker compose up -d` puis intégration Payload + migrations, re-gate.

# ARCHITECTURE.md — Maximerit

> Architecture cible (Étape D). Stack validée : ADR-0001. Ce document évolue avec le code.

## 1. Vue logique (responsabilités — cahier §35)

```
                         ┌───────────────────────────┐
                         │        SITE PUBLIC         │  Next.js (App Router, SSR/SSG)
                         │  SEO · i18n · Conversion   │  pages, blog, métiers, pays,
                         │  Landing pages · Jobs      │  offres, outils, ressources
                         └─────────────┬─────────────┘
                                       │  API (REST/GraphQL Payload) + Server Actions
                                       ▼
                         ┌───────────────────────────┐
                         │        API / MÉTIER        │  Payload (auth, RBAC, validation
                         │  Auth · RBAC · Validation  │  serveur, business logic, hooks)
                         └─────────────┬─────────────┘
             ┌─────────────────────────┼─────────────────────────┐
             ▼                         ▼                         ▼
     ┌───────────────┐        ┌─────────────────┐       ┌────────────────┐
     │  PostgreSQL   │        │  File storage   │       │  Meilisearch   │
     │  (Drizzle)    │        │  CV / médias    │       │  full-text     │
     │  migrations   │        │  (privé, S3-like)│      │  multicritère  │
     └───────┬───────┘        └─────────────────┘       └────────────────┘
             │
             ▼
     ┌────────────────────────────────────────────┐
     │   BACK-OFFICE (Payload Admin)               │  CMS « sans développeur » +
     │   CMS · ATS · Pipeline · CRM leads          │  ATS/vivier + suivi opportunités
     └────────────────────────────────────────────┘
```

- **Site = acquisition** · **ATS = donnée métier** · **CRM = entreprises/opportunités**. Les trois communiquent.
- Le site public **ne parle jamais directement à la base** : il passe par l'API/couche métier (validation serveur, permissions).

## 2. Découpage du monorepo (cible, mis en place en Phase 3)

```
maximerit/
├── apps/
│   └── web/                 # Next.js — site public FR (racine) + EN (/en)
├── packages/
│   ├── cms/                 # Payload : collections (CMS + ATS + CRM), RBAC, hooks, migrations
│   ├── ui/                  # Design system (composants réutilisables)
│   ├── config/              # config partagée (eslint, tsconfig, tailwind)
│   └── lib/                 # utilitaires partagés (validation zod, tracking, seo)
├── specs/                   # spécifications Spec-Driven (par phase/feature)
├── docs/                    # documentation vivante
├── scripts/                 # crawl SEO, migration, seeds, checks
└── .github/workflows/       # CI (lint, type-check, tests, build, checks SEO)
```

> Outil monorepo (pnpm workspaces + Turborepo) et co-localisation exacte Next.js/Payload
> confirmés au démarrage de la Phase 3.

## 3. Couches & flux

- **Présentation** (Next.js) : SSR/SSG pour l'indexable ; composants serveur par défaut, client uniquement si nécessaire.
- **API/métier** (Payload) : collections typées, `access control` (RBAC) par collection/champ, hooks de validation (zod), business logic.
- **Données** (PostgreSQL) : migrations versionnées ; index adaptés aux recherches réelles ; contraintes d'intégrité.
- **Recherche** (Meilisearch) : index candidats synchronisé via hooks Payload ; filtres à facettes + plein texte.
- **Fichiers** (stockage privé type S3) : CV jamais servis via URL publique indexable ; accès signé + contrôlé par RBAC.
- **Tracking** : couche `lib/tracking` → dataLayer GTM → GA4 ; UTM/source capturés côté serveur à la soumission.

## 4. Gestion des erreurs (toutes les couches)
UI (états error/empty/loading) → API (erreurs typées, pas de fuite d'info) → business → DB/service externe.
Erreurs loggées côté serveur (logs structurés), présentées proprement côté utilisateur.

## 5. Observabilité
`/health` (liveness) et `/ready` (readiness : DB + search + storage joignables). Logs structurés,
métriques, alertes. Jamais de données sensibles dans les logs.

## 6. Environnements
`local` → `staging` (non indexable, ADR-0003) → `production`. Configuration par variables
d'environnement ; secrets hors dépôt (`.env` gitignoré, `.env.example` fourni).

## 7. Modèle de domaine
Détaillé et testé en **Phase 1** (`docs/DATA_MODEL.md` + `specs/phase-1-domain-model/`). Entités
principales : User/Role/Permission, Candidate/CandidateProfile/CV/Experience/Education/Skill/Language,
Job/Application, Company/Recruiter/Lead/Opportunity, TalentPool/Note/CandidateStatus,
Country/Sector/Discipline/Specialty/Commodity, Page/Article/Resource/LandingPage/CTA,
Redirect/TrackingEvent, Tag (taxonomie administrée).

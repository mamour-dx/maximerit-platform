# Maximerit — Plateforme d'acquisition & vivier de talents (Afrique de l'Ouest)

Refonte de `maximerit.com` : d'un site vitrine WordPress vers une **infrastructure digitale**
de recrutement, d'acquisition de leads B2B et de vivier de talents, verticale prioritaire
**Mines & Ressources naturelles**.

## Méthode
Spec-Driven Development (Spec Kit). **Spec first · Code second · Test always · Gate before next phase.**
Voir `.specify/memory/constitution.md`.

## Stack (ADR-0001)
Next.js (App Router, SSR/SSG) · Payload CMS · PostgreSQL · Meilisearch · TypeScript strict.
Le scaffolding applicatif est mis en place en **Phase 3** (après GATE 0/1/2).

## Documentation
| Fichier | Contenu |
|---|---|
| `PROJECT_BASELINE.md` | État initial, audit, risques |
| `docs/ARCHITECTURE.md` | Architecture cible |
| `docs/DECISIONS.md` | ADR (décisions structurantes) |
| `docs/ROADMAP.md` | Phases & gates |
| `docs/TESTING.md` | Stratégie de test |
| `docs/SEO.md` | SEO technique & migration *(Phase 0/2)* |
| `docs/SECURITY.md` | Sécurité & données candidats *(Phase 9)* |
| `docs/DATA_MODEL.md` | Modèle de domaine *(Phase 1)* |
| `docs/DEPLOYMENT.md` | Déploiement & mise en prod *(Phase 12)* |
| `specs/` | Spécifications par phase/feature |

## État
Étapes A–F terminées. **Phase 0 (audit & migration SEO)** en cours. Voir `docs/ROADMAP.md`.

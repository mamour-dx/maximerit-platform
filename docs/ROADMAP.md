# ROADMAP.md — Plan de phases & gates

> Découpage Spec-Driven. Chaque phase : specs → conception → implémentation → tests → GATE.
> **Aucun passage de phase sans GATE = GO.** Chaque phase produit un rapport `specs/<phase>/VALIDATION.md`.

## Format d'un GATE
```
PHASE : [nom]
STATUT : Spec | Implémentation | Unit | Integration | E2E | Security | SEO | Build | Lint | Type-check | Doc
DÉCISION : GO / NO-GO
BLOQUANTS : …
ACTIONS RESTANTES : …
```

## Séquence des phases

| Phase | Objet | Livrables clés | Gate |
|---|---|---|---|
| **0** | Audit & migration SEO | Inventaire URLs, crawl, Master URL Migration File, règles 301/410, tests non-régression URLs | GATE 0 |
| **1** | Stratégie & domain model | Specs entités, taxonomie Mining, profil candidat, règles de recherche, `DATA_MODEL.md` | GATE 1 |
| **2** | Architecture UX + SEO | Arbo, URLs, silos, hreflang/canonical, maillage, pages FR/EN, sitemap logique | GATE 2 |
| **3** | Design system & socle technique | Monorepo Next.js+Payload, DB, CI, design system, composants, états, a11y | GATE 3 |
| **4** | Site public + CMS | CRUD CMS, permissions, publication/preview, metadata, redirections, LP→lead | GATE 4 |
| **5** | ATS + vivier | Formulaire candidat, parsing CV, fiche, tags, recherche full-text, pipeline, sécurité upload | GATE 5 |
| **6** | Offres & candidatures | CRUD offres, JobPosting, expiration, candidature+upload, suivi, E2E | GATE 6 |
| **7** | Contenus, outils & acquisition | Blog/guides, 4 outils (Team Planner, Salary Benchmark, Cost of Vacancy, Cost of Recruitment) | GATE 7 |
| **8** | Tracking & data | GA4/GTM/GSC/UTM, événements, dataLayer, tests de déclenchement | GATE 8 |
| **9** | Sécurité | Auth robuste, RBAC, uploads, injections, rate limit, RGPD, audit trail, dépendances | GATE 9 |
| **10** | Performance & qualité | Core Web Vitals, N+1, index, cache, load tests, gros volumes | GATE 10 |
| **11** | Migration SEO & recette | Crawl prod-like, 301/410, sitemap/robots/hreflang, smoke SEO, plan J+1/7/30/90 | GATE 11 |
| **12** | Production | Checklist mise en prod, backup, monitoring, rollback, release progressive | GATE FINAL |

> Note : la sécurité (Article VI de la constitution) et le SEO (Article V) sont traités **dès le début**
> et à chaque phase pertinente, pas seulement aux phases 9/11 qui en sont l'audit consolidé.

## Correspondance avec les livrables du cahier (§38)
01 Stratégie→P1 · 02 SEO(audit/kw)→P0/P1 · 03 Architecture→P2 · 04 UX→P2 · 05 UI→P3 ·
06 Contenus→P4/P7 · 07 SEO(mapping)→P0/P2 · 08 Développement→P3+ · 09 ATS→P5 · 10 Jobs→P6 ·
11 CRM→P4/P5 · 12 Tracking→P8 · 13 Migration→P0/P6/P11 · 14 Redirections→P0/P11 ·
15 Recette→P11 · 16 Documentation→continue · 17 Formation→P12 · 18 Monitoring→P11/P12.

## État courant
- ✅ Étapes A–F (audit, baseline, Spec Kit, architecture, plan, stratégie de test).
- ✅ **Phase 0** — GATE 0 GO (conditionnel : finalisation valeur SEO sans historique GSC, cf. ADR-0005 ; re-gate en Phase 11).
- ✅ **Phase 1** — GATE 1 GO (domain model, 21 tests verts).
- ✅ **Phase 2** — GATE 2 GO (164 routes, 9 tests SEO, bouclage migration).
- ✅ **Phase 3** — GATE 3 GO (**3a** socle Next.js 16 + design system + `@maximerit/domain` ; **3b** Payload CMS + PostgreSQL : admin, migrations, collections Users/Pages/Redirects, RBAC, /health+/ready, test d'intégration 3/3).
- ✅ **Phase 4** — GATE 4 GO (**4a** LP→Lead : CMS `LandingPages`/`Leads`, `/lp/[slug]`, `/submit-lead` validation+anti-spam+UTM, RBAC ; **4b** Pages CMS `/[...slug]` + preview brouillon + **moteur de redirections** 301/410 depuis la carte Phase 0 + `trailingSlash`). Unit 15/15, intégration 10/10, runtime vérifié.
- ✅ **Phase 5** — GATE 5 GO (**5a** intake ATS sécurisé ; **5b** parsing CV interne → proposition éditable ; **5c** recherche **Meilisearch** multicritère/plein texte + `TalentPools` + `/search-candidates`). Unit 31/31, intégration 23/23 (Postgres + Meili).
- ✅ **Phase 6** — GATE 6 GO (Offres : `/jobs/<slug>/` + **JobPosting** JSON-LD + expiration auto + sitemap Jobs ; candidatures `Applications` reliées à l'ATS via `/apply`. Unit 36/36, intégration 26/26, smoke runtime).
- ✅ **Phase 7** — GATE 7 GO (**7a** 4 outils d'acquisition testés + pages SSG + lead ; **7b** éditorial : `Articles`/`Resources`, blog listing/détail, ressources par type + contenu *gated*→lead). Unit 44/44, intégration 28/28.
- 🟡 **Phase 8** (Tracking & data) : prochaine.
- ⬜ Phases 9–12 : à venir, gate par gate.

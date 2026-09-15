# DATA_MODEL.md — Modèle de domaine (Phase 1)

> Source de vérité du modèle métier. Les vocabulaires contrôlés vivent dans `domain/enums.json`
> et `domain/taxonomy/mining.json` ; les règles exécutables dans `domain/model.mjs` (testées).
> En Phase 3, chaque entité devient une **collection Payload** (PostgreSQL, migrations versionnées).

## Conventions
- Clés primaires `id` (uuid). Horodatage `createdAt`/`updatedAt` sur toutes les entités.
- Contenu éditorial **localisé FR/EN** (Payload localization) : champs marqués `【i18n】`.
- Suppression : *soft delete* pour candidats/leads (RGPD : conservation + suppression tracée).
- Les slugs sont uniques par type et immuables une fois publiés (SEO / URL — Art. V).

## Vue d'ensemble des regroupements
| Domaine | Entités |
|---|---|
| Accès & sécurité | User, Role, Permission |
| Talents (ATS) | Candidate, CandidateProfile, CV, Experience, Education, Skill, Language, Note, CandidateStatus, TalentPool |
| Recrutement | Job, Application, Company, Recruiter, Lead, Opportunity |
| Référentiels | Country, Sector, Discipline, Specialty, Commodity, Tag |
| Contenu & acquisition | Page, Article, Resource, LandingPage, CTA |
| Technique | Redirect, TrackingEvent |

---

## 1. Accès & sécurité

### User
`id, email(unique), firstName, lastName, role(enum ROLES), isActive, mfaEnabled, lastLoginAt`.
- Relation : `role` → matrice de permissions (`domain/enums.json#permissionsMatrix`).
- Contraintes : email unique ; `role ∈ ROLES`. RBAC appliqué côté serveur (access control par collection/champ).

### Role / Permission
Modélisés en données (pas de tables libres) : rôle → `{resource: [actions]}`. `SUPER_ADMIN` = `*`.
Testé : toute action de la matrice est une action connue ; VIEWER sans `delete`/`publish`.

---

## 2. Talents (ATS)

### Candidate  (agrégat racine)
Identité + profil + relations. Champs (cahier §14, §19) :
- Identité : `firstName, lastName, email, phone, whatsapp?, countryOfResidence(ISO-2), nationality?, internationalMobility(bool)`.
- Professionnel : `currentPosition, targetSpecialty(→Specialty), targetDiscipline(→Discipline), sector(→Sector), yearsExperience(int≥0), seniority(enum), currentCompany?, salaryExpectation?, contractTypes(enum[])`.
- Disponibilité : `availabilityDays(int≥0|null)` (+ bucket dérivé), `status(enum pipeline|side)`.
- Mobilité : `mobilityScopes(enum[]), mobilityCountries(ISO-2[])`.
- Bloc **Mining** : `mining.disciplines[], mining.commodities[], mining.mineType[], mining.countriesExperience[], mining.fifoRoster(bool)`.
- Rattachements : `languages[] (→Language), experiences[] (→Experience), educations[] (→Education), skills[] (→Skill), tags[] (→Tag), cv (→CV), notes[] (→Note), source, consent(bool, obligatoire), consentAt`.
- **Doublons** (cahier §19) : clés de rapprochement `email`, `phone` → contrainte d'unicité souple + règle de merge (email exact = doublon fort ; phone normalisé = doublon probable).
- **Contraintes** : `consent=true` obligatoire ; vocabulaires validés (`validateCandidateProfile`).
- **Index** (recherche réelle, cahier §16) : `sector, targetDiscipline, seniority, yearsExperience, availabilityDays, status`, GIN sur `tags`, `mining.commodities`, `mining.countriesExperience` ; index de recherche externe (Meilisearch) sur le document candidat aplati.

### CV
`id, candidate(→Candidate), fileRef(privé, non indexable), mime(pdf|docx), sizeBytes, originalName, parsedAt?, parseStatus`. **Jamais** d'URL publique indexable (Art. VI). Le CV original reste attaché même après parsing (cahier §15).

### Experience / Education / Skill / Language
- Experience : `candidate, title, company, sector?, country(ISO-2)?, startDate, endDate?, current(bool), description`.
- Education : `candidate, degree, field, institution, year?`.
- Skill : `candidate, label, category?`. (Compétences libres, mais tags = taxonomie contrôlée.)
- Language : `candidate, code(enum), proficiency(enum)`.

### Note / CandidateStatus / TalentPool
- Note : `candidate, author(→User), body, createdAt` (notes recruteur — RBAC RECRUITER+).
- CandidateStatus : historique `{candidate, from, to, by(→User), at}` → **audit trail** des changements (cahier §18).
- TalentPool (Vivier sauvegardé) : `id, name, owner(→User), query(JSON filtres), members[] (→Candidate)`. Un vivier peut être **dynamique** (query) ou **statique** (membres figés).

---

## 3. Recrutement

### Job (Offre d'emploi)
`id, slug(unique), title【i18n】, sector(→Sector), discipline(→Discipline)?, specialty(→Specialty)?, country(ISO-2), location, mission【i18n】, responsibilities【i18n】, requirements, experienceMin, contractType(enum), status(enum job), publishedAt, expiresAt, similarJobs[]`.
- URL individuelle indexable `/jobs/<slug>/` (cahier §21) ; **Schema.org JobPosting** sur la page.
- Expiration **automatique** (`expiresAt` → `status=expiree`, retrait du sitemap).

### Application (Candidature)
`id, job(→Job)?, candidate(→Candidate), cv(→CV), status(enum application), source, utm(JSON), createdAt`.
- Candidature spontanée : `job=null`. Chaque candidature crée/rattache un Candidate + CV (recette §40 : 100 % avec CV associé).

### Company / Recruiter / Lead / Opportunity  (CRM)
- Company : `id, name, sector?, country?, size?`.
- Recruiter : profil interne (sous-ensemble de User rôle RECRUITER) — ou alias de User.
- Lead : `id, company?, contactName, jobFunction, emailPro, phone, country, sector, profileSought, headcount, level, location, desiredDate, comment, source, utm(JSON auto), status`. **UTM + source capturés automatiquement** (cahier §23).
- Opportunity : `id, company, lead?, stage, value?, owner(→User)` — transformation lead → opportunité → placement.

---

## 4. Référentiels
- Country : `code(ISO-2, unique), label【i18n】, priority(int|null)` — 7 pays prioritaires.
- Sector : `slug(unique), label【i18n】, priority(bool)` — Mining prioritaire.
- Discipline / Specialty : issus de `taxonomy/mining.json` (Secteur→Discipline→Spécialité). Specialty `slug` unique, placement canonique unique ; `crossRefs` pour rôles transverses.
- Commodity : `slug(unique), label【i18n】`.
- Tag : **taxonomie administrée** (cahier §17) — `slug(unique), label, category` ; pas de création libre (contrôle qualité de la base).

---

## 5. Contenu & acquisition
- Page : `slug, title【i18n】, body【i18n】, seo(meta), status(draft|published), locale`.
- Article (blog) : `slug, title【i18n】, body【i18n】, category, author, publishedAt, seo`, relations de maillage interne (→ fiche métier, → secteur).
- Resource : guides, études, baromètres, **outils gratuits** (Team Planner, Salary Benchmark, Cost of Vacancy, Cost of Recruitment) — `type, slug, title, gated(bool), leadForm?`.
- LandingPage : indépendante des pages institutionnelles ; structure Promesse→Problème→Profils→Méthode→Preuves→CTA→Formulaire ; `slug(/lp/…), blocks[], form(→Lead), tracking`.
- CTA : `label, href, event(enum trackingEvents)` réutilisable.

---

## 6. Technique
- Redirect : `from(path, unique), to(path), type(301|410|NOINDEX), note`. Alimenté par le Master URL Migration File (Phase 0) ; appliqué côté serveur, **sans chaîne**.
- TrackingEvent : `name(enum trackingEvents), params(JSON), utm(JSON), sessionId, at`. Versionné/documenté (Phase 8).

---

## Relations (résumé)
```
User 1─* Note, TalentPool, Opportunity
Candidate 1─1 CV ; 1─* Experience/Education/Skill/Language/Note ; *─* Tag ; 1─* Application ; *─* TalentPool
Job 1─* Application ; Job *─1 Sector ; Job *─1 Specialty/Discipline (opt) ; Job *─1 Country
Company 1─* Lead ; Lead 1─? Opportunity
Sector 1─* Discipline 1─* Specialty ; Commodity/Country = référentiels transverses
LandingPage 1─1 Form → Lead ; Article *─* (maillage) Page/Fiche/Secteur
```

## Traçabilité vers les specs
Règles exécutables & tests : `domain/model.mjs`, `scripts/tests/domain.test.mjs` (21 tests).
Critères d'acceptation & cas limites : `specs/phase-1-domain-model/spec.md`.

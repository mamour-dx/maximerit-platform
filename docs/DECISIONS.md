# Architecture Decision Records (ADR)

Journal des décisions structurantes. Format léger : Contexte / Décision / Statut / Conséquences / Alternatives.

---

## ADR-0001 — Stack technique de la plateforme

- **Statut** : ✅ Accepté (validé par le client, 2026-09-09)
- **Contexte** : Le cahier des charges (§35) impose une architecture de responsabilités (Site public / API / Application ATS / CRM) et des exigences dures (SSR crawlable, PostgreSQL, CMS sans-développeur, ATS ≠ WordPress, recherche full-text, parsing CV, RBAC, RGPD-like) mais aucune technologie.
- **Décision** : **Monorepo TypeScript** :
  - **Next.js** (App Router) pour le **site public** — SSR/SSG, SEO, Core Web Vitals, i18n/hreflang, Schema.org.
  - **Payload CMS** (auto-hébergé, sur le même PostgreSQL) pour le **CMS administrable sans développeur** et la modélisation métier (pages, articles, métiers, pays, offres, landing pages, CTA, redirections, tags, users/RBAC, candidats/ATS).
  - **PostgreSQL** comme base unique.
  - **Meilisearch** (ou Typesense) pour la recherche multicritère + plein texte du vivier.
  - **ORM** : l'ORM natif de Payload (Drizzle) ; migrations versionnées.
- **Conséquences** :
  - Une seule techno front/back → maintenabilité et recrutement d'équipe simplifiés.
  - Séparation site/app respectée : le site public consomme l'API Payload ; l'ATS est un module applicatif, pas des contenus WordPress.
  - Le site WordPress actuel n'est **pas** repris (contenu migré, URLs conservées via redirections — cf. Phase 0/6).
  - Le `create-next-app` / init Payload intervient en **Phase 3** (socle technique), après GATE 0/1/2.
- **Alternatives écartées** : WordPress + app séparée (dette WP, 2 stacks) ; Laravel + Filament (PHP, moins JS moderne) ; Next.js + NestJS + Strapi (effort/surface de maintenance supérieurs).

---

## ADR-0002 — Stratégie d'URL et de langue (i18n)

- **Statut** : ✅ Accepté (dérive du cahier §8 et de l'existant)
- **Contexte** : Site actuel = FR à la racine + EN sous `/language/en/` (WPML). Le cahier (§8) exige des URL distinctes par langue reliées par `hreflang`, sans traduction auto brute, et (§32) la conservation de l'antériorité SEO.
- **Décision** :
  - Français conservé **à la racine** (`maximerit.com/…`) pour préserver l'antériorité SEO du domaine.
  - Anglais servi sous préfixe **`/en/…`**.
  - `hreflang` réciproques + `canonical` auto-référencées sur chaque page indexable.
  - Toute ancienne URL EN (`/language/en/…`) redirigée en **301** vers `/en/…` équivalent (Master URL Migration File).
- **Conséquences** : structure i18n à implémenter dans Next.js + Payload (localization) ; à valider en Phase 2 (GATE 2) avec tests hreflang/canonical.
- **Alternatives** : `/fr/` + `/en/` symétriques (rejeté : casserait l'antériorité des URL FR racine actuelles).

---

## ADR-0003 — Environnement de migration (staging isolé)

- **Statut** : ✅ Accepté (cahier §29)
- **Contexte** : « La refonte ne doit jamais démarrer par la suppression du site actuel. » Développement dans un environnement séparé ; staging non indexable.
- **Décision** : Production actuelle reste en ligne → développement sur staging isolé (`Disallow: /` + `noindex` + protection d'accès) → recette → bascule avec activation des 301 → nouvelle production.
- **Conséquences** : pipeline de déploiement et checklist de mise en production (cahier §34) à outiller en Phase 6/12.

---

## ADR-0004 — Fournisseur de parsing CV

- **Statut** : 🕓 En attente (à trancher en Phase 1/5)
- **Contexte** : §15 exige extraction éditable/validable (nom, poste, expériences, employeurs, dates, formation, compétences, langues, pays, certifications) depuis PDF/DOCX.
- **Options envisagées** : service tiers (Affinda, Sovren/Textkernel, HrFlow.ai) vs. pipeline interne (extraction texte `pdf-parse`/`mammoth` + LLM structuré). Impact RGPD (données candidats envoyées à un tiers) à évaluer.
- **Décision** : à documenter en Phase 5 après spécification détaillée et évaluation coût/RGPD/qualité.

---

## ADR-0005 — Stratégie de données de valeur SEO (sans historique Search Console)

- **Statut** : ✅ Accepté (2026-09-09, suite à info client)
- **Contexte** : Le client **n'a jamais utilisé Google Search Console** → aucun historique de clics/impressions/positions disponible. La couche « valeur » qui devait finaliser les 116 lignes `PENDING_GSC` de la carte de migration doit s'appuyer sur d'autres signaux.
- **Décision** :
  1. **Créer et vérifier la propriété GSC dès maintenant** (même sans historique) : elle est indispensable pour la soumission du sitemap et le suivi J+1/7/30/90 **après** migration (cahier §34), et commencera à accumuler des données.
  2. Pour l'arbitrage **avant** migration, utiliser les signaux disponibles, par ordre : (a) GA4/analytics existant s'il y en a un ; (b) export backlinks (Ahrefs/Semrush free/ Search Console tiers) pour repérer les URL à liens entrants ; (c) logs serveur si accessibles ; à défaut (d) **règle conservatrice par défaut** : `KEEP`/`301` vers destination pertinente, **jamais de 410**, pour ne détruire aucune valeur inconnue (constitution Art. V).
  3. `PENDING_GSC` est réinterprété comme **`PENDING_VALUE`** : « destination proposée, arbitrage KEEP/301/410 à confirmer avec tout signal de valeur disponible ». En l'absence de tout signal, la valeur par défaut 301 est considérée comme la décision finale sûre.
- **Conséquences** : la carte de migration reste **exploitable et sûre** même sans GSC (0 × 410 = aucune destruction). Le risque résiduel se limite à conserver quelques URL de faible valeur — sans impact négatif SEO.
- **Question ouverte au client** : disposez-vous d'un **Google Analytics** (même ancien) ou d'un accès à l'hébergement pour les **logs d'accès** ? Sinon on applique la règle conservatrice (d).

---

## ADR-0006 — Base de données locale & intégration Payload dans Next

- **Statut** : ✅ Accepté (2026-09-20 ; réversible)
- **Contexte** : Phase 3. Environnement de dev sans PostgreSQL local et démon Docker arrêté. Payload 3 est conçu pour être monté **dans** l'app Next (routes `app/(payload)`), pas en package séparé.
- **Décision** :
  1. **PostgreSQL via `docker-compose`** en dev (service `db`), + Meilisearch (`search`). Base unique Postgres sur tous les environnements (pas de SQLite, cohérence de schéma).
  2. **Payload monté dans `apps/web`** (idiome Payload 3) plutôt qu'un package `packages/cms` séparé — affine la vue de `docs/ARCHITECTURE.md` (§2) : le CMS/ATS reste une frontière logique (collections + access control), mais physiquement co-localisé avec le site pour une seule app déployable.
  3. Le domaine partagé reste isolé en `packages/domain` (source unique, consommée par l'app et les scripts).
- **Conséquences** :
  - Le socle **front** (Next 16, design system, domaine, CI) est livrable et vérifiable **sans** DB (build SSG vert).
  - Le boot Payload + migrations exige le démon Docker actif → sous-phase **3b** (voir `specs/phase-3-socle/`).
- **Alternatives écartées** : base gérée (Neon/Supabase) — possible plus tard sans changer le code (juste `DATABASE_URI`) ; SQLite dev — écarté pour cohérence de schéma.

# PROJECT_BASELINE.md — Maximerit

> État initial du projet au démarrage de la refonte.
> Rédigé lors de l'**Étape B** de la première mission (audit avant tout code).
> Date : 2026-09-09.

---

## 1. Résumé exécutif

Maximerit veut transformer son site vitrine WordPress (`www.maximerit.com`) en une
**infrastructure digitale de recrutement, d'acquisition de leads B2B et de vivier de talents**
pour l'Afrique de l'Ouest, avec une **verticale prioritaire Mines & Ressources naturelles**.

Le projet n'est **pas** une refonte cosmétique : il doit livrer 4 systèmes interconnectés
(cf. « Résultat cible » du cahier des charges) :

| Système | Rôle |
|---|---|
| **MAXIMERIT.COM** | Autorité + acquisition (site public, SEO, landing pages, outils) |
| **MAXIMERIT CONTENT** | Couverture SEO et expertise (CMS, blog, fiches métiers, guides) |
| **MAXIMERIT TALENT** | Vivier propriétaire de compétences (ATS, parsing CV, recherche) |
| **MAXIMERIT CRM** | Transformation entreprises → clients (leads, opportunités) |

Le dépôt local est **vierge** au démarrage : il n'existe aucun code applicatif à reprendre.
La « baseline technique » à auditer est donc **le site WordPress en production** (dont on ne
reprend pas le code) et **les deux documents stratégiques** fournis, qui font foi.

---

## 2. Documents de référence (source de vérité)

| Document | Nature | Statut |
|---|---|---|
| `MAAXIMERIT focus strategie digitale 12 mois.pdf` (12 p.) | Stratégie business/marque/SEO/contenu | Source de vérité stratégique |
| `MAAXIMERIT Refonte site cahier des charges.pdf` (28 p.) | Cahier des charges technique/fonctionnel | Source de vérité produit |

Les deux ont été lus intégralement. Les extraits clés sont recopiés dans les specs
(`specs/000-baseline/source-of-truth.md`).

---

## 3. Architecture ACTUELLE (site en production)

Auditée par reconnaissance publique (lecture seule) le 2026-09-09.

- **CMS** : WordPress (chemins `/wp-content/` présents, thème + plugins WordPress).
- **Hébergement / contact** : Dakar, Sénégal — `contact@maximerit.com`, +221 33 824 46 06.
- **Langues** : Français à la racine ; Anglais via `/language/en/` (structure typée WPML).
- **Navigation actuelle** (juxtaposition de prestations, à restructurer) :

| Rubrique actuelle | URL actuelle |
|---|---|
| Accueil | `/` |
| Conseil et Formation | `/conseils/` |
| ESG / Finances | `/esg/` |
| Gestion RH | `/gestion-paie-et-des-declarations/` |
| QHSE / SST | `/mise-en-place-dune-politique-qhse/` |
| Services généraux | `/accueil-et-integration/` |
| Support IT | `/maintenance-des-systemes-informatiques-et-reseaux/` |

> ⚠️ L'inventaire d'URL ci-dessus est **partiel** (issu de la navigation principale). L'inventaire
> exhaustif est un livrable de la **Phase 0** (crawl complet + export Search Console + Analytics + backlinks).

### Écarts structurants entre l'existant et la cible

| # | Constat sur l'existant | Cible (cahier des charges) | Impact |
|---|---|---|---|
| E1 | EN servi sous `/language/en/` | `/en/…` + `hreflang` + URL distinctes par langue | Migration SEO bilingue à cartographier |
| E2 | Aucune verticale sectorielle, aucune présence Mining | Hub `/mines/` + 4 piliers + silos SEO | Création de tout le territoire Mining |
| E3 | Site = juxtaposition de prestations | Organisation marchés / métiers / preuves | Refonte de l'architecture d'information |
| E4 | Pas d'ATS, pas de vivier, pas de parsing CV | Module applicatif ATS + base talents | Nouveau système applicatif à construire |
| E5 | Pas de landing pages d'acquisition ni de tracking structuré | LP + GA4/GTM/GSC + UTM + événements | Nouveau dispositif d'acquisition |
| E6 | CMS WordPress généraliste | CMS éditable « sans développeur » **mais** ATS **hors** WordPress | Choix de stack structurant (cf. §7) |

---

## 4. Stack cible — NON figée à ce stade

Le cahier des charges (**§35 Stack et architecture**) impose une **architecture de responsabilités**,
**pas** une technologie précise :

```
MAXIMERIT.COM
   ├── SITE PUBLIC  (CMS / SEO / Blog / Landing pages / Jobs / Outils / Ressources)
   └── APPLICATION  (ATS / TALENT DB : Candidats / CV / Tags / Recherche / Pipeline)
                    reliés par une API — + CRM (entreprises / opportunités)
```

Contraintes techniques dures extraites du cahier (§28, §35, §36) :

- Rendu **HTML crawlable** (SSR/SSG), URLs propres, HTTPS, responsive, Core Web Vitals.
- CMS **administrable sans développeur** (pages, articles, métiers, pays, offres, LP, CTA, metadata, redirections, tags, users…).
- Base candidats = **module applicatif**, explicitement **pas** des contenus WordPress.
- Recherche **multicritère + plein texte** sur le vivier.
- **Parsing CV** PDF/DOCX avec extraction éditable/validable.
- Bilingue réel FR/EN (URLs distinctes + hreflang), pas de traduction auto brute.
- Balisage **Schema.org** (Organization, BreadcrumbList, Article, JobPosting…).
- Sécurité renforcée données candidats (RBAC, chiffrement transport, stockage CV sécurisé, journalisation, RGPD-like : consentement / conservation / suppression / export).

> **Décision de stack = structurante et irréversible → soumise à validation (cf. `docs/DECISIONS.md`, ADR-0001).**
> Aucune ligne de code applicatif n'est écrite avant cette validation.

---

## 5. Commandes / outillage

À ce stade, **aucune** commande de build/test n'existe (dépôt vierge). Elles seront définies
en Phase 3 (socle technique) une fois la stack validée, puis documentées dans `README.md` et `docs/TESTING.md`.

Outillage déjà en place :
- Dépôt Git initialisé.
- Arborescence `docs/`, `specs/`, `scripts/`, `.github/workflows/`.
- `.gitignore` (secrets, `node_modules`, artefacts de build/test).

---

## 6. Tests existants

Aucun. La stratégie de test globale est définie dans `docs/TESTING.md` et appliquée
phase par phase (chaque feature arrive avec ses tests — cf. règle §5 des instructions).

---

## 7. Problèmes connus / dépendances bloquantes

| # | Problème | Nature | Blocage |
|---|---|---|---|
| P1 | Stack technique non tranchée | Décision structurante | Bloque le code (Phase 3+), **pas** les specs (Phases 0–2) |
| P2 | Données SEO de valeur (impressions, clics, positions, backlinks) non fournies | Dépendance data | Bloque la partie « valeur » de l'audit Phase 0 |
| P3 | Accès Google Search Console / Analytics / export backlinks non fournis | Accès tiers | Idem P2 |
| P4 | Accès staging/hébergement cible non défini | Accès infra | Bloque Phase 6 (migration) et Phase 12 (prod) |
| P5 | Fournisseur de parsing CV non choisi | Décision technique | Bloque Phase 5 (ATS) — à trancher en Phase 1/5 |

> Ce que je **peux** faire seul sans ces accès : crawl technique de la partie publique
> (URLs, codes HTTP, title, H1, canonical, hreflang, liens internes, profondeur). Ce que je
> **ne peux pas** produire seul : impressions/clics/positions (GSC) et backlinks (outil tiers).

---

## 8. Dette technique (héritée / à éviter)

- Héritée : structure d'URL EN non standard (`/language/en/`), architecture vitrine sans silos SEO.
- À éviter dès le départ (interdits, cf. §33 des instructions) : secrets dans Git, contournement
  des permissions, endpoints sans validation, logique métier dans l'UI, tests désactivés pour faire
  passer le build, changement d'URL sans justification.

---

## 9. Risques

| # | Risque | Gravité | Mitigation |
|---|---|---|---|
| R1 | Perte de trafic/positions à la migration | Élevée | Phase 0 obligatoire + Master URL Migration File + tests de non-régression 301/410 + suivi J+1/7/30/90 |
| R2 | Sous-estimation de l'ATS (parsing, recherche, RBAC, RGPD) | Élevée | Traiter l'ATS comme un produit à part entière, phasé et testé (Phase 5) |
| R3 | Sur-génération de pays/pages quasi-dupliquées | Moyenne | Une page pays seulement si valeur locale spécifique (cahier §7) ; tests d'unicité de contenu |
| R4 | Fuite de données candidats / CV indexés | Élevée | Aucun CV sur URL publique indexable ; RBAC ; chiffrement ; audit sécurité (Phase 9) |
| R5 | CMS pas réellement autonome pour l'équipe | Moyenne | Critère d'acceptation « sans développeur » testé en Phase 4 + formation (livrable 17) |
| R6 | Dépendances data/accès non fournies à temps | Moyenne | Découpler : avancer specs (Phases 0–2) pendant l'obtention des accès |

---

## 10. Recommandations immédiates

1. **Trancher la stack** (ADR-0001) — c'est le seul blocage du chemin critique côté code.
2. **Obtenir les accès SEO** (GSC, Analytics, export backlinks) pour compléter la valeur de l'audit Phase 0.
3. **Confirmer le modèle de collaboration par phases avec gates** (aucun passage de phase sans validation).
4. Démarrer immédiatement le travail **stack-agnostique** : specs domain model, architecture SEO/UX, plan de migration d'URL (Phases 0–2), en parallèle de l'obtention des accès.

---

## 11. Prochaine étape

- Étapes C→F de la première mission : Spec Kit, architecture cible, plan de phases, stratégie de test
  (docs en cours de création).
- Puis **Phase 0** (audit + migration SEO), avec **GATE 0** obligatoire avant la Phase 1.

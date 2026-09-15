# UX_SEO.md — Architecture d'information, URLs & SEO (Phase 2)

> Registre de routes exécutable : `specs/phase-2-ux-seo/route-registry.json` (généré par
> `npm run seo:routes` depuis la taxonomie + référentiels de la Phase 1). 164 routes (84 FR / 80 EN).
> Tests : `scripts/tests/routes.test.mjs`.

## 1. Navigation principale (menu court)
```
Accueil
Entreprises ▸ Recrutement · Executive Search · Intérim & mise à disposition ·
              Externalisation RH & Paie · Finance & Performance · QHSE & ESG · Formation
Secteurs    ▸ Mines & Ressources naturelles [→ hub /mines/] · Énergie · Pétrole & Gaz ·
              BTP & Infrastructures · Industrie · Services
Mines & Resources ▸ Recrutement minier · Géologie & Exploration · Exploitation & Opérations ·
              Finance · Leadership & Executive Search · Métiers miniers · Vivier Mining
Candidats   ▸ Offres d'emploi · Déposer mon CV · Rejoindre le vivier · Conseils carrière
Ressources  ▸ Blog · Guides · Baromètres · Fiches métiers · Outils gratuits · Études
À propos · Contact
```
Les sous-pages SEO (52 fiches métiers, 7 pages pays, articles) **ne sont pas** toutes dans la nav
principale (cahier §2) — elles vivent dans les silos et le maillage interne.

## 2. Plan d'URL (silos Mining — clusters sémantiques)
```
/mines/                                  (hub — H1 « Recrutement minier en Afrique de l'Ouest »)
├── /mines/recrutement-minier/           (page commerciale — niveau 1)
├── /mines/geologie-exploration/         (discipline)
│   └── /mines/metiers/<metier>/         (geologue-d-exploration, resource-geologist, hydrogeologue…)
├── /mines/exploitation-miniere/
│   └── /mines/metiers/<metier>/         (mining-engineer, mine-planning-engineer, mine-manager…)
├── /mines/finance-miniere/
│   └── /mines/metiers/<metier>/         (cfo, financial-controller-mining, cost-controller…)
├── /mines/executive-search-mining/      (leadership)
├── /mines/metiers/                      (listing fiches métiers)
├── /mines/vivier/                       (vivier Mining)
└── /mines/<pays>/                       (senegal, guinee… — SEO géographique, si valeur locale)
```
Offres individuelles : `/jobs/<slug>/` (Schema.org JobPosting). Landing pages : `/lp/<campagne>/`.

## 3. SEO — 4 niveaux de requêtes (annotés `seoLevel` sur chaque route)
| Niveau | Intention | Destination | Exemple |
|---|---|---|---|
| **1 Commercial** | lead entreprise immédiat | page commerciale | `/mines/recrutement-minier/`, `/entreprises/recrutement/` |
| **2 Métier** | longue traîne | page métier/expertise | `/mines/metiers/resource-geologist/` |
| **3 Informationnel** | éduquer/qualifier | article → expertise → formulaire | `/ressources/guides/…` |
| **4 Géographique** | pays | page pays (si valeur locale) | `/mines/senegal/`, `/mines/guinee/` |
Objectif : **topical authority** autour du recrutement/compétences en Afrique de l'Ouest, Mining prioritaire.

## 4. Matrice MÉTIER × SECTEUR × PAYS
Générée depuis la taxonomie (26 métiers) × secteurs (Mining prioritaire) × 7 pays. **Une page pays
n'existe que si elle apporte une information locale spécifique** (cahier §7) — les routes pays
portent `requiresLocalContent=true` ; pas de génération massive de pages quasi-dupliquées.

## 5. FR / EN (ADR-0002)
- FR à la racine (`/…`), EN sous `/en/…`. URLs distinctes par langue.
- `hreflang` réciproques par `hrefGroup` (testé) ; `canonical` auto-référencée.
- Pages `singleLocale` explicites (certaines LP de campagne, 404) — exemptées de la réciprocité.
- Pas de traduction auto brute ; expressions EN = recherche SEO propre.

## 6. Maillage interne
Chaque route a un `parent` (fil d'Ariane) résolu et testé (0 orpheline). Chaînes de maillage cibles :
```
Article → Fiche métier → Page discipline → Page commerciale → Conversion (formulaire)
Article → Offres d'emploi → Candidature → Vivier
```
Chaque contenu a une **destination de conversion** (CTA typé événement de tracking).

## 7. Indexabilité
- Indexable : pages de contenu (commercial, métier, secteur, pays avec contenu, articles, LP SEO).
- Non indexable : `/404/`, staging (ADR-0003), CV et pages applicatives privées (ATS).
- Sitemap XML généré depuis le registre (routes indexables) ; sitemap Jobs dédié (offres).

## 8. Bouclage avec la migration (Phase 0)
Test automatisé : **100 % des cibles KEEP/301** du Master URL Migration File correspondent à une
route réelle du registre — aucune redirection ne pointe vers une page inexistante.

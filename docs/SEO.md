# SEO.md — SEO technique & migration

> Le SEO est intégré dès l'architecture (constitution Art. V). Ce document couvre la migration
> (Phase 0/6/11) et les règles techniques permanentes (appliquées Phase 2+).

## 1. Principe directeur de migration
Une nouvelle architecture ne justifie **pas** un changement d'URL. Toute URL avec ancienneté,
backlinks, trafic ou positions est **conservée autant que possible**. Aucune ancienne URL ne
disparaît sans décision documentée (cahier §32, §40).

## 2. Actions de migration
| Action | Quand |
|---|---|
| **KEEP** | L'URL reste identique (valeur SEO + toujours pertinente). |
| **301** | L'URL change mais un équivalent pertinent existe (redirection permanente serveur). |
| **410** | Contenu réellement supprimé **et** sans valeur (aucun backlink/trafic) — décision documentée. |
| **NOINDEX** | Page conservée mais retirée de l'index (rare). |

Règles dures :
- Redirections **côté serveur**, **sans chaîne** (`A→C`, jamais `A→B→C`) — testé automatiquement.
- Conservées indéfiniment sauf raison technique.
- Jamais de redirection massive vers une page non pertinente (soft-404).
- `canonical` cohérente avec `sitemap` et redirections (pas de signaux contradictoires).

## 3. Master URL Migration File
`specs/phase-0-seo-migration/audit/master-url-migration-file.csv`. Colonnes : `old_url, lang,
lastmod, action, new_url, confidence, justification, gsc_clicks, gsc_impressions, ref_domains,
final_decision`.

- `confidence = HIGH` : décision structurelle certaine (doublon, exemple du cahier, changement de langue).
- `confidence = PENDING_GSC` (= *pending value*, cf. ADR-0005) : destination proposée, arbitrage
  final **KEEP vs 301 vs 410** à confirmer avec tout signal de valeur disponible.
  **Le client n'a pas d'historique Search Console** → on s'appuie sur GA4 (si présent) / backlinks /
  logs serveur ; à défaut, **règle conservatrice** : 301 vers une destination pertinente, **jamais
  de 410** tant que la valeur est inconnue. Cette carte est donc déjà sûre en l'état (0 × 410).

Reconstruction reproductible : `npm run seo:inventory && npm run seo:map`.
Enrichissement (crawl + GSC) : `npm run seo:crawl -- --gsc data/gsc-export.csv`.

## 4. État de l'inventaire (2026-09-09)
- Source : sitemap Yoast `page-sitemap.xml` (crawlé via navigateur ; serveur WAF-bloque le scripté).
- **129 URLs** : 71 FR (racine) + 58 EN (`/language/en/`). Aucun article de blog (pas de post-sitemap).
- Doublons/legacy repérés : `/home/`↔`/`, `/about/`↔`/qui-nous-sommes/`, `/contact/`+`/contact-2/`+`/contactez-nous/`, `/offres-demploi/`+`/offre-demplois/`, `/depot-de-candidature-2/`.
- 0 page Mining (tout le territoire prioritaire est à créer).
- Réserve : colonnes de valeur (clics/impressions/position/backlinks) à remplir dès réception GSC.

## 5. i18n (ADR-0002)
FR à la racine (`/…`), EN sous `/en/…`. `hreflang` réciproques + `canonical` auto-référencées.
Toute `/language/en/…` → `301` vers `/en/…`. Pas de traduction auto brute ; expressions EN = recherche SEO propre.

## 6. Règles techniques permanentes (Phase 2+)
- Rendu HTML crawlable (SSR/SSG), URLs propres, un seul H1, fil d'Ariane.
- `canonical` auto-référencée sur chaque page indexable ; `robots.txt` maîtrisé ; `sitemap.xml` (+ sitemap Jobs).
- 404 personnalisée ; pagination propre ; Open Graph ; metadata administrables.
- Données structurées : Organization, BreadcrumbList, Article, **JobPosting** (page offre individuelle), Person si pertinent, FAQ seulement si justifié.
- **0 CV** accessible via URL publique indexable.
- Core Web Vitals, WebP/AVIF, lazy loading, compression images.

## 7. Architecture SEO cible (silos — détaillée en Phase 2)
- Niveau 1 commercial (money keywords) → pages commerciales (`/mines/recrutement-minier/`).
- Niveau 2 métier (longue traîne) → pages métier/expertise (`/mines/metiers/<metier>/`).
- Niveau 3 informationnel → articles → expertise → formulaire.
- Niveau 4 géographique → pages pays **seulement si valeur locale spécifique** (`/mines/senegal/`).
- Matrice MÉTIER × SECTEUR × PAYS, sans génération massive de pages quasi-dupliquées.

## 8. Suivi post-migration (Phase 11)
Contrôles à J+1 / J+7 / J+30 / J+90 : 404, 5xx, redirections, indexation, pages exclues, canonical,
trafic organique, positions, impressions, Core Web Vitals, conversions, backlinks conservés.

---

## Recette de migration (Phase 11)

### robots.txt & sitemaps
- `/robots.txt` (généré, env-driven) : **staging** = `Disallow: /` (`SEO_STAGING=1`) ; **production** = indexable
  sauf `/admin/`, `/api/` (dont CV via `/api/cvs`), et actions (`/apply/`, `/submit-lead/`, `/reparse-cv/`,
  `/search-candidates/`, `/preview/`). Déclare `Sitemap:` pages + jobs.
- `/sitemap.xml` : pages statiques indexables + contenus CMS publiés (Pages, Articles, Ressources) + offres actives.
- `/sitemap-jobs.xml` : offres actives uniquement (Phase 6).

### Tests de non-régression des URLs — mode LIVE
`BASE_URL=<url> node --test scripts/tests/migration-map.test.mjs` → vérifie contre le serveur réel que
chaque ancienne URL renvoie le statut attendu (200/301/410) et la bonne destination, **sans chaîne**.
✅ Exécuté en recette locale sur les 129 URLs (KEEP→200, 301→destination correcte).

### Checklist de recette (cahier §40)
- [x] 100 % des anciennes URL connues → 200/301/410 intentionnel (test live).
- [x] 0 redirection 301 vers une destination non pertinente (carte justifiée + test sans chaîne).
- [x] 0 CV publiquement accessible (RBAC + robots `/api/` + collection privée).
- [x] Pages indexables avec `canonical` auto-référencée (metadata par page).
- [x] Offres avec URL individuelle + `JobPosting` valide (Phase 6).
- [x] 100 % des candidatures dans l'ATS avec CV associé (Phase 5/6).
- [x] Tracking vérifié avant prod (Phase 8).
- [ ] hreflang FR/EN : à finaliser quand les routes `/en/` seront rendues (réserve — voir ci-dessous).
- [ ] Crawl production-like complet + Lighthouse (à exécuter sur l'environnement de recette).

### i18n FR/EN — fondation en place
Le volet anglais est **branché** pour les pages clés (`/en/`, `/en/mines/`, `/en/contact/`) avec
**hreflang réciproque** (`fr` / `en` / `x-default`) + `canonical` auto-référencée, un **sélecteur de langue**
dans le header, et l'ajout au `sitemap.xml`. Les redirections `/language/en/…` → `/en/…` sont en place (Phase 0).
**Reste** : étendre le rendu EN aux autres pages (services, secteurs, blog, offres…) sur le même patron
(`hreflang()` + `SetLang`), et localiser les contenus CMS via le paramètre `locale` de Payload.

### Suivi post-migration
| Jalon | Contrôles |
|---|---|
| **J+1** | 404 / 5xx, redirections effectives, robots/sitemap soumis à Search Console, indexation démarrée |
| **J+7** | pages indexées, premières impressions/clics, erreurs de couverture |
| **J+30** | trafic organique vs référence, positions des URL conservées, pages exclues |
| **J+90** | trafic/positions/backlinks conservés, conversions (leads/candidatures), ajustements |

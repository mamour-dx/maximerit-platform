# Phase 12 — Validation (GATE FINAL)

## Objectif
Mise en production : procédure, checklist, sauvegardes, monitoring, rollback, release progressive.

## Checklist de mise en production (cahier §34)
| Item | Statut |
|---|---|
| Build production OK | ✅ (`next build`, 33 pages) |
| Tests OK | ✅ (unit 59/59, intégration 39/39, CI verte) |
| Migrations DB vérifiées | ✅ (`payload migrate` versionné, appliqué en CI sur base fraîche) |
| Backup | 🔧 config infra (base gérée + stockage objet) — procédure documentée |
| Variables d'environnement | ✅ listées (`DEPLOYMENT.md §2`) |
| Secrets hors code | ✅ (`.env` gitignoré, injectés par l'hébergeur) |
| Monitoring | 🔧 `/health`+`/ready` prêts ; sondes à brancher |
| Logs | ✅ stdout structuré ; agrégateur à brancher |
| Alertes | 🔧 à câbler (5xx, `/ready`, latence) |
| Rollback | ✅ plan documenté (DNS réversible, redeploy, migration down) |
| Sitemap | ✅ `/sitemap.xml` + `/sitemap-jobs.xml` |
| Robots | ✅ env-driven (staging/prod) |
| Redirects | ✅ 129 URLs, testés en mode LIVE |
| Analytics | ✅ GA4/GTM/GSC prêts (IDs client), consentement |
| Formulaires | ✅ leads + candidatures (validation, anti-spam, UTM) |
| Candidature | ✅ reliée à l'ATS + CV |
| ATS | ✅ intake, parsing, vivier, recherche |
| Permissions | ✅ RBAC audité |
| Sécurité | ✅ en-têtes, 0 vuln, `SECURITY.md` |
| Performance | ✅ recherche 3000 <150ms, index, rendu optimisé |

🔧 = prêt côté code, **configuration à réaliser sur l'infrastructure de production** (client/hébergeur).

## Statut du gate
```
PHASE : 12 — Production
Specification PASS · Implementation PASS · Build PASS · Documentation PASS
Checklist §34 : items code = PASS ; items infra = prêts (config prod à réaliser)
DÉCISION : GO (production-ready)
```

## Décision
**GO — plateforme production-ready.** Le code est complet, testé et validé en CI à chaque commit.
La **mise en ligne effective** est une étape d'infrastructure côté client : provisionner les composants
(`DEPLOYMENT.md §1/§11`), exécuter la recette sur staging, puis basculer (DNS + 301 + sitemap) avec
rollback prêt.

## Réserves finales
- Volet **/en/** (hreflang) à brancher avant ouverture anglaise.
- Durcissements prod (CSP stricte, MFA, Redis, S3, email) à activer.
- Finalisation « valeur » de la carte de migration avec les données réelles (ADR-0005).

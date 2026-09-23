# Spec — Phase 12 : Production

## Besoin
Rendre la plateforme déployable en production de façon sûre et réversible : procédure, bascule SEO,
sauvegardes, monitoring, rollback, release progressive.

## Critères d'acceptation
1. Procédure de déploiement documentée (build, migrations, bascule, sitemap) — `docs/DEPLOYMENT.md`. ✅
2. Checklist de mise en production (cahier §34) renseignée. ✅
3. Plan de **rollback** (DNS réversible, redéploiement, migrations down, backup) + release progressive. ✅
4. Endpoints d'observabilité `/health` + `/ready`. ✅
5. Liste des variables/secrets prod et des composants à provisionner (client). ✅
6. Durcissements production listés (CSP, MFA, Redis, S3, email). ✅

## Livrables
- `docs/DEPLOYMENT.md` (déploiement + bascule + rollback + monitoring + à fournir par le client).
- Checklist §34 dans `VALIDATION.md`.

## Réserves (dépendent de l'infra client, hors code)
- Sauvegardes/monitoring/alertes : à câbler sur la plateforme d'hébergement choisie.
- Stockage CV S3 privé + adaptateur email : à activer en prod (interfaces prêtes).
- Recette finale sur environnement staging réel + Lighthouse.
- Volet **/en/** (hreflang) à brancher avant ouverture anglaise.

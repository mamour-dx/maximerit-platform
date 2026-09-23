# DEPLOYMENT.md — Déploiement & production (Phase 12)

> Procédure de mise en production, bascule SEO, rollback et suivi. Complète `docs/SECURITY.md`
> (durcissements) et `docs/SEO.md` (recette/migration).

## 1. Composants à provisionner
| Composant | Rôle | Fourni par |
|---|---|---|
| App **Next.js + Payload** | site public + admin + API | déploiement (Node 20+) |
| **PostgreSQL** (gérée) | base unique | client (Neon/Supabase/RDS…) |
| **Meilisearch** (gérée/VM) | recherche du vivier | client / infra |
| **Stockage objet privé (S3-like)** | fichiers CV (privés, chiffrés) | client |
| **SMTP** | emails transactionnels (leads, admin) | client |
| **Domaine + HTTPS** | `maximerit.com` | client |

## 2. Variables d'environnement (production)
```
DATABASE_URI=postgres://…              # base gérée
PAYLOAD_SECRET=<secret fort aléatoire>
MEILI_HOST=https://…                   # Meilisearch
MEILI_MASTER_KEY=<clé forte>
PREVIEW_SECRET=<secret fort>
NEXT_PUBLIC_SITE_URL=https://www.maximerit.com
# Tracking (Phase 8) — fournis par le client
NEXT_PUBLIC_GTM_ID=GTM-XXXX
NEXT_PUBLIC_GA4_ID=G-XXXX
NEXT_PUBLIC_GSC_VERIFICATION=<jeton>
# Staging uniquement (non indexable) :
SEO_STAGING=1
```
Secrets injectés par la plateforme d'hébergement — **jamais** commités.

## 3. Build & déploiement
```bash
pnpm install --frozen-lockfile
pnpm --filter web exec payload migrate --use-swc   # migrations DB versionnées
pnpm --filter web build
pnpm --filter web start                            # ou plateforme (Vercel/conteneur)
```
- Le stockage CV doit pointer vers l'objet privé (adaptateur S3 Payload — à activer en prod à la place du `staticDir` local).
- Un **adaptateur email** Payload doit être configuré (sinon emails en console).

## 4. Environnements & bascule (ADR-0003)
```
Production actuelle (WordPress) — reste en ligne
        │
        ▼
   STAGING (SEO_STAGING=1, robots Disallow: /) — recette
        │  QA fonctionnelle + SEO (voir SEO.md §Recette)
        ▼
   BASCULE : DNS → nouvelle prod · activation des 301 (déjà en place) ·
             soumission sitemap à Search Console · retrait du blocage d'indexation
        ▼
   Nouvelle production maximerit.com
```

## 5. Recette avant bascule (résumé — détail `SEO.md` §Recette)
Tests de redirection **mode LIVE** (`BASE_URL=<staging> node --test scripts/tests/migration-map.test.mjs`),
smoke SEO (canonical/robots/sitemap), parcours critiques (LP→lead, offre→candidature, recherche vivier),
tracking (consentement), 0 CV indexable. Lighthouse sur les pages clés.

## 6. Sauvegardes & restauration
- **PostgreSQL** : sauvegardes automatiques de la base gérée (PITR si disponible) ; test de restauration avant bascule.
- **Stockage CV** : versioning/backup de l'objet privé.
- **Meilisearch** : réindexable depuis PostgreSQL (source de vérité) — les hooks resynchronisent ; prévoir un script de réindexation complète.

## 7. Observabilité
- `GET /health` (liveness) et `GET /ready` (readiness : DB joignable) — à brancher aux sondes de la plateforme.
- Logs structurés (stdout) → agrégateur ; alertes sur 5xx, échecs `/ready`, latence.
- Suivi SEO post-migration J+1/J+7/J+30/J+90 (Search Console + analytics).

## 8. Rollback
1. **Bascule DNS** réversible : re-pointer vers la production WordPress (restée en ligne) — rollback immédiat.
2. **Application** : redéploiement du commit précédent (chaque commit passe la CI).
3. **Base** : les migrations Payload ont un sens `down` ; restaurer le dernier backup si nécessaire.
4. **Redirections** : conservées indéfiniment (aucune suppression au rollback).
Toujours préparer le rollback **avant** la bascule ; ne jamais supprimer l'ancienne prod tant que la nouvelle n'est pas stabilisée (J+30).

## 9. Release progressive
Si l'infra le permet : canary/trafic progressif vers la nouvelle prod, surveillance des 5xx/CWV/erreurs
avant 100 %. À défaut, bascule en heures creuses avec surveillance rapprochée + rollback DNS prêt.

## 10. Durcissements production (avant ou juste après bascule)
CSP stricte (compatible admin Payload + GTM) · MFA admin · rate limiting **Redis** (au lieu de la mémoire) ·
stockage CV **S3 privé chiffré** · adaptateur email · rotation des secrets · soft-delete + politique de
rétention RGPD formalisée · sauvegardes testées. (Détail : `SECURITY.md`.)

## 11. À fournir par le client (récapitulatif)
Hébergement Node + **PostgreSQL gérée** + **Meilisearch** + **stockage objet privé** + **SMTP** ·
domaine & certificats · IDs **GA4 / GTM / Search Console** · validation juridique des pages légales ·
accès analytics/logs existants pour finaliser la « valeur » de la carte de migration (ADR-0005).

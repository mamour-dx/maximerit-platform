# Phase 14 — Validation (GATE 14)

## Objectif
Back-office plus simple et plus convivial : français, menu réduit, formulaires courts, automatismes, données propres.

## Livré
- `payload.config.ts` : libellés/aides FR, rubriques (Recrutement · Contacts · Contenu du site · Équipe · Avancé),
  `hidden` par rôle, sections repliables, rangées, colonnes par défaut, statuts lisibles, hooks (slug unique,
  dates auto, auteur des notes, premier compte = super admin), `graphQL.disable`, `i18n` FR + retouches,
  logo/icône/lien « Voir le site », vue d'accueil personnalisée.
- `components/admin/` : `Dashboard` (accueil, compteurs soumis aux droits), `Logo`, `Icon`, `ViewSite`.
- Migration `20261021_100054_simplify_admin` : `jobs.country / discipline / sector` → énumérations
  (valeurs existantes normalisées : casse, « mines » → `mines-ressources-naturelles`, inconnues → vide) ;
  `slug` optionnel sur jobs, articles, ressources, pages, pages marketing. Réversible.
- Suppression des routes `/api/graphql` et `/api/graphql-playground` (404).
- `packages/domain/index.d.ts` : types de `COUNTRY_CODES` et `CONTRACT_TYPES`.
- `docs/BACKOFFICE.md`.

## Tests exécutés
- `admin-simplify.int.test.ts` (15) : listes de choix = domaine, rubriques masquées par rôle, CV hors menu mais
  routables, slug généré / unique / conservé, dates auto, republication, date choisie respectée, pays invalide
  refusé, article, premier compte.
- Unit 85/85 · Intégration 54/54 · `tsc` 0 · `eslint` 0 · `next build` OK · rejoué sur Node 20 (version du CI) avec base vierge · crawl de liens 174 URL → 174 × 200.
- Migration testée sur base vierge + données volontairement sales (`sn`, `mines`, valeurs inconnues), puis
  `migrate:down` / `migrate` (réversibilité).
- Recette navigateur (base jetable) : accueil, menu, liste et fiche d'offre, création d'offre publiée (slug +
  dates auto, offre visible sur le site), candidatures, fiche candidat, ouverture d'un CV, demande d'entreprise ;
  rôles Super admin / Recruteur / Marketing (menu et accueil adaptés ; `/admin/collections/redirects` → « Rien n'a
  été trouvé » pour un recruteur ; « Mon compte » accessible).

## Statut du gate
```
PHASE : 14 — Back-office simplifié
Specification PASS · Implementation PASS · Unit PASS (85/85) · Integration PASS (54/54)
Security PASS (GraphQL retiré, rubriques réservées, RBAC inchangé) · Build PASS · Lint PASS · Type-check PASS · Doc PASS
DÉCISION : GO
```

## Déploiement
1. **Appliquer d'abord la migration** sur la base de production (compatible avec l'ancien code) :
   `payload migrate`. 2. Puis déployer le code.

## Correctif post-CI
- CI en échec : `ERR_PNPM_OUTDATED_LOCKFILE` — la version de `@payloadcms/translations` avait été modifiée à la main
  dans `package.json` (`^3.90.1`) sans régénérer `pnpm-lock.yaml`. Lockfile régénéré ; `pnpm install --frozen-lockfile` OK.
- Rejeu local des étapes du CI sur **Node 20** + base **vierge** : un test (`jobs.int.test`, sitemap) échouait — la règle
  « republier prolonge de 60 jours » écrasait une date de fin passée fournie *à la création*. Règle restreinte aux
  republications d'une offre existante dont la date n'a pas été modifiée ; 3 tests ajoutés (formulaire, création avec date
  passée, date saisie volontairement).

## Risques restants
- La migration 14 est une 9ᵉ migration : toute base existante doit l'appliquer (`payload migrate`).
- Le champ `slug` est désormais facultatif côté Payload ; la colonne devient nullable (migration incluse).
- Les noms « Avancé » (pages marketing, redirections, étiquettes, viviers) restent visibles des administrateurs ;
  ils pourront être retirés si l'équipe confirme ne jamais les utiliser.

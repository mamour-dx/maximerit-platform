# Phase 14 — Back-office simplifié

## Contexte
Retours utilisateurs : le back-office (Payload `/admin`) est trop compliqué pour l'équipe (interface en anglais,
17 rubriques techniques, formulaires de 30 champs, champs libres sans contrôle, tableau de bord générique).

## Exigences
- R1 — Interface en **français** (traduction Payload + retouches : pas de « un(e) nouveau ou nouvelle »).
- R2 — Menu réduit à l'essentiel : **Recrutement** (offres, candidatures, candidats) · **Contacts** (demandes
  d'entreprises) · **Contenu du site** (articles, ressources, pages). Rubriques techniques (pages marketing,
  redirections, étiquettes, viviers, comptes) réservées aux administrateurs / marketing ; fichiers CV hors menu
  mais accessibles depuis la fiche candidat.
- R3 — **Page d'accueil** dédiée : gros boutons d'action et compteurs (offres en ligne, candidatures à traiter,
  nouvelles demandes), adaptés aux droits du rôle.
- R4 — Formulaires courts : champs essentiels en tête, le reste dans des sections repliées ; libellés et aides en
  français ; statuts lisibles ; colonnes de liste utiles ; recherche sur les champs pertinents.
- R5 — **Moins de saisie** : adresse web (slug) générée depuis le titre et unique ; date de publication
  automatique ; fin de visibilité d'une offre = +60 jours (prolongée à la republication) ; auteur d'une note
  renseigné automatiquement.
- R6 — **Données propres** : pays, pôle métier, secteur et contrat des offres = menus déroulants alignés sur
  `@maximerit/domain` (migration `simplify_admin`, valeurs existantes nettoyées).
- R7 — **Retrait du superflu** : API GraphQL et playground supprimés (inutilisés) ; champ « offres similaires »
  masqué (le site les calcule).
- R8 — Le **premier compte** est toujours Super administrateur (le rôle par défaut « Lecture seule » le
  verrouillait).
- R9 — Marque : logo Maximerit à la connexion, pictogramme, lien « Voir le site » dans le menu.
- R10 — Guide utilisateur `docs/BACKOFFICE.md`.

## Contraintes
- Pas de changement de comportement du site public (mêmes URL, mêmes données).
- `payload.config.ts` reste autonome (la CLI Payload ne résout pas les imports nommés de fichiers `.ts`
  du projet) ; il importe seulement le package workspace `@maximerit/domain` (ESM natif).

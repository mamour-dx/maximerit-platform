# Phase 13 — Job board & refonte visuelle

## Contexte
Les 13 phases (0 → 12) sont livrées. La liste des offres (`/candidats/offres-demploi/`) restait une simple
liste non filtrable, et le site public gardait un habillage minimal. Cette phase rend le parcours candidat
réellement utilisable (recherche + filtres) et élève le niveau visuel de la plateforme.

## Exigences
### Job board (FR `/candidats/offres-demploi/`, EN `/en/candidats/offres-demploi/`)
- R1 — Filtres combinables pilotés par l'URL : `q` (mots-clés), `country`, `discipline`, `contract`.
- R2 — Recherche plein texte insensible à la casse et aux accents, tous les termes requis (ET), sur titre,
  mission, profil, lieu, spécialité, secteur et libellés pays/pôle de la langue courante.
- R3 — Facettes calculées sur les offres **live** uniquement (valeurs réellement présentes + compteurs).
- R4 — Amélioration progressive : formulaire GET fonctionnel sans JS ; avec JS, navigation client,
  paramètres vides retirés, filtrage immédiat au changement d'une liste.
- R5 — Pastilles de filtres actifs retirables + « Réinitialiser » ; états vide (aucune offre / aucun résultat).
- R6 — SEO : canonical vers la liste ; pages filtrées en `noindex, follow` (pas de quasi-duplication).
- R7 — Paramètres bornés (longueur max) — aucune entrée arbitraire propagée.

### Page offre (`/jobs/[slug]/`, `/en/jobs/[slug]/`)
- R8 — Fiche synthèse (lieu, contrat, pôle, expérience, date limite), CTA « Postuler » ancré.
- R9 — Offres similaires : même pôle (priorité) puis même pays, live, hors offre courante (3 max).
- R10 — Comportements Phase 6 conservés : JSON-LD JobPosting sur offre live, expirée = notice + noindex.

### Design system
- R11 — Tokens (ombres, rayons, rouge doux/foncé) et composants CSS (`btn`, `card`, `chip`, `field`,
  `eyebrow`, `icon-chip`, `hero-bg`, `brand-band`) ; jeu d'icônes inline sans dépendance.
- R12 — Accueil FR/EN unifié (un composant, textes par langue) : hero + recherche d'offres, deux publics,
  expertises, méthode, verticale Mining, secteurs/outils, CTA.
- R13 — Thème clair conservé ; `prefers-reduced-motion` respecté ; navigation clavier (focus visible).

### Données de démonstration
- R14 — Commande `pnpm --filter web seed:demo` (idempotente, FR + EN) pour la recette locale ; jamais en prod.

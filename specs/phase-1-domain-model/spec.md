# Spec — Phase 1 : Stratégie & Domain Model

## Besoin
Fixer le modèle métier qui porte les 4 systèmes (Site / Content / Talent / CRM) : entités,
vocabulaires contrôlés, taxonomie Mining, profil candidat exploitable, règles de recherche.
La valeur est dans la **donnée structurée**, pas dans le nombre de CV (stratégie §14).

## Périmètre
- Entités principales (cf. `docs/DATA_MODEL.md`).
- Taxonomie Mining Secteur→Discipline→Spécialité (`domain/taxonomy/mining.json`).
- Vocabulaires contrôlés / enums (`domain/enums.json`) : rôles/permissions, pipeline, langues, contrats, disponibilité, mobilité, séniorité, secteurs, pays, commodities, événements.
- Profil candidat Mining (secteur, discipline, spécialité, commodity, années, type de mine, pays, mobilité, langues, disponibilité).
- Règles de recherche multicritère + plein texte (`domain/model.mjs`).

## Critères d'acceptation
1. La taxonomie Mining a 4 disciplines, des spécialités à slugs uniques, labels FR+EN, URLs sous `/mines/`. ✅
2. RBAC : 6 rôles, matrice cohérente (actions connues), VIEWER en lecture (ni delete ni publish). ✅
3. Le profil candidat valide les règles métier : consentement obligatoire, email valide, tel/WhatsApp, vocabulaires contrôlés, années ≥ 0. ✅
4. La recherche canonique (« géologues Gold francophones/anglophones 8+ ans mobiles Guinée dispo 60j ») retourne le bon candidat et rejette les non-conformes (ET logique par critère). ✅
5. `buildCandidateQuery` produit des prédicats normalisés traduisibles en SQL/Meilisearch. ✅

## Cas limites couverts
- Consentement absent → rejet. Email invalide → rejet. Ni tel ni WhatsApp → rejet.
- Vocabulaire inconnu (commodity/statut) → rejet ; années négatives → rejet.
- Langue au niveau « notions » ne satisfait pas une exigence « professionnel ».
- Mobilité de fait : une expérience dans le pays vaut mobilité.
- Full-text sur tags/poste (match tokens ; non-match si absent).

## Tests
`scripts/tests/domain.test.mjs` — **21 tests** (taxonomie, RBAC, pipeline, référentiels, validation, recherche, cas limites). `node --test`.

## Décisions
- Tags = taxonomie administrée (pas de création libre) — qualité de base.
- Spécialités transverses (Mine Manager, CFO) : placement canonique unique + `crossRefs`.
- Résidence candidat non restreinte aux 7 pays (les pays prioritaires servent le SEO, pas la contrainte de données).
- ADR-0004 (parsing CV) reste ouvert → Phase 5.

## Réserves
- Le détail fin des collections Payload (champs exacts, hooks, access) est finalisé en Phase 3, mais la sémantique est figée ici et testée.

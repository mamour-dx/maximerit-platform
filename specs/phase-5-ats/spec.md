# Spec — Phase 5 : ATS + vivier

## Besoin
Construire une base de talents **qualifiée et exploitable** (pas un dépôt de CV) : réception,
structuration, recherche multicritère, pipeline. Données personnelles protégées (Art. VI, RGPD).

## Découpage
- **5a — Modèle candidat + upload CV sécurisé + intake** (cette livraison) : collections
  `Candidates`, `CVs` (privé), `Tags` (taxonomie administrée) ; endpoint `/apply` (profil + CV) avec
  validation métier (domaine), consentement, anti-spam, contrôle type/taille fichier ; RBAC.
- **5b — Parsing CV** (à suivre, ADR-0004 pipeline interne) : extraction PDF/DOCX → proposition de
  fiche **éditable/validable** (jamais appliquée en aveugle) ; `parseStatus`.
- **5c — Recherche & vivier** : indexation Meilisearch, recherche multicritère + plein texte
  (moteur du domaine Phase 1), viviers sauvegardés, shortlist.

## Critères d'acceptation — 5a
1. Collections `Candidates` (profil complet + bloc Mining + pipeline 10+4 statuts + notes + tags + cv), `CVs` (upload), `Tags` (contrôlée). ✅
2. **CV jamais public** : lecture des `cvs` et `candidates` réservée aux internes (Art. VI). ✅
3. `/apply` : validation métier via `@maximerit/domain` (consentement obligatoire), anti-spam honeypot, rate limiting. ✅
4. **Upload sécurisé** : MIME (PDF/DOCX) + taille (≤ 5 Mo) + cohérence extension + sanitisation du nom (anti path-traversal). ✅
5. Candidat créé avec `parseStatus=pending`, CV rattaché, consentement horodaté. ✅
6. Tests : unit (upload) + intégration (intake, sécurité fichier, RBAC, anti-spam). ✅

## Cas limites couverts
- Sans consentement → 400. Sans CV → 400. Type non autorisé → 400. Fichier > 5 Mo → 400.
- Honeypot → 202 (pas de stockage). Lecture publique candidats/CV → refusée (RBAC).

## Tests
- Unit : `src/__tests__/upload.test.ts` (7).
- Intégration : `src/__tests__/apply.int.test.ts` (7).

## Critères d'acceptation — 5b (parsing CV)
7. Extraction texte **PDF** (`pdf-parse` v2) et **DOCX** (`mammoth`), server-only (hors bundle). ✅
8. Structuration heuristique déterministe → proposition (nom, poste, email, tél, langues+niveau, commodities, pays, années, compétences, certifications, formation, expériences). ✅
9. Proposition stockée dans `proposedProfile` (**jamais appliquée en aveugle**) ; `parseStatus` pending→parsed (failed si erreur). ✅
10. Endpoint interne `/reparse-cv` réservé aux authentifiés (401 sinon). ✅
11. Tests : unit (structuration, texte fixture) + intégration (DOCX réel via jszip → proposition + parseStatus). ✅

## Tests (5b)
- Unit : `src/__tests__/cv-parse.test.ts` (6).
- Intégration : `src/__tests__/cv-parse.int.test.ts` (2, DOCX réel).

## Critères d'acceptation — 5c (recherche & vivier)
12. Indexation Meilisearch des candidats via hooks Payload (`afterChange`/`afterDelete`), **fail-soft** (n'empêche jamais la création). ✅
13. Recherche multicritère + plein texte : `buildMeiliFilter` traduit les filtres métier (Phase 1) ; requête canonique du cahier fonctionnelle. ✅
14. Collection `TalentPools` (viviers sauvegardés : dynamique/statique, membres, shortlist). ✅
15. Endpoint `/search-candidates` réservé aux authentifiés (401 sinon). ✅
16. Tests : unit (filtres, mapping+mobilité) + intégration (index → recherche canonique, exclusions, plein texte, RBAC). ✅

## Tests (5c)
- Unit : `src/__tests__/search.test.ts` (4).
- Intégration : `src/__tests__/search.int.test.ts` (4, Meilisearch réel).

## Réserves
- Stockage CV local en dev → objet privé (S3-like) en production (Phase 12).
- Structuration LLM optionnelle (améliore l'extraction) branchable sur le même point, sans envoi tiers par défaut.
- Mobilité indexée depuis `internationalMobility` + `countriesExperience` (champs mobilityScopes/Countries à enrichir si besoin).

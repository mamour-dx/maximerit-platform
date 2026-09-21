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

## Réserves (→ 5b / 5c)
- Parsing CV (extraction éditable) : 5b. Recherche Meilisearch + viviers + shortlist : 5c.
- Stockage CV local en dev → stockage objet privé (S3-like) en production (Phase 12).

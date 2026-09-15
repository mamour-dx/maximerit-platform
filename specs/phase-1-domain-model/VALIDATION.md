# Phase 1 — Validation (GATE 1)

## Objectif
Modèle de domaine : entités, taxonomie Mining, profil candidat, règles de recherche.

## Fonctionnalités livrées
- Vocabulaires contrôlés (`domain/enums.json`) : RBAC (6 rôles + matrice), pipeline (10+4), langues,
  contrats, disponibilité, mobilité, séniorité, 6 secteurs, 7 pays, commodities, 13 événements de tracking.
- Taxonomie Mining (`domain/taxonomy/mining.json`) : 4 disciplines, spécialités uniques, FR/EN, URLs.
- Modèle exécutable (`domain/model.mjs`) : validation profil candidat + moteur de recherche
  multicritère/plein texte + normalisation de requête.
- Documentation complète des entités/relations/contraintes/index (`docs/DATA_MODEL.md`).

## Tests exécutés
`node --test scripts/tests/domain.test.mjs` → **21 pass / 0 fail**.

## Résultats
- Règles métier, modèle, contraintes, relations, règles de recherche, cas limites : couverts et verts.

## Sécurité
RBAC modélisé et testé (moindre privilège : VIEWER lecture seule). Consentement candidat obligatoire.
Application effective des permissions = Phase 3+ (Payload access control) puis audit Phase 9.

## SEO / Performance
Taxonomie et URLs Mining posées (exploitées en Phase 2). Index de recherche définis (exécutés Phase 5/10).

## Problèmes rencontrés / Décisions
- Spécialités transverses → `crossRefs` (pas de duplication de nœud). Tags administrés. Voir spec.

## Statut du gate
```
PHASE : 1 — Stratégie & Domain Model
STATUT :
- Specification    : PASS
- Implementation   : PASS (modèle en données + règles exécutables)
- Unit tests       : PASS (21/21)
- Integration/E2E  : N/A (pas encore de persistance — Phase 3)
- Security checks  : PASS (RBAC modélisé/testé) — application effective Phase 3+
- SEO checks       : N/A (Phase 2)
- Build/Lint/Type  : N/A (TypeScript strict activé en Phase 3 ; JS+node:test à ce stade)
- Documentation    : PASS
DÉCISION : GO
BLOQUANTS : aucun.
ACTIONS RESTANTES : trancher ADR-0004 (parsing CV) en Phase 5 ; matérialiser en collections Payload en Phase 3.
```

## Risques restants
- R2 (sous-estimation ATS) : atténué — le modèle est spécifié et testé avant tout code applicatif.

## GO / NO-GO
**GO** pour la Phase 2 (Architecture UX + SEO).

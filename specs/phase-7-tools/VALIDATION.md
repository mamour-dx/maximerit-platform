# Phase 7 — Validation (GATE 7)

## Objectif
Contenus & outils d'acquisition. Sous-phase **7a** : les 4 outils gratuits.

## Fonctionnalités livrées (7a)
- Moteur pur `tools.ts` : coût de vacance, coût de recrutement, benchmark salaire, Mining Team Planner
  (résultats indicatifs + méthodologie explicite, validation des entrées).
- 4 pages `/ressources/outils/<slug>/` (SSG) avec calculateur interactif + formulaire lead (`source=tool:<slug>`).

## Tests exécutés
- Unit : 44/44 (dont `tools.test.ts` 8). `tsc` 0 · `eslint` 0 · `next build` OK (4 pages SSG).
- Smoke runtime : 4 outils → 200, slug inconnu → 404, calculateur + CTA lead présents.

## Statut du gate
```
PHASE : 7a — Outils d'acquisition
Specification PASS · Implementation PASS · Unit PASS (44/44) · Build PASS · Lint PASS · Type-check PASS
SEO PASS (canonical par outil) · Acquisition PASS (lead par outil) · Doc PASS
DÉCISION : GO

PHASE : 7b — Infrastructure éditoriale (blog/guides/études) → À FAIRE
```

## Risques restants
- Barèmes indicatifs à calibrer avec données propriétaires (baromètre — stratégie §13).
- Tracking `use_tool` → Phase 8.

## GO / NO-GO
**GO (7a).** Prochaine : 7b (éditorial) puis Phase 8 (Tracking & data).

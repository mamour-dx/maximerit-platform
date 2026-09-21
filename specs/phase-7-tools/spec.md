# Spec — Phase 7 : Contenus, outils & acquisition

## Besoin
Doter Maximerit de canaux d'acquisition B2B : outils gratuits (leads + trafic + data) et
infrastructure éditoriale (blog/guides/études) pour la topical authority.

## Découpage
- **7a — 4 outils d'acquisition** (cette livraison) : moteur de calcul pur + pages + capture lead.
- **7b — Infrastructure éditoriale** (à suivre) : collections `Articles`/`Resources`, listing/détail blog, maillage.

## Critères d'acceptation — 7a
1. Moteur pur `src/lib/tools.ts` : `costOfVacancy`, `costOfRecruitment`, `salaryBenchmark`, `miningTeamPlan` — résultats **indicatifs** avec **méthodologie explicite** (cahier §12). ✅
2. Validation des entrées (erreurs typées) ; cas limites gérés. ✅
3. 4 pages `/ressources/outils/<slug>/` (SSG) avec calculateur interactif (client). ✅
4. Chaque outil relié à un **formulaire lead** (`/submit-lead`, `source=tool:<slug>`) — canal d'acquisition. ✅
5. Outil inconnu → 404. ✅
6. Tests : unit (calculs exacts + validation + cas limites). ✅ + smoke runtime.

## Détail des outils
- **Coût d'un poste vacant** : valeur quotidienne (salaire annuel / 260 j) × jours × facteur d'impact.
- **Coût d'un recrutement** : salaire annuel × taux par canal (interne 15 % / mixte 17 % / agence 20 %).
- **Benchmark salaire** : base par discipline Mining × coefficient pays × ancienneté (+3 %/an, plafond 20 ans), fourchette −15 %/+20 %.
- **Mining Team Planner** : composition d'équipe indicative par phase (exploration/faisabilité/construction/production).

## Tests
- Unit : `src/__tests__/tools.test.ts` (8) — valeurs exactes + rejets.
- Smoke runtime : 4 pages 200, 404 sur slug inconnu, calculateur + CTA lead présents.
- Lead : réutilise le chemin `/submit-lead` déjà testé (Phase 4a).

## Réserves (→ 7b)
- Blog/guides/études (collections + rendu + maillage) : Phase 7b.
- Tracking `use_tool` / `submit_lead` : Phase 8 (points d'ancrage prêts, `source=tool:*`).
- Valeurs des barèmes = hypothèses indicatives, à calibrer avec les données propriétaires (baromètre) — cf. stratégie §13.

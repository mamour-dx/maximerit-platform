# Constitution — Projet Maximerit (Spec-Driven Development)

> Principes non négociables qui gouvernent chaque spécification, chaque phase et chaque gate.
> Inspiré de la méthode **Spec Kit** (spec → plan → tasks → implement → validate).
> Toute exception doit être justifiée dans un ADR (`docs/DECISIONS.md`).

## Article I — Spec first
Aucune fonctionnalité importante n'est implémentée sans spécification écrite préalable
(`specs/<feature>/spec.md`) contenant : besoin, critères d'acceptation, cas limites, tests prévus.
La spec doit être compréhensible par un autre développeur sans connaissance implicite.

## Article II — Gate before next phase
Interdiction de passer à la phase suivante tant que le GATE de la phase courante n'est pas **GO**.
Un GATE est GO uniquement si tous les critères obligatoires sont PASS (spec, implémentation,
tests unit/intégration/E2E pertinents, sécurité, SEO si applicable, build, lint, type-check, doc).

## Article III — Test always
Chaque fonctionnalité arrive avec ses tests. Les tests ne sont jamais repoussés à la fin.
Interdit : désactiver/supprimer un test pour faire passer le build. Un build vert n'est pas une
validation fonctionnelle.

## Article IV — Priorités absolues (ordre en cas de conflit)
1. Sécurité → 2. Intégrité des données → 3. Specs validées → 4. Stabilité → 5. Tests →
6. SEO et conservation des acquis → 7. Performance → 8. UX → 9. Vitesse de développement.
La vitesse ne justifie jamais une dette critique ou une feature non testée.

## Article V — Conservation de l'antériorité SEO
Une nouvelle architecture ne justifie pas un changement d'URL. Toute URL avec ancienneté,
backlinks, trafic ou positions est conservée autant que possible. Chaque changement d'URL exige
une justification documentée et un test de redirection automatique.

## Article VI — Sécurité et données candidats
RBAC explicite, validation serveur systématique, secrets hors dépôt, chiffrement du transport,
stockage CV sécurisé (jamais sur URL publique indexable), journalisation/audit trail, RGPD-like
(consentement / conservation / suppression / export). Principe du moindre privilège.

## Article VII — Qualité de code
TypeScript strict, lint + format, responsabilité unique, pas de logique métier dans l'UI,
pas de `any` non justifié, gestion d'erreurs explicite et typée, pas de secrets hardcodés,
pas de SQL non sécurisé, migrations versionnées.

## Article VIII — Décisions
Décision réversible et à faible risque → avancer avec hypothèse documentée. Décision irréversible
ou fortement structurante → format PROBLÈME / OPTIONS / RECOMMANDATION / IMPACT / DÉCISION et
demander validation.

## Article IX — Definition of Done
Une feature est « done » seulement si : spec validée, critères d'acceptation validés, code,
tests (unit + intégration + E2E si pertinents), sécurité + permissions vérifiées, SEO/perf si
applicable, doc à jour, lint + type-check + build OK, aucun bug bloquant, GATE validé.

## Article X — Livrables par phase
Chaque phase produit : spécification, décisions d'archi, code, tests, documentation, rapport de
validation (GO/NO-GO), liste des risques restants.

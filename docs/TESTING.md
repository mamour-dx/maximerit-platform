# TESTING.md — Stratégie de test globale (Étape F)

> Article III de la constitution : chaque feature arrive avec ses tests. Jamais de tests repoussés à la fin.

## Pyramide
```
        E2E (Playwright)        ← parcours critiques : LP→lead, offre→candidature, recherche vivier
      Integration / API         ← endpoints Payload, RBAC, DB (base de test), recherche
        Unit (Vitest)           ← règles métier, validation zod, utilitaires SEO/tracking, calculs outils
```

## Priorités de couverture (ordre)
1. Règles métier → 2. Sécurité/permissions → 3. API → 4. Données → 5. Composants →
6. Parcours critiques → 7. SEO → 8. Performance.

## Outils (cibles, mis en place en Phase 3)
- **Unit/Integration** : Vitest (+ Testing Library pour composants).
- **E2E** : Playwright (desktop + mobile viewport, a11y checks via axe).
- **API/DB** : Vitest + base PostgreSQL de test (conteneur éphémère) + migrations.
- **SEO** : tests automatisés (voir ci-dessous) exécutés en CI.
- **Sécurité** : tests de permissions (horizontal/vertical), upload malveillant, rate limit ; scan de dépendances (`npm audit`/Dependabot).
- **Perf** : Lighthouse CI (Core Web Vitals) + load tests (k6) sur endpoints critiques.

## Tests SEO (spécifiques au projet)
- Non-régression des **redirections** : chaque entrée du Master URL Migration File → statut attendu (200/301/410) et destination pertinente ; **aucune chaîne** de redirection.
- `canonical` auto-référencée sur chaque page indexable.
- `hreflang` réciproques FR↔EN cohérents.
- 0 page stratégique en `noindex` ; `robots.txt` et `sitemap.xml` cohérents entre eux.
- Structure des headings (un seul H1), fil d'Ariane, données structurées valides (JobPosting, Organization, BreadcrumbList).
- **0 CV** accessible via URL publique indexable.

## Gates & CI
La CI (`.github/workflows/`) exécute lint + type-check + unit + integration + build à chaque PR ;
E2E + SEO + Lighthouse sur les branches de release. Un GATE ne peut être GO que si la CI est verte
et que les vérifications manuelles pertinentes (responsive, a11y, UX, sécurité) sont faites.

## Données de test
Seeds réalistes (volumes attendus : plusieurs milliers de candidats) pour valider recherche,
pagination et performance dès la Phase 5/10. Jamais de données personnelles réelles en test.

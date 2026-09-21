# Phase 9 — Validation (GATE 9)

## Objectif
Audit sécurité consolidé : RBAC, endpoints, uploads, anti-abus, en-têtes, secrets, dépendances.

## Fonctionnalités / vérifications livrées
- En-têtes de sécurité globaux (`lib/security-headers` → `next.config`) — nosniff, X-Frame-Options,
  Referrer-Policy, Permissions-Policy, HSTS. Testés (unit) + vérifiés au runtime (curl -I).
- Audit RBAC consolidé (`security.int.test.ts`) : lecture anonyme refusée sur candidates/cvs/leads/
  applications/talent-pools ; VIEWER sans création user ; RECRUITER lit mais ne supprime pas.
- Endpoints `/reparse-cv` et `/search-candidates` → 401 sans authentification.
- Uploads (type/taille/extension), anti-spam honeypot, rate limiting : couverts (Phase 5a/4a) et documentés.
- **Dépendances : 0 vulnérabilité** (`pnpm audit --prod`) après overrides dompurify/esbuild.
- Secrets hors dépôt (vérifié) ; `docs/SECURITY.md` rédigé.

## Tests exécutés
- Unit : 55/55 (dont security-headers 2). Intégration : 37/37 (dont security 9).
- `tsc` 0 · `eslint` 0 · `next build` OK. `pnpm audit --prod` : No known vulnerabilities.

## Statut du gate
```
PHASE : 9 — Sécurité
Specification PASS · Implementation PASS · Security checks PASS · Unit PASS (55/55) · Integration PASS (37/37)
Dépendances PASS (0 vuln) · Build PASS · Lint PASS · Type-check PASS · Doc PASS
DÉCISION : GO
```

## Risques restants (durcissement Phase 12)
- CSP stricte, MFA admin, rate limiting Redis, stockage CV S3 chiffré, soft-delete/rétention RGPD formalisée.

## GO / NO-GO
**GO.** Prochaine : Phase 10 (Performance & qualité).

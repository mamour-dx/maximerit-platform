# Spec — Phase 9 : Sécurité

## Besoin
Auditer et consolider la sécurité avant production : accès, endpoints, uploads, abus, en-têtes,
secrets, dépendances — avec preuves testées.

## Critères d'acceptation
1. En-têtes de sécurité appliqués à toutes les réponses (nosniff, X-Frame-Options, Referrer-Policy, Permissions-Policy, HSTS). ✅
2. RBAC : lecture anonyme refusée sur toutes les données personnelles ; élévation verticale refusée. ✅
3. Endpoints sensibles authentifiés (401 sinon). ✅
4. Uploads : type/taille/extension contrôlés ; CV jamais public. ✅ (Phase 5a, consolidé)
5. Anti-spam + rate limiting sur les points d'entrée publics. ✅
6. Secrets hors dépôt. ✅
7. Dépendances : 0 vulnérabilité connue (`pnpm audit --prod`). ✅
8. Documentation `SECURITY.md`. ✅

## Tests
- Unit : `security-headers.test.ts`. Intégration : `security.int.test.ts` (RBAC + endpoints).
- Audit : `pnpm audit --prod` (0 vuln après overrides).

## Réserves (durcissement Phase 12)
CSP stricte, MFA admin, rate limiting Redis, stockage CV S3 chiffré, rétention RGPD formalisée.

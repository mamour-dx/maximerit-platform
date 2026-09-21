# SECURITY.md — Modèle de sécurité (Phase 9)

> La sécurité est traitée dès l'architecture (constitution Art. VI) ; cette page consolide et audite.

## Authentification & sessions
- Authentification Payload (collection `users`, cookies httpOnly). MFA admin **recommandé** en production.
- Endpoints internes (`/reparse-cv`, `/search-candidates`) vérifient `payload.auth(headers)` → **401** sans session.

## RBAC (rôles : SUPER_ADMIN, ADMIN, RECRUITER, CONTENT_MANAGER, MARKETING, VIEWER)
- Contrôle d'accès **par collection** (read/create/update/delete) — cf. `payload.config.ts`.
- **Données personnelles jamais publiques** : `candidates`, `cvs`, `leads`, `applications`, `talent-pools`
  en lecture réservée aux internes (testé : anonyme → refus).
- **Élévation verticale refusée** : VIEWER ne peut pas créer d'utilisateur ; RECRUITER lit mais ne
  supprime pas un candidat (delete réservé ADMIN) — testé.
- Bootstrap du 1er admin autorisé une seule fois (aucun user), puis création réservée aux admins.

## Validation & entrées
- Validation **serveur systématique** : profil candidat (`@maximerit/domain`), lead (`lib/lead`).
- Aucune confiance au client ; whitelist des champs (jamais de champ arbitraire ni le honeypot en base).

## Uploads (CV)
- Types autorisés : **PDF / DOCX uniquement** (MIME + cohérence extension), taille **≤ 5 Mo**, nom sanitisé
  (anti path-traversal) — cf. `lib/upload`, testé (type/taille/extension).
- Stockage **privé** : `cvs.access.read` = interne ; **aucun CV sur URL publique indexable** (Art. VI).

## Anti-abus
- **Anti-spam honeypot** sur `/submit-lead` et `/apply` (bots → 202 sans stockage).
- **Rate limiting** best-effort par IP (5/min) — à remplacer par un store partagé (Redis) en prod.

## En-têtes de sécurité (next.config → `lib/security-headers`, testés + vérifiés runtime)
`X-Content-Type-Options: nosniff` · `X-Frame-Options: SAMEORIGIN` ·
`Referrer-Policy: strict-origin-when-cross-origin` · `Permissions-Policy` (camera/micro/géoloc/topics off) ·
`Strict-Transport-Security` (HSTS, effectif en HTTPS).
> CSP stricte : à finaliser en production (compatibilité admin Payload + GTM) — proposée en durcissement Phase 12.

## Secrets
- Hors dépôt : `.env` gitignoré, `.env.example` fourni. Secrets réels (PAYLOAD_SECRET, DATABASE_URI,
  MEILI_MASTER_KEY, PREVIEW_SECRET) injectés par l'environnement en production.

## RGPD / données candidats
- **Consentement obligatoire** (candidature) horodaté ; consentement mesure d'audience (bannière, aucune
  mesure avant accord — Phase 8).
- Conservation / suppression / export : opérables via l'admin (soft-delete à activer en Phase 12) ;
  politique de conservation à formaliser avec le client.

## Audit des dépendances
- `pnpm audit --prod` : **0 vulnérabilité connue** après `pnpm.overrides` (dompurify ≥ 3.4.13, esbuild ≥ 0.25.0
  — corrigeaient 5 advisories transitives, admin/outillage uniquement). À rejouer en CI/à chaque release.

## Tests sécurité
- Unit : `security-headers.test.ts` (2). Intégration : `security.int.test.ts` (9 : RBAC anonyme/vertical + endpoints 401)
  + contrôles répartis (upload, anti-spam, RBAC par collection) dans les suites de phases.

## Items de durcissement production (Phase 12)
CSP stricte · MFA admin · rate limiting Redis · stockage CV S3 privé chiffré · rotation des secrets ·
sauvegardes/restauration testées · journalisation/audit trail centralisés.

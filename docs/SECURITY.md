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
  Le tout premier compte est **forcé en SUPER_ADMIN** (hook `users.beforeValidate`, testé) ; sinon il hériterait du rôle
  par défaut VIEWER. **Créez ce compte immédiatement après le premier déploiement** : la création du premier compte
  est ouverte tant qu'aucun utilisateur n'existe.
- **Surface réduite (Phase 14)** : l'API **GraphQL** et son playground sont **désactivés** (inutilisés ; routes
  supprimées → 404). Les rubriques techniques (redirections, étiquettes, viviers, pages marketing, comptes) sont
  **masquées et non routables** pour les non-administrateurs (`admin.hidden`, testé) ; les fichiers CV sont hors
  menu mais gardent leurs règles d'accès (lecture interne uniquement).

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
- **Documents candidats (CV, lettres)** : store Vercel Blob **privé** (aucune URL publique ; lecture uniquement via
  `/api/cvs/file/…` après contrôle d'accès Payload, `Cache-Control: private, no-store`). Envoi direct navigateur → store
  par jeton restreint (chemin `incoming/<uuid>.<pdf|docx>` imposé, PDF/DOCX, ≤ 20 Mo, sans écrasement, 10 min), puis
  revérification serveur (taille, **type réel d'après les octets**) avant rangement ; dépôts abandonnés purgés après 1 h.
- **Captcha** Cloudflare Turnstile sur candidature et demande d'entreprise (vérification serveur, échec fermé si
  Cloudflare est injoignable). Candidature : captcha vérifié une fois puis ticket HMAC (`PAYLOAD_SECRET`) de 15 min pour
  les envois de fichiers et la fiche. Limite connue : un ticket reste réutilisable pendant 15 min (limite de débit par IP).
- **Export CSV / Excel** (candidats, candidatures — `src/lib/export.ts`) : `POST /api/<collection>/export`, réservé à
  RECRUITER / ADMIN / SUPER_ADMIN (403 sinon, 401 anonyme) ; accès Payload appliqué (`overrideAccess: false`), filtres
  validés par Payload ; notes internes et données de parsing exclues ; injection de formules neutralisée (CSV) et
  impossible (XLSX, cellules texte) ; chaque export est journalisé (`event: "data-export"` : utilisateur, rôle,
  collection, format, nombre de lignes, filtres) ; plafond de 10 000 lignes.

## Audit des dépendances
- `pnpm audit --prod` : **0 vulnérabilité connue** après `pnpm.overrides` (dompurify ≥ 3.4.13, esbuild ≥ 0.25.0
  — corrigeaient 5 advisories transitives, admin/outillage uniquement). À rejouer en CI/à chaque release.

## Tests sécurité
- Unit : `security-headers.test.ts` (2). Intégration : `security.int.test.ts` (9 : RBAC anonyme/vertical + endpoints 401)
  + contrôles répartis (upload, anti-spam, RBAC par collection) dans les suites de phases.

## Items de durcissement production (Phase 12)
CSP stricte · MFA admin · rate limiting Redis · stockage CV S3 privé chiffré · rotation des secrets ·
sauvegardes/restauration testées · journalisation/audit trail centralisés.

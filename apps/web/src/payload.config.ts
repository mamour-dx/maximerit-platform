import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
import type { Access, CollectionBeforeChangeHook, CollectionBeforeValidateHook, Field } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { fr } from "@payloadcms/translations/languages/fr";
import { mining, SECTORS, COUNTRY_CODES, CONTRACT_TYPES } from "@maximerit/domain";

// NB : ce fichier est chargé tel quel par la CLI Payload (Node ESM + swc) : il reste autonome — pas d'import
// nommé depuis d'autres fichiers .ts du projet (la CLI ne les résout pas). Le package workspace
// @maximerit/domain est du vrai ESM (.mjs), il peut donc être importé directement.

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// ───────────────────────────── Rôles & accès (RBAC) ─────────────────────────────
// Rôles alignés sur @maximerit/domain (docs/DATA_MODEL.md).
const ROLES = ["SUPER_ADMIN", "ADMIN", "RECRUITER", "CONTENT_MANAGER", "MARKETING", "VIEWER"] as const;
type Role = (typeof ROLES)[number];

const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Super administrateur",
  ADMIN: "Administrateur",
  RECRUITER: "Recruteur",
  CONTENT_MANAGER: "Responsable contenu",
  MARKETING: "Marketing",
  VIEWER: "Lecture seule",
};

const roleOf = (user: unknown): Role => ((user as { role?: Role } | null)?.role ?? "VIEWER") as Role;
const isAdminRole = (user: unknown): boolean => !!user && ["SUPER_ADMIN", "ADMIN"].includes(roleOf(user));
const isMarketingRole = (user: unknown): boolean => isAdminRole(user) || roleOf(user) === "MARKETING";

const isAdmin: Access = ({ req: { user } }) => isAdminRole(user);
const isAuthenticated: Access = ({ req: { user } }) => !!user;
const isMarketingOrAdmin: Access = ({ req: { user } }) => isMarketingRole(user);

// Création d'utilisateur : bootstrap du tout premier compte autorisé, puis réservé aux admins.
const canCreateUser: Access = async ({ req }) => {
  if (req.user) return isAdminRole(req.user);
  const { totalDocs } = await req.payload.count({ collection: "users" });
  return totalDocs === 0;
};

// Navigation : les rubriques techniques ne sont visibles que des administrateurs (ou du marketing).
const hideUnlessAdmin = ({ user }: { user: unknown }) => !isAdminRole(user);
const hideUnlessMarketing = ({ user }: { user: unknown }) => !isMarketingRole(user);

// ───────────────────────────── Listes de choix (menus déroulants) ─────────────────────────────
// Source unique : @maximerit/domain (mêmes valeurs que le site public et la recherche).
const COUNTRY_LABELS: Record<string, string> = {
  SN: "Sénégal", GN: "Guinée", CI: "Côte d'Ivoire", ML: "Mali", MR: "Mauritanie", BF: "Burkina Faso", GH: "Ghana",
};
const SECTOR_LABELS: Record<string, string> = {
  "mines-ressources-naturelles": "Mines & ressources naturelles",
  energie: "Énergie",
  "petrole-gaz": "Pétrole & gaz",
  "btp-infrastructures": "BTP & infrastructures",
  industrie: "Industrie",
  services: "Services",
};
const CONTRACT_LABELS: Record<string, string> = {
  cdi: "CDI",
  cdd: "CDD",
  "mission-interim": "Mission / intérim",
  "consultant-freelance": "Consultant (freelance)",
  "fifo-roster": "FIFO / roster",
  stage: "Stage",
};

const countryOptions = [...COUNTRY_CODES].map((c) => ({ label: COUNTRY_LABELS[c] ?? c, value: c }));
const sectorOptions = [...SECTORS].map((s) => ({ label: SECTOR_LABELS[s] ?? s, value: s }));
const contractOptions = [...CONTRACT_TYPES].map((c) => ({ label: CONTRACT_LABELS[c] ?? c, value: c }));
const disciplineOptions = mining.disciplines.map((d) => ({ label: d.label_fr, value: d.slug }));

// ───────────────────────────── Automatismes (moins de saisie) ─────────────────────────────
const slugify = (s: string): string =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

/** Adresse web (slug) : générée à partir du titre si elle est vide, et rendue unique (-2, -3…). */
const autoSlug =
  (collection: "jobs" | "articles" | "resources" | "pages" | "landing-pages"): CollectionBeforeValidateHook =>
  async ({ data, originalDoc, req }) => {
    if (!data || data.slug || originalDoc?.slug) return data;
    const base = slugify(typeof data.title === "string" ? data.title : "");
    if (!base) return data;
    let slug = base;
    for (let n = 2; n < 50; n++) {
      const { totalDocs } = await req.payload.count({ collection, where: { slug: { equals: slug } }, req });
      if (totalDocs === 0) break;
      slug = `${base}-${n}`;
    }
    return { ...data, slug };
  };

const DAY_MS = 864e5;

/** Offres : date de publication automatique ; fin de validité à +60 jours si absente ou dépassée à la (re)publication. */
const jobDates: CollectionBeforeChangeHook = ({ data, originalDoc }) => {
  const status = data.status ?? originalDoc?.status;
  if (status !== "publiee") return data;
  const now = new Date();
  const out: Record<string, unknown> = { ...data, publishedAt: data.publishedAt ?? originalDoc?.publishedAt ?? now.toISOString() };
  const justPublished = originalDoc?.status !== "publiee";
  const expiresAt = data.expiresAt ?? originalDoc?.expiresAt;
  if (!expiresAt || (justPublished && new Date(expiresAt).getTime() < now.getTime())) {
    out.expiresAt = new Date(now.getTime() + 60 * DAY_MS).toISOString();
  }
  return out;
};

/** Articles / ressources : date de publication automatique au passage en « Publié ». */
const publishDate: CollectionBeforeChangeHook = ({ data, originalDoc }) => {
  const status = data.status ?? originalDoc?.status;
  if (status !== "published") return data;
  return { ...data, publishedAt: data.publishedAt ?? originalDoc?.publishedAt ?? new Date().toISOString() };
};

// ───────────────────────────── Briques de formulaire ─────────────────────────────
const half = { width: "50%" } as const;

/** Section repliée par défaut : les champs « avancés » ne gênent pas la saisie courante. */
const more = (label: string, fields: Field[], open = false): Field => ({
  type: "collapsible",
  label,
  admin: { initCollapsed: !open },
  fields,
});

const slugField = (label = "Adresse web (URL)"): Field => ({
  name: "slug",
  type: "text",
  label,
  unique: true,
  index: true,
  admin: {
    description: "Laissez vide : elle est créée automatiquement à partir du titre. Ne la changez que si nécessaire.",
  },
});

const seoFields = (): Field =>
  more("Référencement Google (facultatif)", [
    { name: "seoTitle", type: "text", localized: true, label: "Titre pour Google", admin: { description: "Si vide, le titre de la page est utilisé." } },
    { name: "seoDescription", type: "textarea", localized: true, label: "Description pour Google", admin: { description: "1 à 2 phrases (environ 150 caractères)." } },
  ]);

const draftPublished = (published: string, publishedLabel: string): { label: string; value: string }[] => [
  { label: "Brouillon (non visible sur le site)", value: "draft" },
  { label: publishedLabel, value: published },
];

export default buildConfig({
  admin: {
    user: "users",
    dateFormat: "dd/MM/yyyy HH:mm",
    meta: { titleSuffix: " — Maximerit" },
    // Les composants personnalisés (/components/admin/…) se résolvent depuis src/.
    importMap: { baseDir: path.resolve(dirname) },
    components: {
      graphics: { Logo: "/components/admin/Logo#Logo", Icon: "/components/admin/Icon#Icon" },
      views: { dashboard: { Component: "/components/admin/Dashboard#Dashboard" } },
      afterNavLinks: ["/components/admin/ViewSite#ViewSite"],
    },
  },
  // Interface d'administration entièrement en français.
  i18n: {
    fallbackLanguage: "fr",
    supportedLanguages: { fr },
    // Retouches de la traduction française de Payload : formulations naturelles, sans « un(e) nouveau ou nouvelle ».
    translations: {
      fr: {
        general: {
          createNew: "Ajouter",
          createNewLabel: "Créer : {{label}}",
          creatingNewLabel: "Création : {{label}}",
          newLabel: "Nouveau : {{label}}",
          created: "Créé",
          createdAt: "Créé le",
          deletedSuccessfully: "Supprimé avec succès.",
          none: "Aucun",
          noResults: "Aucun résultat ({{label}}). Il n'y a encore rien ici, ou rien ne correspond à vos filtres.",
          successfullyCreated: "Création réussie : {{label}}",
          successfullyDuplicated: "Duplication réussie : {{label}}",
          titleDeleted: "Suppression réussie : {{label}} « {{title}} »",
          locale: "Langue du contenu",
          locales: "Langues du contenu",
        },
        fields: {
          addNew: "Ajouter",
          addNewLabel: "Ajouter : {{label}}",
          chooseLabel: "Choisir : {{label}}",
          chooseFromExisting: "Choisir parmi l'existant",
          newLabel: "Nouveau : {{label}}",
          uploadNewLabel: "Téléverser : {{label}}",
        },
        version: {
          noRowsFound: "Aucun élément trouvé",
          restoredSuccessfully: "Restauration réussie.",
        },
      },
    },
  },
  // L'API GraphQL n'est pas utilisée (le site lit les données en direct) : désactivée, moins de surface d'attaque.
  graphQL: { disable: true },
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "dev_secret_change_me",
  db: postgresAdapter({
    pool: {
      connectionString:
        process.env.DATABASE_URI || "postgres://maximerit:maximerit_dev@localhost:5432/maximerit",
    },
  }),
  // i18n réel FR/EN du contenu du site (ADR-0002)
  localization: { locales: [{ label: "Français", code: "fr" }, { label: "English", code: "en" }], defaultLocale: "fr" },
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
  // Commandes CLI projet (`payload <key>`). seed-demo : offres de démonstration (dev/recette uniquement).
  bin: [{ key: "seed-demo", scriptPath: path.resolve(dirname, "../scripts/seed-demo-jobs.ts") }],
  // L'ordre des collections = l'ordre du menu. Rubriques : Recrutement · Contacts · Contenu du site · Équipe · Avancé.
  collections: [
    // ─────────────── Recrutement ───────────────
    {
      slug: "jobs",
      labels: { singular: "Offre d'emploi", plural: "Offres d'emploi" },
      admin: {
        useAsTitle: "title",
        group: "Recrutement",
        defaultColumns: ["title", "country", "contractType", "status", "expiresAt"],
        listSearchableFields: ["title", "location"],
        description: "Les offres publiées apparaissent sur la page « Offres d'emploi » du site.",
      },
      defaultSort: "-createdAt",
      access: { read: () => true, create: isAuthenticated, update: isAuthenticated, delete: isAdmin },
      hooks: { beforeValidate: [autoSlug("jobs")], beforeChange: [jobDates] },
      fields: [
        { name: "title", type: "text", required: true, localized: true, label: "Intitulé du poste", admin: { placeholder: "Ex. Géologue d'exploration senior" } },
        {
          type: "row",
          fields: [
            { name: "location", type: "text", label: "Ville / site", admin: { ...half, placeholder: "Ex. Kédougou" } },
            { name: "country", type: "select", label: "Pays", options: countryOptions, admin: half },
          ],
        },
        {
          type: "row",
          fields: [
            { name: "discipline", type: "select", label: "Pôle métier", options: disciplineOptions, admin: half },
            { name: "contractType", type: "select", label: "Type de contrat", defaultValue: "cdi", options: contractOptions, admin: half },
          ],
        },
        { name: "experienceMin", type: "number", label: "Expérience minimale (années)", min: 0, admin: { width: "50%" } },
        { name: "mission", type: "textarea", localized: true, label: "Présentation du poste", admin: { description: "2 à 4 phrases : le contexte et l'objectif du poste." } },
        { name: "responsibilities", type: "textarea", localized: true, label: "Missions et responsabilités", admin: { description: "Une ligne par mission." } },
        { name: "requirements", type: "textarea", localized: true, label: "Profil recherché", admin: { description: "Diplômes, expérience, langues… Une ligne par critère." } },
        {
          name: "status",
          type: "select",
          label: "Statut",
          defaultValue: "brouillon",
          index: true,
          options: [
            { label: "Brouillon (non visible)", value: "brouillon" },
            { label: "Publiée (visible sur le site)", value: "publiee" },
            { label: "Expirée", value: "expiree" },
            { label: "Pourvue (poste pourvu)", value: "pourvue" },
            { label: "Archivée", value: "archivee" },
          ],
          admin: { position: "sidebar", description: "Passez en « Publiée » pour mettre l'offre en ligne." },
        },
        { name: "publishedAt", type: "date", label: "Publiée le", admin: { position: "sidebar", description: "Rempli automatiquement à la publication." } },
        { name: "expiresAt", type: "date", label: "Visible jusqu'au", admin: { position: "sidebar", description: "Après cette date l'offre disparaît du site. Par défaut : 60 jours après la publication." } },
        more("Options avancées", [
          slugField(),
          { name: "sector", type: "select", label: "Secteur d'activité", options: sectorOptions },
          { name: "specialty", type: "text", label: "Précision du métier (facultatif)", admin: { description: "Mot-clé supplémentaire utilisé par la recherche du site." } },
          { name: "similarJobs", type: "relationship", relationTo: "jobs", hasMany: true, admin: { hidden: true } }, // inutilisé : le site calcule les offres similaires
        ]),
      ],
    },
    {
      slug: "applications",
      labels: { singular: "Candidature", plural: "Candidatures" },
      admin: {
        useAsTitle: "id",
        group: "Recrutement",
        defaultColumns: ["candidate", "job", "status", "createdAt"],
        description: "Candidatures reçues depuis le site (formulaire « Postuler »).",
      },
      defaultSort: "-createdAt",
      // Créées via /apply (overrideAccess) ; jamais lisibles publiquement (données candidats).
      access: { read: isAuthenticated, create: isAuthenticated, update: isAuthenticated, delete: isAdmin },
      fields: [
        {
          type: "row",
          fields: [
            { name: "candidate", type: "relationship", relationTo: "candidates", required: true, label: "Candidat", admin: half },
            { name: "job", type: "relationship", relationTo: "jobs", label: "Offre", admin: half },
          ],
        },
        { name: "cv", type: "relationship", relationTo: "cvs", label: "CV" },
        {
          name: "status",
          type: "select",
          label: "Suivi",
          defaultValue: "recue",
          options: [
            { label: "Reçue", value: "recue" },
            { label: "En revue", value: "en-revue" },
            { label: "Retenue", value: "retenue" },
            { label: "Rejetée", value: "rejetee" },
          ],
          admin: { position: "sidebar" },
        },
        more("Origine de la candidature", [
          { name: "source", type: "text", label: "Source", defaultValue: "site" },
          {
            name: "utm",
            type: "group",
            label: "Campagne marketing",
            fields: [
              { name: "source", type: "text", label: "Source" },
              { name: "medium", type: "text", label: "Support" },
              { name: "campaign", type: "text", label: "Campagne" },
            ],
          },
        ]),
      ],
    },
    {
      slug: "candidates",
      labels: { singular: "Candidat", plural: "Candidats" },
      admin: {
        useAsTitle: "email",
        group: "Recrutement",
        defaultColumns: ["firstName", "lastName", "email", "currentPosition", "status", "createdAt"],
        listSearchableFields: ["firstName", "lastName", "email", "currentPosition"],
        description: "Tous les profils reçus (candidatures et dépôts de CV).",
      },
      defaultSort: "-createdAt",
      // Données personnelles : jamais lisibles publiquement ; création via /apply (overrideAccess).
      access: { read: isAuthenticated, create: isAuthenticated, update: isAuthenticated, delete: isAdmin },
      hooks: {
        // Sync Meilisearch (import paresseux : n'alourdit pas l'éval du config ni la CLI ; fail-soft).
        afterChange: [async ({ doc }) => { const { indexCandidate } = await import("./lib/search"); await indexCandidate(doc as never); }],
        afterDelete: [async ({ doc }) => { const { removeCandidate } = await import("./lib/search"); await removeCandidate((doc as { id: number }).id); }],
      },
      fields: [
        {
          type: "row",
          fields: [
            { name: "firstName", type: "text", required: true, label: "Prénom", admin: half },
            { name: "lastName", type: "text", required: true, label: "Nom", admin: half },
          ],
        },
        {
          type: "row",
          fields: [
            { name: "email", type: "email", required: true, index: true, label: "Email", admin: half },
            { name: "phone", type: "text", label: "Téléphone", admin: half },
          ],
        },
        {
          type: "row",
          fields: [
            { name: "currentPosition", type: "text", label: "Poste actuel", admin: half },
            { name: "yearsExperience", type: "number", label: "Années d'expérience", min: 0, admin: half },
          ],
        },
        { name: "cv", type: "relationship", relationTo: "cvs", label: "CV" },
        {
          name: "notes",
          type: "array",
          label: "Notes de l'équipe",
          labels: { singular: "Note", plural: "Notes" },
          admin: { description: "Vos commentaires sur ce candidat (visibles de toute l'équipe).", initCollapsed: false },
          fields: [
            { name: "body", type: "textarea", label: "Note" },
            {
              name: "author",
              type: "relationship",
              relationTo: "users",
              label: "Auteur",
              admin: { readOnly: true },
              hooks: { beforeChange: [({ value, req }) => value ?? req.user?.id] }, // renseigné automatiquement
            },
          ],
        },
        {
          name: "status",
          type: "select",
          label: "Étape du recrutement",
          defaultValue: "nouveau",
          index: true,
          options: [
            { label: "Nouveau", value: "nouveau" },
            { label: "À qualifier", value: "a-qualifier" },
            { label: "Qualifié", value: "qualifie" },
            { label: "Dans le vivier", value: "vivier" },
            { label: "Présélectionné", value: "preselectionne" },
            { label: "Entretien Maximerit", value: "entretien-maximerit" },
            { label: "Shortlist client", value: "shortlist-client" },
            { label: "Entretien client", value: "entretien-client" },
            { label: "Offre en cours", value: "offre" },
            { label: "Placé", value: "place" },
            { label: "Indisponible", value: "indisponible" },
            { label: "Refusé", value: "refuse" },
            { label: "À recontacter", value: "a-recontacter" },
            { label: "Archivé", value: "archive" },
          ],
          admin: { position: "sidebar" },
        },
        { name: "consent", type: "checkbox", required: true, label: "Consentement RGPD", admin: { position: "sidebar", description: "Le candidat accepte le traitement de ses données." } },
        more("Profil détaillé", [
          { name: "whatsapp", type: "text", label: "WhatsApp" },
          { name: "countryOfResidence", type: "text", label: "Pays de résidence" },
          { name: "nationality", type: "text", label: "Nationalité" },
          { name: "internationalMobility", type: "checkbox", label: "Mobilité internationale" },
          { name: "targetDiscipline", type: "text", label: "Pôle visé" },
          { name: "targetSpecialty", type: "text", label: "Métier visé" },
          { name: "sector", type: "text", label: "Secteur" },
          { name: "seniority", type: "text", label: "Niveau de séniorité" },
          { name: "currentCompany", type: "text", label: "Entreprise actuelle" },
          { name: "salaryExpectation", type: "number", label: "Prétentions salariales" },
          { name: "availabilityDays", type: "number", label: "Disponibilité (jours)" },
          { name: "languages", type: "array", label: "Langues", labels: { singular: "Langue", plural: "Langues" }, fields: [{ name: "code", type: "text", label: "Langue (code)" }, { name: "proficiency", type: "text", label: "Niveau" }] },
        ]),
        more("Expérience minière", [
          {
            name: "mining",
            type: "group",
            label: "Expérience minière",
            fields: [
              { name: "commodities", type: "text", hasMany: true, label: "Substances (or, bauxite…)" },
              { name: "mineType", type: "text", hasMany: true, label: "Types de mine" },
              { name: "disciplines", type: "text", hasMany: true, label: "Pôles d'expérience" },
              { name: "countriesExperience", type: "text", hasMany: true, label: "Pays d'expérience" },
              { name: "fifoRoster", type: "checkbox", label: "Disponible en FIFO / roster" },
            ],
          },
        ]),
        more("Données techniques (réservé à l'équipe technique)", [
          { name: "tags", type: "relationship", relationTo: "tags", hasMany: true, label: "Étiquettes" },
          { name: "source", type: "text", label: "Origine", defaultValue: "site" },
          { name: "consentAt", type: "date", label: "Date du consentement" },
          {
            name: "parseStatus",
            type: "select",
            label: "Analyse automatique du CV",
            defaultValue: "pending",
            options: [
              { label: "En attente", value: "pending" },
              { label: "Analysé", value: "parsed" },
              { label: "Validé", value: "validated" },
              { label: "Échec", value: "failed" },
            ],
          },
          // Proposition issue du parsing CV (Phase 5b) — jamais appliquée en aveugle.
          { name: "proposedProfile", type: "json", label: "Proposition issue du CV" },
        ]),
      ],
    },

    // ─────────────── Contacts ───────────────
    {
      slug: "leads",
      labels: { singular: "Demande d'entreprise", plural: "Demandes d'entreprises" },
      admin: {
        useAsTitle: "email",
        group: "Contacts",
        defaultColumns: ["contactName", "company", "email", "status", "createdAt"],
        listSearchableFields: ["contactName", "company", "email"],
        description: "Demandes envoyées depuis le formulaire « Confier un recrutement » et les outils gratuits.",
      },
      defaultSort: "-createdAt",
      // Création publique passe par /submit-lead (anti-spam) → REST create réservé à l'interne.
      access: { create: isAuthenticated, read: isMarketingOrAdmin, update: isMarketingOrAdmin, delete: isAdmin },
      fields: [
        {
          type: "row",
          fields: [
            { name: "contactName", type: "text", required: true, label: "Nom du contact", admin: half },
            { name: "company", type: "text", label: "Entreprise", admin: half },
          ],
        },
        {
          type: "row",
          fields: [
            { name: "email", type: "email", required: true, index: true, label: "Email", admin: half },
            { name: "phone", type: "text", label: "Téléphone", admin: half },
          ],
        },
        { name: "profileSought", type: "text", label: "Profil recherché" },
        { name: "comment", type: "textarea", label: "Message" },
        {
          name: "status",
          type: "select",
          label: "Suivi",
          defaultValue: "nouveau",
          options: [
            { label: "Nouveau", value: "nouveau" },
            { label: "Qualifié", value: "qualifie" },
            { label: "Opportunité", value: "opportunite" },
            { label: "Perdu", value: "perdu" },
          ],
          admin: { position: "sidebar" },
        },
        more("Détails du besoin", [
          { name: "jobFunction", type: "text", label: "Fonction du contact" },
          { name: "country", type: "text", label: "Pays" },
          { name: "sector", type: "text", label: "Secteur" },
          { name: "headcount", type: "number", label: "Nombre de postes" },
          { name: "level", type: "text", label: "Niveau" },
          { name: "location", type: "text", label: "Lieu" },
          { name: "desiredDate", type: "text", label: "Date souhaitée" },
        ]),
        more("Origine de la demande", [
          { name: "source", type: "text", label: "Page d'origine", defaultValue: "site" },
          { name: "landingPage", type: "relationship", relationTo: "landing-pages", label: "Page d'atterrissage" },
          {
            name: "utm",
            type: "group",
            label: "Campagne marketing",
            fields: [
              { name: "source", type: "text", label: "Source" },
              { name: "medium", type: "text", label: "Support" },
              { name: "campaign", type: "text", label: "Campagne" },
              { name: "term", type: "text", label: "Mot-clé" },
              { name: "content", type: "text", label: "Contenu" },
            ],
          },
        ]),
      ],
    },

    // ─────────────── Contenu du site ───────────────
    {
      slug: "articles",
      labels: { singular: "Article", plural: "Articles" },
      admin: {
        useAsTitle: "title",
        group: "Contenu du site",
        defaultColumns: ["title", "category", "status", "publishedAt"],
        listSearchableFields: ["title"],
        description: "Articles du blog. Pour la version anglaise, changez de langue en haut de la fiche.",
      },
      defaultSort: "-createdAt",
      access: { read: () => true, create: isAuthenticated, update: isAuthenticated, delete: isAdmin },
      hooks: { beforeValidate: [autoSlug("articles")], beforeChange: [publishDate] },
      fields: [
        { name: "title", type: "text", required: true, localized: true, label: "Titre" },
        { name: "excerpt", type: "textarea", localized: true, label: "Résumé", admin: { description: "2 phrases affichées dans la liste des articles." } },
        { name: "content", type: "textarea", localized: true, label: "Texte de l'article", admin: { description: "Séparez les paragraphes par une ligne vide." } },
        {
          name: "category",
          type: "select",
          index: true,
          label: "Catégorie",
          options: [
            { label: "Mining", value: "mining" },
            { label: "Recrutement", value: "recrutement" },
            { label: "RH", value: "rh" },
            { label: "Finance", value: "finance" },
            { label: "QHSE", value: "qhse" },
            { label: "Carrière", value: "carriere" },
            { label: "Salaires", value: "salaires" },
            { label: "Marché de l'emploi", value: "marche" },
          ],
          admin: { position: "sidebar" },
        },
        {
          name: "status",
          type: "select",
          label: "Statut",
          defaultValue: "draft",
          index: true,
          options: draftPublished("published", "Publié (visible sur le site)"),
          admin: { position: "sidebar" },
        },
        { name: "publishedAt", type: "date", label: "Publié le", admin: { position: "sidebar", description: "Rempli automatiquement à la publication." } },
        more("Options avancées", [
          slugField(),
          { name: "author", type: "text", label: "Auteur" },
          { name: "related", type: "relationship", relationTo: "articles", hasMany: true, label: "Articles à lire aussi", admin: { description: "Affichés en bas de l'article." } },
        ]),
        seoFields(),
      ],
    },
    {
      slug: "resources",
      labels: { singular: "Ressource", plural: "Ressources (guides, études)" },
      admin: {
        useAsTitle: "title",
        group: "Contenu du site",
        defaultColumns: ["title", "type", "status", "publishedAt"],
        description: "Guides, études et baromètres téléchargeables.",
      },
      defaultSort: "-createdAt",
      access: { read: () => true, create: isAuthenticated, update: isAuthenticated, delete: isAdmin },
      hooks: { beforeValidate: [autoSlug("resources")], beforeChange: [publishDate] },
      fields: [
        {
          name: "type",
          type: "select",
          required: true,
          index: true,
          label: "Type",
          options: [
            { label: "Guide", value: "guides" },
            { label: "Étude", value: "etudes" },
            { label: "Baromètre", value: "barometres" },
          ],
          admin: { position: "sidebar" },
        },
        { name: "title", type: "text", required: true, localized: true, label: "Titre" },
        { name: "description", type: "textarea", localized: true, label: "Description courte" },
        { name: "content", type: "textarea", localized: true, label: "Contenu", admin: { description: "Séparez les paragraphes par une ligne vide." } },
        { name: "gated", type: "checkbox", defaultValue: false, label: "Contenu sur demande", admin: { position: "sidebar", description: "Coché : le visiteur doit remplir un formulaire pour le recevoir." } }, // true = contenu derrière formulaire lead
        {
          name: "status",
          type: "select",
          label: "Statut",
          defaultValue: "draft",
          index: true,
          options: draftPublished("published", "Publié (visible sur le site)"),
          admin: { position: "sidebar" },
        },
        { name: "publishedAt", type: "date", label: "Publié le", admin: { position: "sidebar", description: "Rempli automatiquement à la publication." } },
        more("Options avancées", [slugField()]),
        seoFields(),
      ],
    },
    {
      slug: "pages",
      labels: { singular: "Page libre", plural: "Pages libres" },
      admin: {
        useAsTitle: "title",
        group: "Contenu du site",
        defaultColumns: ["title", "slug", "status", "updatedAt"],
        description: "Pages supplémentaires du site, accessibles à l'adresse /adresse-de-la-page/.",
      },
      access: { read: () => true, create: isAuthenticated, update: isAuthenticated, delete: isAdmin },
      hooks: { beforeValidate: [autoSlug("pages")] },
      fields: [
        { name: "title", type: "text", required: true, localized: true, label: "Titre de la page" },
        { name: "content", type: "textarea", localized: true, label: "Contenu", admin: { description: "Séparez les paragraphes par une ligne vide." } },
        {
          name: "status",
          type: "select",
          label: "Statut",
          defaultValue: "draft",
          options: draftPublished("published", "Publiée (visible sur le site)"),
          admin: { position: "sidebar" },
        },
        more("Options avancées", [slugField()]),
        seoFields(),
      ],
    },

    // ─────────────── Équipe ───────────────
    {
      slug: "users",
      auth: true,
      labels: { singular: "Utilisateur", plural: "Utilisateurs" },
      admin: {
        useAsTitle: "email",
        group: "Équipe",
        hidden: hideUnlessAdmin, // la liste des comptes ne concerne que les administrateurs (« Mon compte » reste accessible à tous)
        defaultColumns: ["email", "firstName", "lastName", "role"],
        description: "Les personnes qui ont accès à cet espace. Seuls les administrateurs peuvent ajouter des comptes.",
      },
      // RBAC : seuls ADMIN/SUPER_ADMIN gèrent les comptes ; lecture réservée aux authentifiés.
      access: { read: isAuthenticated, create: canCreateUser, update: isAdmin, delete: isAdmin },
      hooks: {
        // Le tout premier compte est toujours Super administrateur (sinon il hériterait de « Lecture seule » et ne pourrait rien faire).
        beforeValidate: [
          async ({ data, operation, req }) => {
            if (operation !== "create" || !data) return data;
            const { totalDocs } = await req.payload.count({ collection: "users", req });
            return totalDocs === 0 ? { ...data, role: "SUPER_ADMIN" } : data;
          },
        ],
      },
      fields: [
        {
          type: "row",
          fields: [
            { name: "firstName", type: "text", label: "Prénom", admin: half },
            { name: "lastName", type: "text", label: "Nom", admin: half },
          ],
        },
        {
          name: "role",
          type: "select",
          required: true,
          label: "Rôle",
          defaultValue: "VIEWER",
          options: ROLES.map((r) => ({ label: ROLE_LABELS[r], value: r })),
          admin: {
            description:
              "Le tout premier compte est automatiquement Super administrateur. Administrateur : tout. Recruteur : offres, candidats, candidatures. Responsable contenu : articles et pages. Marketing : demandes d'entreprises et contenu. Lecture seule : consultation.",
          },
        },
      ],
    },

    // ─────────────── Avancé (réservé aux administrateurs) ───────────────
    {
      slug: "landing-pages",
      labels: { singular: "Page marketing", plural: "Pages marketing" },
      admin: {
        useAsTitle: "title",
        group: "Avancé",
        hidden: hideUnlessMarketing,
        description: "Pages d'atterrissage pour les campagnes (adresse /lp/…).",
      },
      // Lecture publique (rendu du site) ; gestion par marketing/content/admin.
      access: { read: () => true, create: isMarketingOrAdmin, update: isMarketingOrAdmin, delete: isAdmin },
      hooks: { beforeValidate: [autoSlug("landing-pages")] },
      fields: [
        { name: "title", type: "text", required: true, localized: true, label: "Titre" },
        { name: "promise", type: "textarea", localized: true, label: "Promesse (sous le titre)" },
        { name: "problem", type: "textarea", localized: true, label: "Le problème" },
        { name: "profiles", type: "array", label: "Profils recherchés", labels: { singular: "Profil", plural: "Profils" }, fields: [{ name: "label", type: "text", label: "Profil" }] },
        { name: "method", type: "textarea", localized: true, label: "Notre méthode" },
        { name: "proof", type: "textarea", localized: true, label: "Preuves" },
        { name: "ctaLabel", type: "text", localized: true, defaultValue: "Confier un recrutement", label: "Texte du bouton" },
        {
          name: "status",
          type: "select",
          label: "Statut",
          defaultValue: "draft",
          options: draftPublished("published", "Publiée (visible sur le site)"),
          admin: { position: "sidebar" },
        },
        { name: "indexable", type: "checkbox", defaultValue: true, label: "Visible dans Google", admin: { position: "sidebar" } },
        more("Options avancées", [slugField()]),
        seoFields(),
      ],
    },
    {
      slug: "redirects",
      labels: { singular: "Redirection", plural: "Redirections" },
      admin: { useAsTitle: "from", group: "Avancé", hidden: hideUnlessAdmin, description: "Réservé à l'équipe technique." },
      // Alimenté par le Master URL Migration File (Phase 0).
      access: { read: () => true, create: isAuthenticated, update: isAuthenticated, delete: isAdmin },
      fields: [
        { name: "from", type: "text", required: true, unique: true, index: true, label: "Ancienne adresse" },
        { name: "to", type: "text", label: "Nouvelle adresse" },
        {
          name: "type",
          type: "select",
          required: true,
          defaultValue: "301",
          label: "Type",
          options: [
            { label: "301 (permanent)", value: "301" },
            { label: "410 (supprimée)", value: "410" },
            { label: "noindex", value: "noindex" },
          ],
        },
      ],
    },
    {
      slug: "tags",
      labels: { singular: "Étiquette", plural: "Étiquettes" },
      admin: { useAsTitle: "label", group: "Avancé", hidden: hideUnlessAdmin, description: "Réservé à l'équipe technique." },
      // Taxonomie administrée (cahier §17) : pas de création libre côté public.
      access: { read: isAuthenticated, create: isAdmin, update: isAdmin, delete: isAdmin },
      fields: [
        { name: "label", type: "text", required: true, label: "Libellé" },
        { name: "slug", type: "text", required: true, unique: true, index: true, label: "Identifiant" },
        { name: "category", type: "text", label: "Catégorie" },
      ],
    },
    {
      slug: "talent-pools",
      labels: { singular: "Vivier", plural: "Viviers" },
      admin: { useAsTitle: "name", group: "Avancé", hidden: hideUnlessAdmin, description: "Réservé à l'équipe technique." },
      access: { read: isAuthenticated, create: isAuthenticated, update: isAuthenticated, delete: isAdmin },
      fields: [
        { name: "name", type: "text", required: true, label: "Nom" },
        { name: "owner", type: "relationship", relationTo: "users", label: "Responsable" },
        {
          name: "type",
          type: "select",
          defaultValue: "static",
          label: "Type",
          options: [
            { label: "Dynamique (requête)", value: "dynamic" },
            { label: "Statique (membres figés)", value: "static" },
          ],
        },
        { name: "query", type: "json", label: "Filtres (vivier dynamique)" },
        { name: "members", type: "relationship", relationTo: "candidates", hasMany: true, label: "Membres" },
        { name: "isShortlist", type: "checkbox", defaultValue: false, label: "Shortlist client" },
      ],
    },

    // ─────────────── Fichiers CV (hors menu : on y accède depuis la fiche du candidat) ───────────────
    {
      slug: "cvs",
      labels: { singular: "CV", plural: "CV" },
      admin: { useAsTitle: "filename", group: false },
      upload: {
        staticDir: path.resolve(dirname, "../cv-uploads"),
        mimeTypes: [
          "application/pdf",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
      },
      // CRITIQUE : aucun CV accessible publiquement (Art. VI). Lecture réservée aux internes.
      access: { read: isAuthenticated, create: isAuthenticated, update: isAuthenticated, delete: isAdmin },
      fields: [{ name: "candidateName", type: "text", label: "Nom du candidat" }],
    },
  ],
});

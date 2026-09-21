import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
import type { Access } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// Rôles RBAC — alignés sur @maximerit/domain (docs/DATA_MODEL.md). Inlinés ici pour rester
// résolvables par la CLI Payload sans transpilation du package workspace.
const ROLES = ["SUPER_ADMIN", "ADMIN", "RECRUITER", "CONTENT_MANAGER", "MARKETING", "VIEWER"] as const;
type Role = (typeof ROLES)[number];

const isAdminRole = (user: unknown): boolean =>
  !!user && ["SUPER_ADMIN", "ADMIN"].includes((user as { role?: Role }).role ?? "VIEWER");

const isAdmin: Access = ({ req: { user } }) => isAdminRole(user);
const isAuthenticated: Access = ({ req: { user } }) => !!user;
const isMarketingOrAdmin: Access = ({ req: { user } }) =>
  isAdminRole(user) || (user as { role?: Role })?.role === "MARKETING";

// Création d'utilisateur : bootstrap du tout premier compte autorisé, puis réservé aux admins.
const canCreateUser: Access = async ({ req }) => {
  if (req.user) return isAdminRole(req.user);
  const { totalDocs } = await req.payload.count({ collection: "users" });
  return totalDocs === 0;
};

export default buildConfig({
  admin: { user: "users" },
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "dev_secret_change_me",
  db: postgresAdapter({
    pool: {
      connectionString:
        process.env.DATABASE_URI || "postgres://maximerit:maximerit_dev@localhost:5432/maximerit",
    },
  }),
  // i18n réel FR/EN (ADR-0002)
  localization: { locales: ["fr", "en"], defaultLocale: "fr" },
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
  collections: [
    {
      slug: "users",
      auth: true,
      admin: { useAsTitle: "email", group: "Administration" },
      // RBAC : seuls ADMIN/SUPER_ADMIN gèrent les comptes ; lecture réservée aux authentifiés.
      access: { read: isAuthenticated, create: canCreateUser, update: isAdmin, delete: isAdmin },
      fields: [
        { name: "firstName", type: "text" },
        { name: "lastName", type: "text" },
        {
          name: "role",
          type: "select",
          required: true,
          defaultValue: "VIEWER",
          options: ROLES.map((r) => ({ label: r, value: r })),
        },
      ],
    },
    {
      slug: "pages",
      admin: { useAsTitle: "title", group: "Contenu" },
      access: { read: () => true, create: isAuthenticated, update: isAuthenticated, delete: isAdmin },
      fields: [
        { name: "title", type: "text", required: true, localized: true },
        { name: "slug", type: "text", required: true, unique: true, index: true },
        { name: "content", type: "textarea", localized: true },
        { name: "seoTitle", type: "text", localized: true },
        { name: "seoDescription", type: "textarea", localized: true },
        {
          name: "status",
          type: "select",
          defaultValue: "draft",
          options: [
            { label: "Brouillon", value: "draft" },
            { label: "Publiée", value: "published" },
          ],
        },
      ],
    },
    {
      slug: "redirects",
      admin: { useAsTitle: "from", group: "SEO" },
      // Alimenté par le Master URL Migration File (Phase 0).
      access: { read: () => true, create: isAuthenticated, update: isAuthenticated, delete: isAdmin },
      fields: [
        { name: "from", type: "text", required: true, unique: true, index: true },
        { name: "to", type: "text" },
        {
          name: "type",
          type: "select",
          required: true,
          defaultValue: "301",
          options: [
            { label: "301 (permanent)", value: "301" },
            { label: "410 (gone)", value: "410" },
            { label: "noindex", value: "noindex" },
          ],
        },
      ],
    },
    {
      slug: "landing-pages",
      admin: { useAsTitle: "title", group: "Acquisition" },
      // Lecture publique (rendu du site) ; gestion par marketing/content/admin.
      access: { read: () => true, create: isMarketingOrAdmin, update: isMarketingOrAdmin, delete: isAdmin },
      fields: [
        { name: "title", type: "text", required: true, localized: true },
        { name: "slug", type: "text", required: true, unique: true, index: true },
        { name: "promise", type: "textarea", localized: true },
        { name: "problem", type: "textarea", localized: true },
        { name: "profiles", type: "array", fields: [{ name: "label", type: "text" }] },
        { name: "method", type: "textarea", localized: true },
        { name: "proof", type: "textarea", localized: true },
        { name: "ctaLabel", type: "text", localized: true, defaultValue: "Confier un recrutement" },
        { name: "indexable", type: "checkbox", defaultValue: true },
        { name: "seoTitle", type: "text", localized: true },
        { name: "seoDescription", type: "textarea", localized: true },
        {
          name: "status",
          type: "select",
          defaultValue: "draft",
          options: [
            { label: "Brouillon", value: "draft" },
            { label: "Publiée", value: "published" },
          ],
        },
      ],
    },
    {
      slug: "leads",
      admin: { useAsTitle: "email", group: "CRM" },
      // Création publique passe par /submit-lead (anti-spam) → REST create réservé à l'interne.
      access: { create: isAuthenticated, read: isMarketingOrAdmin, update: isMarketingOrAdmin, delete: isAdmin },
      fields: [
        { name: "company", type: "text" },
        { name: "contactName", type: "text", required: true },
        { name: "jobFunction", type: "text" },
        { name: "email", type: "email", required: true, index: true },
        { name: "phone", type: "text" },
        { name: "country", type: "text" },
        { name: "sector", type: "text" },
        { name: "profileSought", type: "text" },
        { name: "headcount", type: "number" },
        { name: "level", type: "text" },
        { name: "location", type: "text" },
        { name: "desiredDate", type: "text" },
        { name: "comment", type: "textarea" },
        { name: "source", type: "text", defaultValue: "site" },
        {
          name: "utm",
          type: "group",
          fields: [
            { name: "source", type: "text" },
            { name: "medium", type: "text" },
            { name: "campaign", type: "text" },
            { name: "term", type: "text" },
            { name: "content", type: "text" },
          ],
        },
        { name: "landingPage", type: "relationship", relationTo: "landing-pages" },
        {
          name: "status",
          type: "select",
          defaultValue: "nouveau",
          options: [
            { label: "Nouveau", value: "nouveau" },
            { label: "Qualifié", value: "qualifie" },
            { label: "Opportunité", value: "opportunite" },
            { label: "Perdu", value: "perdu" },
          ],
        },
      ],
    },
    {
      slug: "tags",
      admin: { useAsTitle: "label", group: "ATS" },
      // Taxonomie administrée (cahier §17) : pas de création libre côté public.
      access: { read: isAuthenticated, create: isAdmin, update: isAdmin, delete: isAdmin },
      fields: [
        { name: "label", type: "text", required: true },
        { name: "slug", type: "text", required: true, unique: true, index: true },
        { name: "category", type: "text" },
      ],
    },
    {
      slug: "cvs",
      admin: { useAsTitle: "filename", group: "ATS" },
      upload: {
        staticDir: path.resolve(dirname, "../cv-uploads"),
        mimeTypes: [
          "application/pdf",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
      },
      // CRITIQUE : aucun CV accessible publiquement (Art. VI). Lecture réservée aux internes.
      access: { read: isAuthenticated, create: isAuthenticated, update: isAuthenticated, delete: isAdmin },
      fields: [{ name: "candidateName", type: "text" }],
    },
    {
      slug: "candidates",
      admin: { useAsTitle: "email", group: "ATS" },
      // Données personnelles : jamais lisibles publiquement ; création via /apply (overrideAccess).
      access: { read: isAuthenticated, create: isAuthenticated, update: isAuthenticated, delete: isAdmin },
      fields: [
        // Identité
        { name: "firstName", type: "text", required: true },
        { name: "lastName", type: "text", required: true },
        { name: "email", type: "email", required: true, index: true },
        { name: "phone", type: "text" },
        { name: "whatsapp", type: "text" },
        { name: "countryOfResidence", type: "text" },
        { name: "nationality", type: "text" },
        { name: "internationalMobility", type: "checkbox" },
        // Professionnel
        { name: "currentPosition", type: "text" },
        { name: "targetSpecialty", type: "text" },
        { name: "targetDiscipline", type: "text" },
        { name: "sector", type: "text" },
        { name: "yearsExperience", type: "number" },
        { name: "seniority", type: "text" },
        { name: "currentCompany", type: "text" },
        { name: "salaryExpectation", type: "number" },
        { name: "availabilityDays", type: "number" },
        { name: "languages", type: "array", fields: [{ name: "code", type: "text" }, { name: "proficiency", type: "text" }] },
        // Bloc Mining
        {
          name: "mining",
          type: "group",
          fields: [
            { name: "commodities", type: "text", hasMany: true },
            { name: "mineType", type: "text", hasMany: true },
            { name: "disciplines", type: "text", hasMany: true },
            { name: "countriesExperience", type: "text", hasMany: true },
            { name: "fifoRoster", type: "checkbox" },
          ],
        },
        // ATS
        { name: "cv", type: "relationship", relationTo: "cvs" },
        { name: "tags", type: "relationship", relationTo: "tags", hasMany: true },
        { name: "notes", type: "array", fields: [{ name: "body", type: "textarea" }, { name: "author", type: "relationship", relationTo: "users" }] },
        {
          name: "status",
          type: "select",
          defaultValue: "nouveau",
          index: true,
          options: [
            "nouveau", "a-qualifier", "qualifie", "vivier", "preselectionne",
            "entretien-maximerit", "shortlist-client", "entretien-client", "offre", "place",
            "indisponible", "refuse", "a-recontacter", "archive",
          ].map((v) => ({ label: v, value: v })),
        },
        {
          name: "parseStatus",
          type: "select",
          defaultValue: "pending",
          options: [
            { label: "En attente", value: "pending" },
            { label: "Analysé", value: "parsed" },
            { label: "Validé", value: "validated" },
            { label: "Échec", value: "failed" },
          ],
        },
        { name: "source", type: "text", defaultValue: "site" },
        { name: "consent", type: "checkbox", required: true },
        { name: "consentAt", type: "date" },
      ],
    },
  ],
});

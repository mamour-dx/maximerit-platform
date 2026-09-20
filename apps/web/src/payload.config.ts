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
  ],
});

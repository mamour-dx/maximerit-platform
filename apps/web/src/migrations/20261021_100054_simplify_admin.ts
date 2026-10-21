import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Pays / pôle / secteur : texte libre → listes fermées. On nettoie d'abord les valeurs existantes
  // (casse, ancienne valeur « mines ») ; ce qui ne correspond à aucune valeur connue est vidé, jamais bloquant.
  await db.execute(sql`
   UPDATE "jobs" SET "country" = upper(trim("country")) WHERE "country" IS NOT NULL;
  UPDATE "jobs" SET "country" = NULL WHERE "country" IS NOT NULL AND "country" NOT IN ('SN', 'GN', 'CI', 'ML', 'MR', 'BF', 'GH');
  UPDATE "jobs" SET "discipline" = lower(trim("discipline")) WHERE "discipline" IS NOT NULL;
  UPDATE "jobs" SET "discipline" = NULL WHERE "discipline" IS NOT NULL AND "discipline" NOT IN ('geologie-exploration', 'exploitation-operations', 'finance-miniere', 'leadership-executive-search');
  UPDATE "jobs" SET "sector" = 'mines-ressources-naturelles' WHERE lower(trim("sector")) IN ('mines', 'mining');
  UPDATE "jobs" SET "sector" = lower(trim("sector")) WHERE "sector" IS NOT NULL;
  UPDATE "jobs" SET "sector" = NULL WHERE "sector" IS NOT NULL AND "sector" NOT IN ('mines-ressources-naturelles', 'energie', 'petrole-gaz', 'btp-infrastructures', 'industrie', 'services');`)

  await db.execute(sql`
   CREATE TYPE "public"."enum_jobs_country" AS ENUM('SN', 'GN', 'CI', 'ML', 'MR', 'BF', 'GH');
  CREATE TYPE "public"."enum_jobs_discipline" AS ENUM('geologie-exploration', 'exploitation-operations', 'finance-miniere', 'leadership-executive-search');
  CREATE TYPE "public"."enum_jobs_sector" AS ENUM('mines-ressources-naturelles', 'energie', 'petrole-gaz', 'btp-infrastructures', 'industrie', 'services');
  ALTER TABLE "pages" ALTER COLUMN "slug" DROP NOT NULL;
  ALTER TABLE "landing_pages" ALTER COLUMN "slug" DROP NOT NULL;
  ALTER TABLE "jobs" ALTER COLUMN "slug" DROP NOT NULL;
  ALTER TABLE "jobs" ALTER COLUMN "sector" SET DATA TYPE "public"."enum_jobs_sector" USING "sector"::"public"."enum_jobs_sector";
  ALTER TABLE "jobs" ALTER COLUMN "discipline" SET DATA TYPE "public"."enum_jobs_discipline" USING "discipline"::"public"."enum_jobs_discipline";
  ALTER TABLE "jobs" ALTER COLUMN "country" SET DATA TYPE "public"."enum_jobs_country" USING "country"::"public"."enum_jobs_country";
  ALTER TABLE "articles" ALTER COLUMN "slug" DROP NOT NULL;
  ALTER TABLE "resources" ALTER COLUMN "slug" DROP NOT NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "jobs" ALTER COLUMN "country" SET DATA TYPE varchar;
  ALTER TABLE "jobs" ALTER COLUMN "discipline" SET DATA TYPE varchar;
  ALTER TABLE "jobs" ALTER COLUMN "slug" SET NOT NULL;
  ALTER TABLE "jobs" ALTER COLUMN "sector" SET DATA TYPE varchar;
  ALTER TABLE "articles" ALTER COLUMN "slug" SET NOT NULL;
  ALTER TABLE "resources" ALTER COLUMN "slug" SET NOT NULL;
  ALTER TABLE "pages" ALTER COLUMN "slug" SET NOT NULL;
  ALTER TABLE "landing_pages" ALTER COLUMN "slug" SET NOT NULL;
  DROP TYPE "public"."enum_jobs_country";
  DROP TYPE "public"."enum_jobs_discipline";
  DROP TYPE "public"."enum_jobs_sector";`)
}

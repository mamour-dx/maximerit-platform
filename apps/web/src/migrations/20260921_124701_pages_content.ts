import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_locales" ADD COLUMN "content" varchar;
  ALTER TABLE "pages_locales" ADD COLUMN "seo_title" varchar;
  ALTER TABLE "pages_locales" ADD COLUMN "seo_description" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_locales" DROP COLUMN "content";
  ALTER TABLE "pages_locales" DROP COLUMN "seo_title";
  ALTER TABLE "pages_locales" DROP COLUMN "seo_description";`)
}

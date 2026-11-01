import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "applications" ADD COLUMN "cover_letter_id" integer;
  ALTER TABLE "applications" ADD COLUMN "cover_letter_text" varchar;
  ALTER TABLE "candidates" ADD COLUMN "cover_letter_id" integer;
  ALTER TABLE "candidates" ADD COLUMN "cover_letter_text" varchar;
  ALTER TABLE "cvs" ADD COLUMN "prefix" varchar DEFAULT 'cvs';
  ALTER TABLE "cvs" ADD COLUMN "_objectkey" varchar;
  ALTER TABLE "applications" ADD CONSTRAINT "applications_cover_letter_id_cvs_id_fk" FOREIGN KEY ("cover_letter_id") REFERENCES "public"."cvs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "candidates" ADD CONSTRAINT "candidates_cover_letter_id_cvs_id_fk" FOREIGN KEY ("cover_letter_id") REFERENCES "public"."cvs"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "applications_cover_letter_idx" ON "applications" USING btree ("cover_letter_id");
  CREATE INDEX "candidates_cover_letter_idx" ON "candidates" USING btree ("cover_letter_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "applications" DROP CONSTRAINT "applications_cover_letter_id_cvs_id_fk";
  
  ALTER TABLE "candidates" DROP CONSTRAINT "candidates_cover_letter_id_cvs_id_fk";
  
  DROP INDEX "applications_cover_letter_idx";
  DROP INDEX "candidates_cover_letter_idx";
  ALTER TABLE "applications" DROP COLUMN "cover_letter_id";
  ALTER TABLE "applications" DROP COLUMN "cover_letter_text";
  ALTER TABLE "candidates" DROP COLUMN "cover_letter_id";
  ALTER TABLE "candidates" DROP COLUMN "cover_letter_text";
  ALTER TABLE "cvs" DROP COLUMN "prefix";
  ALTER TABLE "cvs" DROP COLUMN "_objectkey";`)
}

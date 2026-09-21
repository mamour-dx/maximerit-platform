import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_candidates_status" AS ENUM('nouveau', 'a-qualifier', 'qualifie', 'vivier', 'preselectionne', 'entretien-maximerit', 'shortlist-client', 'entretien-client', 'offre', 'place', 'indisponible', 'refuse', 'a-recontacter', 'archive');
  CREATE TYPE "public"."enum_candidates_parse_status" AS ENUM('pending', 'parsed', 'validated', 'failed');
  CREATE TABLE "tags" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"category" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "cvs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"candidate_name" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "candidates_languages" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"code" varchar,
  	"proficiency" varchar
  );
  
  CREATE TABLE "candidates_notes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"body" varchar,
  	"author_id" integer
  );
  
  CREATE TABLE "candidates" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"first_name" varchar NOT NULL,
  	"last_name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"phone" varchar,
  	"whatsapp" varchar,
  	"country_of_residence" varchar,
  	"nationality" varchar,
  	"international_mobility" boolean,
  	"current_position" varchar,
  	"target_specialty" varchar,
  	"target_discipline" varchar,
  	"sector" varchar,
  	"years_experience" numeric,
  	"seniority" varchar,
  	"current_company" varchar,
  	"salary_expectation" numeric,
  	"availability_days" numeric,
  	"mining_fifo_roster" boolean,
  	"cv_id" integer,
  	"status" "enum_candidates_status" DEFAULT 'nouveau',
  	"parse_status" "enum_candidates_parse_status" DEFAULT 'pending',
  	"source" varchar DEFAULT 'site',
  	"consent" boolean DEFAULT false NOT NULL,
  	"consent_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "candidates_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "candidates_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"tags_id" integer
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "tags_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "cvs_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "candidates_id" integer;
  ALTER TABLE "candidates_languages" ADD CONSTRAINT "candidates_languages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "candidates_notes" ADD CONSTRAINT "candidates_notes_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "candidates_notes" ADD CONSTRAINT "candidates_notes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "candidates" ADD CONSTRAINT "candidates_cv_id_cvs_id_fk" FOREIGN KEY ("cv_id") REFERENCES "public"."cvs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "candidates_texts" ADD CONSTRAINT "candidates_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "candidates_rels" ADD CONSTRAINT "candidates_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "candidates_rels" ADD CONSTRAINT "candidates_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "tags_slug_idx" ON "tags" USING btree ("slug");
  CREATE INDEX "tags_updated_at_idx" ON "tags" USING btree ("updated_at");
  CREATE INDEX "tags_created_at_idx" ON "tags" USING btree ("created_at");
  CREATE INDEX "cvs_updated_at_idx" ON "cvs" USING btree ("updated_at");
  CREATE INDEX "cvs_created_at_idx" ON "cvs" USING btree ("created_at");
  CREATE UNIQUE INDEX "cvs_filename_idx" ON "cvs" USING btree ("filename");
  CREATE INDEX "candidates_languages_order_idx" ON "candidates_languages" USING btree ("_order");
  CREATE INDEX "candidates_languages_parent_id_idx" ON "candidates_languages" USING btree ("_parent_id");
  CREATE INDEX "candidates_notes_order_idx" ON "candidates_notes" USING btree ("_order");
  CREATE INDEX "candidates_notes_parent_id_idx" ON "candidates_notes" USING btree ("_parent_id");
  CREATE INDEX "candidates_notes_author_idx" ON "candidates_notes" USING btree ("author_id");
  CREATE INDEX "candidates_email_idx" ON "candidates" USING btree ("email");
  CREATE INDEX "candidates_cv_idx" ON "candidates" USING btree ("cv_id");
  CREATE INDEX "candidates_status_idx" ON "candidates" USING btree ("status");
  CREATE INDEX "candidates_updated_at_idx" ON "candidates" USING btree ("updated_at");
  CREATE INDEX "candidates_created_at_idx" ON "candidates" USING btree ("created_at");
  CREATE INDEX "candidates_texts_order_parent" ON "candidates_texts" USING btree ("order","parent_id");
  CREATE INDEX "candidates_rels_order_idx" ON "candidates_rels" USING btree ("order");
  CREATE INDEX "candidates_rels_parent_idx" ON "candidates_rels" USING btree ("parent_id");
  CREATE INDEX "candidates_rels_path_idx" ON "candidates_rels" USING btree ("path");
  CREATE INDEX "candidates_rels_tags_id_idx" ON "candidates_rels" USING btree ("tags_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_cvs_fk" FOREIGN KEY ("cvs_id") REFERENCES "public"."cvs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_candidates_fk" FOREIGN KEY ("candidates_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_tags_id_idx" ON "payload_locked_documents_rels" USING btree ("tags_id");
  CREATE INDEX "payload_locked_documents_rels_cvs_id_idx" ON "payload_locked_documents_rels" USING btree ("cvs_id");
  CREATE INDEX "payload_locked_documents_rels_candidates_id_idx" ON "payload_locked_documents_rels" USING btree ("candidates_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "tags" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cvs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "candidates_languages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "candidates_notes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "candidates" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "candidates_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "candidates_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "tags" CASCADE;
  DROP TABLE "cvs" CASCADE;
  DROP TABLE "candidates_languages" CASCADE;
  DROP TABLE "candidates_notes" CASCADE;
  DROP TABLE "candidates" CASCADE;
  DROP TABLE "candidates_texts" CASCADE;
  DROP TABLE "candidates_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_tags_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_cvs_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_candidates_fk";
  
  DROP INDEX "payload_locked_documents_rels_tags_id_idx";
  DROP INDEX "payload_locked_documents_rels_cvs_id_idx";
  DROP INDEX "payload_locked_documents_rels_candidates_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "tags_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "cvs_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "candidates_id";
  DROP TYPE "public"."enum_candidates_status";
  DROP TYPE "public"."enum_candidates_parse_status";`)
}

import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_landing_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_leads_status" AS ENUM('nouveau', 'qualifie', 'opportunite', 'perdu');
  CREATE TABLE "landing_pages_profiles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar
  );
  
  CREATE TABLE "landing_pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"indexable" boolean DEFAULT true,
  	"status" "enum_landing_pages_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "landing_pages_locales" (
  	"title" varchar NOT NULL,
  	"promise" varchar,
  	"problem" varchar,
  	"method" varchar,
  	"proof" varchar,
  	"cta_label" varchar DEFAULT 'Confier un recrutement',
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "leads" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"company" varchar,
  	"contact_name" varchar NOT NULL,
  	"job_function" varchar,
  	"email" varchar NOT NULL,
  	"phone" varchar,
  	"country" varchar,
  	"sector" varchar,
  	"profile_sought" varchar,
  	"headcount" numeric,
  	"level" varchar,
  	"location" varchar,
  	"desired_date" varchar,
  	"comment" varchar,
  	"source" varchar DEFAULT 'site',
  	"utm_source" varchar,
  	"utm_medium" varchar,
  	"utm_campaign" varchar,
  	"utm_term" varchar,
  	"utm_content" varchar,
  	"landing_page_id" integer,
  	"status" "enum_leads_status" DEFAULT 'nouveau',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "landing_pages_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "leads_id" integer;
  ALTER TABLE "landing_pages_profiles" ADD CONSTRAINT "landing_pages_profiles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_locales" ADD CONSTRAINT "landing_pages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "leads" ADD CONSTRAINT "leads_landing_page_id_landing_pages_id_fk" FOREIGN KEY ("landing_page_id") REFERENCES "public"."landing_pages"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "landing_pages_profiles_order_idx" ON "landing_pages_profiles" USING btree ("_order");
  CREATE INDEX "landing_pages_profiles_parent_id_idx" ON "landing_pages_profiles" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "landing_pages_slug_idx" ON "landing_pages" USING btree ("slug");
  CREATE INDEX "landing_pages_updated_at_idx" ON "landing_pages" USING btree ("updated_at");
  CREATE INDEX "landing_pages_created_at_idx" ON "landing_pages" USING btree ("created_at");
  CREATE UNIQUE INDEX "landing_pages_locales_locale_parent_id_unique" ON "landing_pages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "leads_email_idx" ON "leads" USING btree ("email");
  CREATE INDEX "leads_landing_page_idx" ON "leads" USING btree ("landing_page_id");
  CREATE INDEX "leads_updated_at_idx" ON "leads" USING btree ("updated_at");
  CREATE INDEX "leads_created_at_idx" ON "leads" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_landing_pages_fk" FOREIGN KEY ("landing_pages_id") REFERENCES "public"."landing_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_leads_fk" FOREIGN KEY ("leads_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_landing_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("landing_pages_id");
  CREATE INDEX "payload_locked_documents_rels_leads_id_idx" ON "payload_locked_documents_rels" USING btree ("leads_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "landing_pages_profiles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "leads" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "landing_pages_profiles" CASCADE;
  DROP TABLE "landing_pages" CASCADE;
  DROP TABLE "landing_pages_locales" CASCADE;
  DROP TABLE "leads" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_landing_pages_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_leads_fk";
  
  DROP INDEX "payload_locked_documents_rels_landing_pages_id_idx";
  DROP INDEX "payload_locked_documents_rels_leads_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "landing_pages_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "leads_id";
  DROP TYPE "public"."enum_landing_pages_status";
  DROP TYPE "public"."enum_leads_status";`)
}

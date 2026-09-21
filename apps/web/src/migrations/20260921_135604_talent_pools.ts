import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_talent_pools_type" AS ENUM('dynamic', 'static');
  CREATE TABLE "talent_pools" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"owner_id" integer,
  	"type" "enum_talent_pools_type" DEFAULT 'static',
  	"query" jsonb,
  	"is_shortlist" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "talent_pools_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"candidates_id" integer
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "talent_pools_id" integer;
  ALTER TABLE "talent_pools" ADD CONSTRAINT "talent_pools_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "talent_pools_rels" ADD CONSTRAINT "talent_pools_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."talent_pools"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "talent_pools_rels" ADD CONSTRAINT "talent_pools_rels_candidates_fk" FOREIGN KEY ("candidates_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "talent_pools_owner_idx" ON "talent_pools" USING btree ("owner_id");
  CREATE INDEX "talent_pools_updated_at_idx" ON "talent_pools" USING btree ("updated_at");
  CREATE INDEX "talent_pools_created_at_idx" ON "talent_pools" USING btree ("created_at");
  CREATE INDEX "talent_pools_rels_order_idx" ON "talent_pools_rels" USING btree ("order");
  CREATE INDEX "talent_pools_rels_parent_idx" ON "talent_pools_rels" USING btree ("parent_id");
  CREATE INDEX "talent_pools_rels_path_idx" ON "talent_pools_rels" USING btree ("path");
  CREATE INDEX "talent_pools_rels_candidates_id_idx" ON "talent_pools_rels" USING btree ("candidates_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_talent_pools_fk" FOREIGN KEY ("talent_pools_id") REFERENCES "public"."talent_pools"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_talent_pools_id_idx" ON "payload_locked_documents_rels" USING btree ("talent_pools_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "talent_pools" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "talent_pools_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "talent_pools" CASCADE;
  DROP TABLE "talent_pools_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_talent_pools_fk";
  
  DROP INDEX "payload_locked_documents_rels_talent_pools_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "talent_pools_id";
  DROP TYPE "public"."enum_talent_pools_type";`)
}

CREATE TABLE "project_concepts" (
	"project_id" uuid NOT NULL,
	"concept_id" uuid NOT NULL,
	"source" text DEFAULT 'manual' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "project_concepts_project_id_concept_id_pk" PRIMARY KEY("project_id","concept_id")
);
--> statement-breakpoint
CREATE TABLE "project_contexts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" text NOT NULL,
	"stable_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "project_concepts" ADD CONSTRAINT "project_concepts_project_id_project_contexts_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project_contexts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_concepts" ADD CONSTRAINT "project_concepts_concept_id_concepts_id_fk" FOREIGN KEY ("concept_id") REFERENCES "public"."concepts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_contexts" ADD CONSTRAINT "project_contexts_owner_id_owners_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."owners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "project_concepts_concept_idx" ON "project_concepts" USING btree ("concept_id");--> statement-breakpoint
CREATE UNIQUE INDEX "project_contexts_owner_stable_idx" ON "project_contexts" USING btree ("owner_id","stable_id");
CREATE TABLE "review_schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" text NOT NULL,
	"concept_id" uuid NOT NULL,
	"current_mastery_state" text NOT NULL,
	"last_reviewed_at" timestamp with time zone,
	"next_review_at" timestamp with time zone NOT NULL,
	"review_count" integer DEFAULT 0 NOT NULL,
	"recent_quality" integer DEFAULT 0 NOT NULL,
	"policy_version" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "review_schedules" ADD CONSTRAINT "review_schedules_owner_id_owners_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."owners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_schedules" ADD CONSTRAINT "review_schedules_concept_id_concepts_id_fk" FOREIGN KEY ("concept_id") REFERENCES "public"."concepts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "review_schedules_owner_concept_idx" ON "review_schedules" USING btree ("owner_id","concept_id");--> statement-breakpoint
CREATE INDEX "review_schedules_owner_next_idx" ON "review_schedules" USING btree ("owner_id","next_review_at");
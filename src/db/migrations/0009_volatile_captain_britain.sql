CREATE TABLE "generation_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" text NOT NULL,
	"mode" text NOT NULL,
	"provider" text NOT NULL,
	"model" text,
	"target_schema" text NOT NULL,
	"spec" jsonb NOT NULL,
	"compiled_prompt" jsonb,
	"status" text NOT NULL,
	"status_timeline" jsonb NOT NULL,
	"raw_response_metadata_hash" text,
	"validation_result" jsonb,
	"provider_usage" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "generation_jobs" ADD CONSTRAINT "generation_jobs_owner_id_owners_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."owners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "generation_jobs_owner_created_idx" ON "generation_jobs" USING btree ("owner_id","created_at");--> statement-breakpoint
CREATE INDEX "generation_jobs_owner_status_idx" ON "generation_jobs" USING btree ("owner_id","status");
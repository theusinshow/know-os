CREATE TABLE "badge_awards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" text NOT NULL,
	"badge_id" text NOT NULL,
	"label" text NOT NULL,
	"criteria_snapshot" text NOT NULL,
	"source_type" text NOT NULL,
	"source_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mission_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" text NOT NULL,
	"mission_id" text NOT NULL,
	"label" text NOT NULL,
	"criteria_snapshot" text NOT NULL,
	"status" text NOT NULL,
	"href" text NOT NULL,
	"completed_at" timestamp with time zone,
	"source_type" text NOT NULL,
	"source_id" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mission_progress_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" text NOT NULL,
	"mission_id" text NOT NULL,
	"previous_status" text,
	"next_status" text NOT NULL,
	"source_type" text NOT NULL,
	"source_id" text NOT NULL,
	"payload" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "badge_awards" ADD CONSTRAINT "badge_awards_owner_id_owners_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."owners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_progress" ADD CONSTRAINT "mission_progress_owner_id_owners_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."owners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_progress_events" ADD CONSTRAINT "mission_progress_events_owner_id_owners_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."owners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "badge_awards_owner_badge_idx" ON "badge_awards" USING btree ("owner_id","badge_id");--> statement-breakpoint
CREATE INDEX "badge_awards_owner_created_idx" ON "badge_awards" USING btree ("owner_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "mission_progress_owner_mission_idx" ON "mission_progress" USING btree ("owner_id","mission_id");--> statement-breakpoint
CREATE INDEX "mission_progress_owner_status_idx" ON "mission_progress" USING btree ("owner_id","status");--> statement-breakpoint
CREATE INDEX "mission_progress_events_owner_created_idx" ON "mission_progress_events" USING btree ("owner_id","created_at");
CREATE TABLE "activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stable_id" text NOT NULL,
	"lesson_id" uuid NOT NULL,
	"type" text NOT NULL,
	"prompt" text NOT NULL,
	"order_index" integer NOT NULL,
	"config" jsonb NOT NULL,
	"evaluator_version" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "concepts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stable_id" text NOT NULL,
	"title" text NOT NULL,
	"summary" text
);
--> statement-breakpoint
CREATE TABLE "content_blocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stable_id" text NOT NULL,
	"lesson_id" uuid NOT NULL,
	"type" text NOT NULL,
	"order_index" integer NOT NULL,
	"payload" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lesson_concepts" (
	"lesson_id" uuid NOT NULL,
	"concept_id" uuid NOT NULL,
	CONSTRAINT "lesson_concepts_lesson_id_concept_id_pk" PRIMARY KEY("lesson_id","concept_id")
);
--> statement-breakpoint
CREATE TABLE "lessons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stable_id" text NOT NULL,
	"module_id" uuid NOT NULL,
	"title" text NOT NULL,
	"content_version" integer NOT NULL,
	"order_index" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "modules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stable_id" text NOT NULL,
	"track_id" uuid NOT NULL,
	"title" text NOT NULL,
	"order_index" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pack_imports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"schema" text NOT NULL,
	"pack_id" text NOT NULL,
	"version" integer NOT NULL,
	"content_hash" text NOT NULL,
	"status" text NOT NULL,
	"manifest" jsonb NOT NULL,
	"imported_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tracks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stable_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"pack_import_id" uuid NOT NULL,
	"content_version" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attempt_test_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attempt_id" uuid NOT NULL,
	"name" text NOT NULL,
	"status" text NOT NULL,
	"message" text
);
--> statement-breakpoint
CREATE TABLE "attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" text NOT NULL,
	"activity_id" uuid NOT NULL,
	"attempt_number" integer NOT NULL,
	"response" jsonb NOT NULL,
	"outcome" text NOT NULL,
	"output" jsonb NOT NULL,
	"evaluator_version" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lesson_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" text NOT NULL,
	"lesson_id" uuid NOT NULL,
	"submitted_activities" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "owners" (
	"id" text PRIMARY KEY NOT NULL,
	"display_name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "study_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" text NOT NULL,
	"type" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"payload" jsonb NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "track_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" text NOT NULL,
	"track_id" uuid NOT NULL,
	"completed_lessons" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_blocks" ADD CONSTRAINT "content_blocks_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_concepts" ADD CONSTRAINT "lesson_concepts_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_concepts" ADD CONSTRAINT "lesson_concepts_concept_id_concepts_id_fk" FOREIGN KEY ("concept_id") REFERENCES "public"."concepts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "modules" ADD CONSTRAINT "modules_track_id_tracks_id_fk" FOREIGN KEY ("track_id") REFERENCES "public"."tracks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tracks" ADD CONSTRAINT "tracks_pack_import_id_pack_imports_id_fk" FOREIGN KEY ("pack_import_id") REFERENCES "public"."pack_imports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempt_test_results" ADD CONSTRAINT "attempt_test_results_attempt_id_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."attempts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_owner_id_owners_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."owners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_owner_id_owners_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."owners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_events" ADD CONSTRAINT "study_events_owner_id_owners_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."owners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "track_progress" ADD CONSTRAINT "track_progress_owner_id_owners_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."owners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "track_progress" ADD CONSTRAINT "track_progress_track_id_tracks_id_fk" FOREIGN KEY ("track_id") REFERENCES "public"."tracks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "activities_lesson_stable_idx" ON "activities" USING btree ("lesson_id","stable_id");--> statement-breakpoint
CREATE UNIQUE INDEX "concepts_stable_idx" ON "concepts" USING btree ("stable_id");--> statement-breakpoint
CREATE UNIQUE INDEX "content_blocks_lesson_stable_idx" ON "content_blocks" USING btree ("lesson_id","stable_id");--> statement-breakpoint
CREATE UNIQUE INDEX "lessons_stable_version_idx" ON "lessons" USING btree ("stable_id","content_version");--> statement-breakpoint
CREATE UNIQUE INDEX "modules_track_stable_idx" ON "modules" USING btree ("track_id","stable_id");--> statement-breakpoint
CREATE UNIQUE INDEX "pack_imports_pack_version_idx" ON "pack_imports" USING btree ("pack_id","version");--> statement-breakpoint
CREATE UNIQUE INDEX "tracks_stable_version_idx" ON "tracks" USING btree ("stable_id","content_version");--> statement-breakpoint
CREATE UNIQUE INDEX "lesson_progress_owner_lesson_idx" ON "lesson_progress" USING btree ("owner_id","lesson_id");--> statement-breakpoint
CREATE UNIQUE INDEX "track_progress_owner_track_idx" ON "track_progress" USING btree ("owner_id","track_id");
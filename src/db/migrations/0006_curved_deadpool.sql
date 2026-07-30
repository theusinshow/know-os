CREATE TABLE "project_activities" (
	"project_id" uuid NOT NULL,
	"activity_id" uuid NOT NULL,
	"source" text DEFAULT 'manual' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "project_activities_project_id_activity_id_pk" PRIMARY KEY("project_id","activity_id")
);
--> statement-breakpoint
ALTER TABLE "project_activities" ADD CONSTRAINT "project_activities_project_id_project_contexts_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project_contexts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_activities" ADD CONSTRAINT "project_activities_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "project_activities_activity_idx" ON "project_activities" USING btree ("activity_id");
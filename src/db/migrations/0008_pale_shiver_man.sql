CREATE TABLE "restore_provenance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" text NOT NULL,
	"source_export_fingerprint" text NOT NULL,
	"source_record_kind" text NOT NULL,
	"source_record_id" text NOT NULL,
	"source_content_key" text NOT NULL,
	"local_record_kind" text NOT NULL,
	"local_record_id" text NOT NULL,
	"payload_hash" text NOT NULL,
	"applied_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "restore_provenance" ADD CONSTRAINT "restore_provenance_owner_id_owners_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."owners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "restore_provenance_source_record_idx" ON "restore_provenance" USING btree ("owner_id","source_export_fingerprint","source_record_kind","source_record_id");--> statement-breakpoint
CREATE INDEX "restore_provenance_owner_export_idx" ON "restore_provenance" USING btree ("owner_id","source_export_fingerprint");
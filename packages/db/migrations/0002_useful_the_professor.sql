CREATE TYPE "public"."citation_target" AS ENUM('destination_content_block', 'route', 'route_applicability');--> statement-breakpoint
CREATE TYPE "public"."content_scope" AS ENUM('destination', 'citizenship_destination', 'route', 'route_citizenship', 'assumption');--> statement-breakpoint
CREATE TABLE "content_citations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_document_id" uuid NOT NULL,
	"target_type" "citation_target" NOT NULL,
	"target_id" uuid NOT NULL,
	"field_path" text,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "destination_content_blocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"destination_country_id" uuid NOT NULL,
	"section_key" text NOT NULL,
	"block_key" text NOT NULL,
	"scope" "content_scope" NOT NULL,
	"citizenship_id" uuid,
	"route_id" uuid,
	"assumptions" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"content" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"target_path" text NOT NULL,
	"source_run_id" uuid,
	"review_status" "review_status" DEFAULT 'draft' NOT NULL,
	"confidence" "confidence" DEFAULT 'low' NOT NULL,
	"is_demo" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "source_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "source_type" NOT NULL,
	"label" text NOT NULL,
	"url" text NOT NULL,
	"publisher" text,
	"last_reviewed_at" timestamp with time zone,
	"snapshot" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "route_applicability" ADD COLUMN "review_status" "review_status" DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE "route_applicability" ADD COLUMN "confidence" "confidence" DEFAULT 'low' NOT NULL;--> statement-breakpoint
ALTER TABLE "route_applicability" ADD COLUMN "is_demo" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "content_citations" ADD CONSTRAINT "content_citations_source_document_id_source_documents_id_fk" FOREIGN KEY ("source_document_id") REFERENCES "public"."source_documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "destination_content_blocks" ADD CONSTRAINT "destination_content_blocks_destination_country_id_destination_countries_id_fk" FOREIGN KEY ("destination_country_id") REFERENCES "public"."destination_countries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "destination_content_blocks" ADD CONSTRAINT "destination_content_blocks_citizenship_id_citizenships_id_fk" FOREIGN KEY ("citizenship_id") REFERENCES "public"."citizenships"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "content_citations_source_document_idx" ON "content_citations" USING btree ("source_document_id");--> statement-breakpoint
CREATE INDEX "content_citations_target_idx" ON "content_citations" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX "destination_content_blocks_destination_idx" ON "destination_content_blocks" USING btree ("destination_country_id");--> statement-breakpoint
CREATE INDEX "destination_content_blocks_citizenship_idx" ON "destination_content_blocks" USING btree ("citizenship_id");--> statement-breakpoint
CREATE INDEX "destination_content_blocks_route_idx" ON "destination_content_blocks" USING btree ("route_id");--> statement-breakpoint
CREATE INDEX "destination_content_blocks_scope_idx" ON "destination_content_blocks" USING btree ("scope");--> statement-breakpoint
CREATE UNIQUE INDEX "destination_content_blocks_target_idx" ON "destination_content_blocks" USING btree ("target_path");--> statement-breakpoint
CREATE UNIQUE INDEX "source_documents_url_idx" ON "source_documents" USING btree ("url");
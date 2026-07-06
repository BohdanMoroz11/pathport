ALTER TABLE "arrival_context" ADD COLUMN "profile" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "citizenships" ADD COLUMN "flag" text;--> statement-breakpoint
ALTER TABLE "destination_countries" ADD COLUMN "flag" text;--> statement-breakpoint
ALTER TABLE "destination_countries" ADD COLUMN "tagline" text;--> statement-breakpoint
ALTER TABLE "destination_countries" ADD COLUMN "region" text;--> statement-breakpoint
ALTER TABLE "destination_countries" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "destination_countries" ADD COLUMN "profile" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "destination_countries" ADD COLUMN "review_status" "review_status" DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE "destination_countries" ADD COLUMN "confidence" "confidence" DEFAULT 'low' NOT NULL;--> statement-breakpoint
ALTER TABLE "destination_countries" ADD COLUMN "is_demo" boolean DEFAULT false NOT NULL;
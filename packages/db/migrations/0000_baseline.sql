CREATE TYPE "public"."confidence" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."path_to_pr" AS ENUM('none', 'eventual', 'direct');--> statement-breakpoint
CREATE TYPE "public"."review_status" AS ENUM('draft', 'needs_review', 'reviewed', 'outdated');--> statement-breakpoint
CREATE TYPE "public"."route_type" AS ENUM('work', 'study', 'family', 'freelance', 'digital_nomad', 'business', 'humanitarian', 'long_stay', 'other');--> statement-breakpoint
CREATE TYPE "public"."source_type" AS ENUM('official', 'legal', 'community', 'ai_assisted', 'other');--> statement-breakpoint
CREATE TYPE "public"."work_permission" AS ENUM('none', 'limited', 'full');--> statement-breakpoint
CREATE TABLE "arrival_context" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"citizenship_id" uuid NOT NULL,
	"destination_country_id" uuid NOT NULL,
	"visa_free_days" integer,
	"summary" text NOT NULL,
	"review_status" "review_status" DEFAULT 'draft' NOT NULL,
	"confidence" "confidence" DEFAULT 'low' NOT NULL,
	"is_demo" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "citizenships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(3) NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "citizenships_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "destination_countries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(2) NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "destination_countries_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "route_applicability" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"route_id" uuid NOT NULL,
	"citizenship_id" uuid NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "route_sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"route_id" uuid NOT NULL,
	"type" "source_type" NOT NULL,
	"label" text NOT NULL,
	"url" text NOT NULL,
	"last_reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "routes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"destination_country_id" uuid NOT NULL,
	"type" "route_type" NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"cost_min" integer,
	"cost_max" integer,
	"cost_currency" varchar(3),
	"timeline_min_months" integer,
	"timeline_max_months" integer,
	"work_permission" "work_permission" NOT NULL,
	"family_inclusion" boolean DEFAULT false NOT NULL,
	"family_inclusion_note" text,
	"path_to_permanent_residence" "path_to_pr" NOT NULL,
	"path_to_permanent_residence_note" text,
	"renewable" boolean DEFAULT false NOT NULL,
	"renewable_note" text,
	"details" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"review_status" "review_status" DEFAULT 'draft' NOT NULL,
	"confidence" "confidence" DEFAULT 'low' NOT NULL,
	"is_demo" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "arrival_context" ADD CONSTRAINT "arrival_context_citizenship_id_citizenships_id_fk" FOREIGN KEY ("citizenship_id") REFERENCES "public"."citizenships"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "arrival_context" ADD CONSTRAINT "arrival_context_destination_country_id_destination_countries_id_fk" FOREIGN KEY ("destination_country_id") REFERENCES "public"."destination_countries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "route_applicability" ADD CONSTRAINT "route_applicability_route_id_routes_id_fk" FOREIGN KEY ("route_id") REFERENCES "public"."routes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "route_applicability" ADD CONSTRAINT "route_applicability_citizenship_id_citizenships_id_fk" FOREIGN KEY ("citizenship_id") REFERENCES "public"."citizenships"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "route_sources" ADD CONSTRAINT "route_sources_route_id_routes_id_fk" FOREIGN KEY ("route_id") REFERENCES "public"."routes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routes" ADD CONSTRAINT "routes_destination_country_id_destination_countries_id_fk" FOREIGN KEY ("destination_country_id") REFERENCES "public"."destination_countries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "arrival_context_citizenship_destination_idx" ON "arrival_context" USING btree ("citizenship_id","destination_country_id");--> statement-breakpoint
CREATE INDEX "arrival_context_destination_country_id_idx" ON "arrival_context" USING btree ("destination_country_id");--> statement-breakpoint
CREATE UNIQUE INDEX "route_applicability_route_citizenship_idx" ON "route_applicability" USING btree ("route_id","citizenship_id");--> statement-breakpoint
CREATE INDEX "route_applicability_citizenship_id_idx" ON "route_applicability" USING btree ("citizenship_id");--> statement-breakpoint
CREATE INDEX "route_sources_route_id_idx" ON "route_sources" USING btree ("route_id");--> statement-breakpoint
CREATE INDEX "routes_destination_country_id_idx" ON "routes" USING btree ("destination_country_id");--> statement-breakpoint
CREATE INDEX "routes_type_idx" ON "routes" USING btree ("type");
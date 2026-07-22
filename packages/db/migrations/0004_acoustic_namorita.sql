CREATE TYPE "public"."evidence_trust_tier" AS ENUM('primary', 'secondary', 'community', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."ingestion_claim_decision" AS ENUM('pending', 'approved', 'rejected', 'held', 'edited');--> statement-breakpoint
CREATE TYPE "public"."ingestion_operation" AS ENUM('create', 'update');--> statement-breakpoint
CREATE TYPE "public"."ingestion_proposal_status" AS ENUM('pending', 'approved', 'rejected', 'partially_applied', 'blocked', 'applied', 'superseded');--> statement-breakpoint
CREATE TYPE "public"."ingestion_run_status" AS ENUM('queued', 'running', 'completed', 'failed', 'budget_exceeded');--> statement-breakpoint
CREATE TYPE "public"."ingestion_run_type" AS ENUM('discovery', 'extraction', 'refresh', 'fake');--> statement-breakpoint
CREATE TYPE "public"."ingestion_target_kind" AS ENUM('content_block', 'route', 'route_applicability', 'source_document', 'citation');--> statement-breakpoint
CREATE TYPE "public"."ingestion_trigger" AS ENUM('manual', 'scheduled');--> statement-breakpoint
CREATE TYPE "public"."reviewer_kind" AS ENUM('human', 'ai');--> statement-breakpoint
CREATE TABLE "ingestion_claim_evidence" (
	"claim_id" uuid NOT NULL,
	"evidence_id" uuid NOT NULL,
	CONSTRAINT "ingestion_claim_evidence_claim_id_evidence_id_pk" PRIMARY KEY("claim_id","evidence_id")
);
--> statement-breakpoint
CREATE TABLE "ingestion_claims" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"proposal_id" uuid NOT NULL,
	"field_path" text NOT NULL,
	"value" jsonb NOT NULL,
	"required" boolean DEFAULT false NOT NULL,
	"confidence" "confidence" NOT NULL,
	"judge_score_basis_points" integer,
	"note" text,
	"decision" "ingestion_claim_decision" DEFAULT 'pending' NOT NULL,
	"edited_value" jsonb,
	"reviewed_by" text,
	"reviewer_kind" "reviewer_kind",
	"reviewed_at" timestamp with time zone,
	"decision_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ingestion_evidence" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"run_id" uuid NOT NULL,
	"url" text NOT NULL,
	"source_type" "source_type" NOT NULL,
	"title" text NOT NULL,
	"publisher" text,
	"retrieved_at" timestamp with time zone NOT NULL,
	"content_hash" text NOT NULL,
	"snapshot" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"trust_tier" "evidence_trust_tier" DEFAULT 'unknown' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ingestion_proposals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"run_id" uuid NOT NULL,
	"target_kind" "ingestion_target_kind" NOT NULL,
	"operation" "ingestion_operation" NOT NULL,
	"target_ref" uuid,
	"target" jsonb NOT NULL,
	"contract_version" text NOT NULL,
	"payload" jsonb NOT NULL,
	"dedup_key" text NOT NULL,
	"status" "ingestion_proposal_status" DEFAULT 'pending' NOT NULL,
	"supersedes_id" uuid,
	"decision_summary" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"applied_record_ref" uuid,
	"applied_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ingestion_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_run_id" uuid,
	"type" "ingestion_run_type" NOT NULL,
	"target" jsonb NOT NULL,
	"status" "ingestion_run_status" DEFAULT 'queued' NOT NULL,
	"trigger" "ingestion_trigger" DEFAULT 'manual' NOT NULL,
	"model_id" text,
	"prompt_version" text NOT NULL,
	"guardrail_version" text NOT NULL,
	"agent_version" text NOT NULL,
	"idempotency_key" text NOT NULL,
	"tokens_in" integer DEFAULT 0 NOT NULL,
	"tokens_out" integer DEFAULT 0 NOT NULL,
	"call_count" integer DEFAULT 0 NOT NULL,
	"cost_estimate_micros" integer DEFAULT 0 NOT NULL,
	"model_pricing" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"token_budget" integer,
	"cost_ceiling_micros" integer,
	"child_tokens_in" integer DEFAULT 0 NOT NULL,
	"child_tokens_out" integer DEFAULT 0 NOT NULL,
	"child_cost_estimate_micros" integer DEFAULT 0 NOT NULL,
	"error" text,
	"raw_trace_ref" text,
	"started_at" timestamp with time zone,
	"finished_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "destination_content_blocks" ADD COLUMN "source_proposal_id" uuid;--> statement-breakpoint
ALTER TABLE "route_applicability" ADD COLUMN "source_run_id" uuid;--> statement-breakpoint
ALTER TABLE "route_applicability" ADD COLUMN "source_proposal_id" uuid;--> statement-breakpoint
ALTER TABLE "routes" ADD COLUMN "source_run_id" uuid;--> statement-breakpoint
ALTER TABLE "routes" ADD COLUMN "source_proposal_id" uuid;--> statement-breakpoint
ALTER TABLE "source_documents" ADD COLUMN "source_run_id" uuid;--> statement-breakpoint
ALTER TABLE "source_documents" ADD COLUMN "source_proposal_id" uuid;--> statement-breakpoint
ALTER TABLE "ingestion_claim_evidence" ADD CONSTRAINT "ingestion_claim_evidence_claim_id_ingestion_claims_id_fk" FOREIGN KEY ("claim_id") REFERENCES "public"."ingestion_claims"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingestion_claim_evidence" ADD CONSTRAINT "ingestion_claim_evidence_evidence_id_ingestion_evidence_id_fk" FOREIGN KEY ("evidence_id") REFERENCES "public"."ingestion_evidence"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingestion_claims" ADD CONSTRAINT "ingestion_claims_proposal_id_ingestion_proposals_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "public"."ingestion_proposals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingestion_evidence" ADD CONSTRAINT "ingestion_evidence_run_id_ingestion_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."ingestion_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingestion_proposals" ADD CONSTRAINT "ingestion_proposals_run_id_ingestion_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."ingestion_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ingestion_claim_evidence_evidence_idx" ON "ingestion_claim_evidence" USING btree ("evidence_id");--> statement-breakpoint
CREATE INDEX "ingestion_claims_proposal_idx" ON "ingestion_claims" USING btree ("proposal_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ingestion_claims_proposal_field_idx" ON "ingestion_claims" USING btree ("proposal_id","field_path");--> statement-breakpoint
CREATE INDEX "ingestion_evidence_run_idx" ON "ingestion_evidence" USING btree ("run_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ingestion_evidence_run_hash_idx" ON "ingestion_evidence" USING btree ("run_id","content_hash");--> statement-breakpoint
CREATE INDEX "ingestion_proposals_run_idx" ON "ingestion_proposals" USING btree ("run_id");--> statement-breakpoint
CREATE INDEX "ingestion_proposals_status_idx" ON "ingestion_proposals" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "ingestion_proposals_dedup_idx" ON "ingestion_proposals" USING btree ("dedup_key");--> statement-breakpoint
CREATE INDEX "ingestion_runs_parent_idx" ON "ingestion_runs" USING btree ("parent_run_id");--> statement-breakpoint
CREATE INDEX "ingestion_runs_status_idx" ON "ingestion_runs" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "ingestion_runs_idempotency_idx" ON "ingestion_runs" USING btree ("idempotency_key");
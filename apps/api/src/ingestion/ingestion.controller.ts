import { BadRequestException, Body, Controller, Inject, Param, Post } from "@nestjs/common";
import { WriteService } from "../write/write.service";
import { IngestionService, type ReviewClaimInput } from "./ingestion.service";

@Controller("local-ingestion")
export class IngestionController {
  constructor(
    @Inject(IngestionService) private readonly ingestion: IngestionService,
    @Inject(WriteService) private readonly writes: WriteService,
  ) {}

  @Post("fake-runs")
  triggerFake() {
    this.writes.assertLocalWritesAllowed();
    return this.ingestion.triggerFakeResearch();
  }

  @Post("research-runs")
  triggerResearch() {
    this.writes.assertLocalWritesAllowed();
    return this.ingestion.triggerResearch();
  }

  @Post("claims/:id/review")
  reviewClaim(@Param("id") id: string, @Body() body: unknown) {
    this.writes.assertLocalWritesAllowed();
    return this.ingestion.reviewClaim(id, parseReviewBody(body));
  }

  @Post("proposals/:id/publish")
  publish(@Param("id") id: string) {
    this.writes.assertLocalWritesAllowed();
    return this.ingestion.publishProposal(id);
  }
}

function parseReviewBody(value: unknown): ReviewClaimInput {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new BadRequestException("Review body must be an object.");
  }
  const body = value as Record<string, unknown>;
  const decisions = ["approved", "rejected", "held", "edited"] as const;
  if (!decisions.includes(body.decision as (typeof decisions)[number])) {
    throw new BadRequestException("Invalid claim decision.");
  }
  if (typeof body.reviewer !== "string" || body.reviewer.trim() === "") {
    throw new BadRequestException("reviewer is required.");
  }
  return {
    decision: body.decision as ReviewClaimInput["decision"],
    editedValue: body.editedValue,
    note: typeof body.note === "string" ? body.note : undefined,
    reviewer: body.reviewer,
  };
}

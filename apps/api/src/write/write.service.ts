import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  citizenships,
  contentCitations,
  destinationContentBlocks,
  destinationCountries,
  parseRouteDetails,
  routeApplicability,
  routes,
  sourceDocuments,
} from "@pathport/db";
import { eq } from "drizzle-orm";
import { DatabaseService } from "../database/database.service";
import type {
  CreateCitationBody,
  CreateRouteBody,
  UpsertContentBlockBody,
  UpsertRouteApplicabilityBody,
  UpsertSourceDocumentBody,
} from "./write.validation";

@Injectable()
export class WriteService {
  constructor(@Inject(DatabaseService) private readonly database: DatabaseService) {}

  assertLocalWritesAllowed(): void {
    if (
      process.env.NODE_ENV === "production" &&
      process.env.PATHPORT_ENABLE_LOCAL_WRITES !== "true"
    ) {
      throw new ForbiddenException("Local write endpoints are disabled in production.");
    }
  }

  async upsertContentBlock(body: UpsertContentBlockBody) {
    const destinationId = await this.requireDestinationId(body.destinationCode);
    const citizenshipId = body.citizenshipCode
      ? await this.requireCitizenshipId(body.citizenshipCode)
      : null;
    const targetPath =
      body.targetPath ??
      this.defaultContentTargetPath(body.destinationCode, body.blockKey, body.citizenshipCode);

    const values = {
      destinationCountryId: destinationId,
      sectionKey: body.sectionKey,
      blockKey: body.blockKey,
      scope: body.scope,
      citizenshipId,
      routeId: body.routeId ?? null,
      assumptions: body.assumptions ?? {},
      content: body.content,
      targetPath,
      reviewStatus: body.reviewStatus ?? "draft",
      confidence: body.confidence ?? "low",
      isDemo: body.isDemo ?? false,
    } as const;

    const [row] = await this.database.client
      .insert(destinationContentBlocks)
      .values(values)
      .onConflictDoUpdate({
        target: destinationContentBlocks.targetPath,
        set: {
          sectionKey: values.sectionKey,
          blockKey: values.blockKey,
          scope: values.scope,
          citizenshipId: values.citizenshipId,
          routeId: values.routeId,
          assumptions: values.assumptions,
          content: values.content,
          reviewStatus: values.reviewStatus,
          confidence: values.confidence,
          isDemo: values.isDemo,
          updatedAt: new Date(),
        },
      })
      .returning();

    return row;
  }

  async createRoute(body: CreateRouteBody) {
    const destinationCountryId = await this.requireDestinationId(body.destinationCode);
    const [row] = await this.database.client
      .insert(routes)
      .values({
        destinationCountryId,
        type: body.type,
        title: body.title,
        summary: body.summary,
        costMin: body.costMin ?? null,
        costMax: body.costMax ?? null,
        costCurrency: body.costCurrency ?? null,
        timelineMinMonths: body.timelineMinMonths ?? null,
        timelineMaxMonths: body.timelineMaxMonths ?? null,
        workPermission: body.workPermission,
        familyInclusion: body.familyInclusion ?? false,
        familyInclusionNote: body.familyInclusionNote ?? null,
        pathToPermanentResidence: body.pathToPermanentResidence,
        pathToPermanentResidenceNote: body.pathToPermanentResidenceNote ?? null,
        renewable: body.renewable ?? false,
        renewableNote: body.renewableNote ?? null,
        details: parseRouteDetails(body.details ?? {}),
        reviewStatus: body.reviewStatus ?? "draft",
        confidence: body.confidence ?? "low",
        isDemo: body.isDemo ?? false,
      })
      .returning();

    if (!row) {
      throw new BadRequestException("Route insert did not return a row.");
    }
    return row;
  }

  async upsertRouteApplicability(body: UpsertRouteApplicabilityBody) {
    const citizenshipId = await this.requireCitizenshipId(body.citizenshipCode);
    const [row] = await this.database.client
      .insert(routeApplicability)
      .values({
        routeId: body.routeId,
        citizenshipId,
        note: body.note ?? null,
        reviewStatus: body.reviewStatus ?? "draft",
        confidence: body.confidence ?? "low",
        isDemo: body.isDemo ?? false,
      })
      .onConflictDoUpdate({
        target: [routeApplicability.routeId, routeApplicability.citizenshipId],
        set: {
          note: body.note ?? null,
          reviewStatus: body.reviewStatus ?? "draft",
          confidence: body.confidence ?? "low",
          isDemo: body.isDemo ?? false,
          updatedAt: new Date(),
        },
      })
      .returning();

    return row;
  }

  async upsertSourceDocument(body: UpsertSourceDocumentBody) {
    const [row] = await this.database.client
      .insert(sourceDocuments)
      .values({
        type: body.type,
        label: body.label,
        url: body.url,
        publisher: body.publisher ?? null,
        lastReviewedAt: body.lastReviewedAt ? new Date(body.lastReviewedAt) : null,
        snapshot: body.snapshot ?? {},
      })
      .onConflictDoUpdate({
        target: sourceDocuments.url,
        set: {
          type: body.type,
          label: body.label,
          publisher: body.publisher ?? null,
          lastReviewedAt: body.lastReviewedAt ? new Date(body.lastReviewedAt) : null,
          snapshot: body.snapshot ?? {},
          updatedAt: new Date(),
        },
      })
      .returning();

    return row;
  }

  async createCitation(body: CreateCitationBody) {
    const [row] = await this.database.client
      .insert(contentCitations)
      .values({
        sourceDocumentId: body.sourceDocumentId,
        targetType: body.targetType,
        targetId: body.targetId,
        fieldPath: body.fieldPath ?? null,
        note: body.note ?? null,
      })
      .returning();

    return row;
  }

  private async requireCitizenshipId(code: string): Promise<string> {
    const [row] = await this.database.client
      .select({ id: citizenships.id })
      .from(citizenships)
      .where(eq(citizenships.code, code.toUpperCase()))
      .limit(1);
    if (!row) {
      throw new NotFoundException(`Unknown citizenship "${code}".`);
    }
    return row.id;
  }

  private async requireDestinationId(code: string): Promise<string> {
    const [row] = await this.database.client
      .select({ id: destinationCountries.id })
      .from(destinationCountries)
      .where(eq(destinationCountries.code, code.toUpperCase()))
      .limit(1);
    if (!row) {
      throw new NotFoundException(`Unknown destination "${code}".`);
    }
    return row.id;
  }

  private defaultContentTargetPath(
    destinationCode: string,
    blockKey: string,
    citizenshipCode?: string,
  ): string {
    if (citizenshipCode) {
      return `${citizenshipCode.toUpperCase()}→${destinationCode.toUpperCase()}.${blockKey}`;
    }
    return `${destinationCode.toUpperCase()}.${blockKey}`;
  }
}

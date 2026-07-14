import { BadRequestException } from "@nestjs/common";

const CONTENT_SCOPES = [
  "destination",
  "citizenship_destination",
  "route",
  "route_citizenship",
  "assumption",
] as const;
const REVIEW_STATUSES = ["draft", "needs_review", "reviewed", "outdated"] as const;
const CONFIDENCES = ["low", "medium", "high"] as const;
const ROUTE_TYPES = [
  "work",
  "study",
  "family",
  "freelance",
  "digital_nomad",
  "business",
  "humanitarian",
  "long_stay",
  "other",
] as const;
const WORK_PERMISSIONS = ["none", "limited", "full"] as const;
const PATHS_TO_PR = ["none", "eventual", "direct"] as const;
const SOURCE_TYPES = ["official", "legal", "community", "ai_assisted", "other"] as const;
const CITATION_TARGETS = ["destination_content_block", "route", "route_applicability"] as const;

type TupleValue<T extends readonly string[]> = T[number];

type JsonObject = Record<string, unknown>;

export type UpsertContentBlockBody = {
  destinationCode: string;
  sectionKey: string;
  blockKey: string;
  scope: TupleValue<typeof CONTENT_SCOPES>;
  citizenshipCode?: string;
  routeId?: string;
  assumptions?: JsonObject;
  content: unknown;
  targetPath?: string;
  reviewStatus?: TupleValue<typeof REVIEW_STATUSES>;
  confidence?: TupleValue<typeof CONFIDENCES>;
  isDemo?: boolean;
};

export type CreateRouteBody = {
  destinationCode: string;
  type: TupleValue<typeof ROUTE_TYPES>;
  title: string;
  summary: string;
  costMin?: number;
  costMax?: number;
  costCurrency?: string;
  timelineMinMonths?: number;
  timelineMaxMonths?: number;
  workPermission: TupleValue<typeof WORK_PERMISSIONS>;
  familyInclusion?: boolean;
  familyInclusionNote?: string;
  pathToPermanentResidence: TupleValue<typeof PATHS_TO_PR>;
  pathToPermanentResidenceNote?: string;
  renewable?: boolean;
  renewableNote?: string;
  details?: unknown;
  reviewStatus?: TupleValue<typeof REVIEW_STATUSES>;
  confidence?: TupleValue<typeof CONFIDENCES>;
  isDemo?: boolean;
};

export type UpsertRouteApplicabilityBody = {
  routeId: string;
  citizenshipCode: string;
  note?: string;
  reviewStatus?: TupleValue<typeof REVIEW_STATUSES>;
  confidence?: TupleValue<typeof CONFIDENCES>;
  isDemo?: boolean;
};

export type UpsertSourceDocumentBody = {
  type: TupleValue<typeof SOURCE_TYPES>;
  label: string;
  url: string;
  publisher?: string;
  lastReviewedAt?: string;
  snapshot?: JsonObject;
};

export type CreateCitationBody = {
  sourceDocumentId: string;
  targetType: TupleValue<typeof CITATION_TARGETS>;
  targetId: string;
  fieldPath?: string;
  note?: string;
};

export function parseContentBlockBody(value: unknown): UpsertContentBlockBody {
  const body = object(value);
  return {
    destinationCode: requiredString(body, "destinationCode"),
    sectionKey: requiredString(body, "sectionKey"),
    blockKey: requiredString(body, "blockKey"),
    scope: requiredEnum(body, "scope", CONTENT_SCOPES),
    citizenshipCode: optionalString(body, "citizenshipCode"),
    routeId: optionalString(body, "routeId"),
    assumptions: optionalObject(body, "assumptions"),
    content: required(body, "content"),
    targetPath: optionalString(body, "targetPath"),
    reviewStatus: optionalEnum(body, "reviewStatus", REVIEW_STATUSES),
    confidence: optionalEnum(body, "confidence", CONFIDENCES),
    isDemo: optionalBoolean(body, "isDemo"),
  };
}

export function parseRouteBody(value: unknown): CreateRouteBody {
  const body = object(value);
  return {
    destinationCode: requiredString(body, "destinationCode"),
    type: requiredEnum(body, "type", ROUTE_TYPES),
    title: requiredString(body, "title"),
    summary: requiredString(body, "summary"),
    costMin: optionalNumber(body, "costMin"),
    costMax: optionalNumber(body, "costMax"),
    costCurrency: optionalString(body, "costCurrency"),
    timelineMinMonths: optionalNumber(body, "timelineMinMonths"),
    timelineMaxMonths: optionalNumber(body, "timelineMaxMonths"),
    workPermission: requiredEnum(body, "workPermission", WORK_PERMISSIONS),
    familyInclusion: optionalBoolean(body, "familyInclusion"),
    familyInclusionNote: optionalString(body, "familyInclusionNote"),
    pathToPermanentResidence: requiredEnum(body, "pathToPermanentResidence", PATHS_TO_PR),
    pathToPermanentResidenceNote: optionalString(body, "pathToPermanentResidenceNote"),
    renewable: optionalBoolean(body, "renewable"),
    renewableNote: optionalString(body, "renewableNote"),
    details: body.details,
    reviewStatus: optionalEnum(body, "reviewStatus", REVIEW_STATUSES),
    confidence: optionalEnum(body, "confidence", CONFIDENCES),
    isDemo: optionalBoolean(body, "isDemo"),
  };
}

export function parseRouteApplicabilityBody(value: unknown): UpsertRouteApplicabilityBody {
  const body = object(value);
  return {
    routeId: requiredString(body, "routeId"),
    citizenshipCode: requiredString(body, "citizenshipCode"),
    note: optionalString(body, "note"),
    reviewStatus: optionalEnum(body, "reviewStatus", REVIEW_STATUSES),
    confidence: optionalEnum(body, "confidence", CONFIDENCES),
    isDemo: optionalBoolean(body, "isDemo"),
  };
}

export function parseSourceDocumentBody(value: unknown): UpsertSourceDocumentBody {
  const body = object(value);
  return {
    type: requiredEnum(body, "type", SOURCE_TYPES),
    label: requiredString(body, "label"),
    url: requiredString(body, "url"),
    publisher: optionalString(body, "publisher"),
    lastReviewedAt: optionalString(body, "lastReviewedAt"),
    snapshot: optionalObject(body, "snapshot"),
  };
}

export function parseCitationBody(value: unknown): CreateCitationBody {
  const body = object(value);
  return {
    sourceDocumentId: requiredString(body, "sourceDocumentId"),
    targetType: requiredEnum(body, "targetType", CITATION_TARGETS),
    targetId: requiredString(body, "targetId"),
    fieldPath: optionalString(body, "fieldPath"),
    note: optionalString(body, "note"),
  };
}

function object(value: unknown): JsonObject {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new BadRequestException("Request body must be an object.");
  }
  return value as JsonObject;
}

function required(body: JsonObject, key: string): unknown {
  if (!(key in body)) {
    throw new BadRequestException(`Missing required field "${key}".`);
  }
  return body[key];
}

function requiredString(body: JsonObject, key: string): string {
  const value = required(body, key);
  if (typeof value !== "string" || value.trim() === "") {
    throw new BadRequestException(`Field "${key}" must be a non-empty string.`);
  }
  return value;
}

function optionalString(body: JsonObject, key: string): string | undefined {
  const value = body[key];
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value !== "string") {
    throw new BadRequestException(`Field "${key}" must be a string.`);
  }
  return value;
}

function optionalNumber(body: JsonObject, key: string): number | undefined {
  const value = body[key];
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new BadRequestException(`Field "${key}" must be a finite number.`);
  }
  return value;
}

function optionalBoolean(body: JsonObject, key: string): boolean | undefined {
  const value = body[key];
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value !== "boolean") {
    throw new BadRequestException(`Field "${key}" must be a boolean.`);
  }
  return value;
}

function optionalObject(body: JsonObject, key: string): JsonObject | undefined {
  const value = body[key];
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value !== "object" || Array.isArray(value)) {
    throw new BadRequestException(`Field "${key}" must be an object.`);
  }
  return value as JsonObject;
}

function requiredEnum<T extends readonly string[]>(
  body: JsonObject,
  key: string,
  allowed: T,
): TupleValue<T> {
  const value = requiredString(body, key);
  if (!allowed.includes(value)) {
    throw new BadRequestException(`Field "${key}" must be one of: ${allowed.join(", ")}.`);
  }
  return value as TupleValue<T>;
}

function optionalEnum<T extends readonly string[]>(
  body: JsonObject,
  key: string,
  allowed: T,
): TupleValue<T> | undefined {
  const value = optionalString(body, key);
  if (value === undefined) {
    return undefined;
  }
  if (!allowed.includes(value)) {
    throw new BadRequestException(`Field "${key}" must be one of: ${allowed.join(", ")}.`);
  }
  return value as TupleValue<T>;
}

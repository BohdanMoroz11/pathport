export type ReviewableClaim = {
  fieldPath: string;
  value: unknown;
  required: boolean;
  decision: "pending" | "approved" | "rejected" | "held" | "edited";
  editedValue: unknown;
};

export type PublishAssembly =
  | { status: "blocked"; missingRequiredFields: string[] }
  | {
      status: "applied" | "partially_applied";
      payload: Record<string, unknown>;
      publishedFields: string[];
    };

export function assembleReviewedClaims(claims: ReviewableClaim[]): PublishAssembly {
  const missingRequiredFields = claims
    .filter((claim) => claim.required && !isCleared(claim.decision))
    .map((claim) => claim.fieldPath);
  if (missingRequiredFields.length > 0) {
    return { status: "blocked", missingRequiredFields };
  }

  const payload: Record<string, unknown> = {};
  const publishedFields: string[] = [];
  for (const claim of claims) {
    if (!isCleared(claim.decision)) continue;
    setAtPath(
      payload,
      claim.fieldPath,
      claim.decision === "edited" ? claim.editedValue : claim.value,
    );
    publishedFields.push(claim.fieldPath);
  }

  const fullyApplied = claims.every((claim) => isCleared(claim.decision));
  return { status: fullyApplied ? "applied" : "partially_applied", payload, publishedFields };
}

function isCleared(decision: ReviewableClaim["decision"]): boolean {
  return decision === "approved" || decision === "edited";
}

function setAtPath(target: Record<string, unknown>, path: string, value: unknown): void {
  const parts = path.split(".");
  let cursor = target;
  for (const part of parts.slice(0, -1)) {
    const current = cursor[part];
    if (typeof current === "object" && current !== null && !Array.isArray(current)) {
      cursor = current as Record<string, unknown>;
    } else {
      const child: Record<string, unknown> = {};
      cursor[part] = child;
      cursor = child;
    }
  }
  const leaf = parts.at(-1);
  if (!leaf) throw new Error("Claim field path cannot be empty.");
  cursor[leaf] = value;
}

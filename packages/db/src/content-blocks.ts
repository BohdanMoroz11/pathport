import type { DestinationDetail, DestinationPairing } from "@pathport/contracts";

export type ContentScope =
  | "destination"
  | "citizenship_destination"
  | "route"
  | "route_citizenship"
  | "assumption";

export type DestinationContentBlockInput = {
  sectionKey: string;
  blockKey: string;
  scope: ContentScope;
  content: unknown;
  assumptions?: Record<string, unknown>;
};

export type ArrivalSummaryContent = {
  visaFreeDays?: number;
  summary: string;
};

const DESTINATION_DETAIL_BLOCKS = [
  { sectionKey: "overview", blockKey: "quickFacts", scope: "destination" },
  { sectionKey: "country", blockKey: "country", scope: "destination" },
  { sectionKey: "living", blockKey: "living", scope: "assumption" },
  { sectionKey: "work", blockKey: "work", scope: "assumption" },
  { sectionKey: "family", blockKey: "family", scope: "assumption" },
] as const satisfies ReadonlyArray<{
  sectionKey: string;
  blockKey: keyof DestinationDetail;
  scope: ContentScope;
}>;

const PAIRING_BLOCKS = [
  { sectionKey: "country", blockKey: "language", scope: "citizenship_destination" },
  { sectionKey: "entry", blockKey: "entry", scope: "citizenship_destination" },
  { sectionKey: "entry", blockKey: "entryDetail", scope: "citizenship_destination" },
  { sectionKey: "overview", blockKey: "glance", scope: "citizenship_destination" },
  { sectionKey: "overview", blockKey: "fitsYouIf", scope: "route_citizenship" },
] as const satisfies ReadonlyArray<{
  sectionKey: string;
  blockKey: keyof DestinationPairing;
  scope: ContentScope;
}>;

export function destinationTargetPath(destinationCode: string, blockKey: string): string {
  return `${destinationCode.toUpperCase()}.${blockKey}`;
}

export function pairingTargetPath(
  citizenshipCode: string,
  destinationCode: string,
  blockKey: string,
): string {
  return `${citizenshipCode.toUpperCase()}→${destinationCode.toUpperCase()}.${blockKey}`;
}

export function arrivalSummaryTargetPath(citizenshipCode: string, destinationCode: string): string {
  return pairingTargetPath(citizenshipCode, destinationCode, "arrivalSummary");
}

export function routeTargetPath(destinationCode: string, routeKey: string): string {
  return `${destinationCode.toUpperCase()}.route.${routeKey}`;
}

export function routeApplicabilityTargetPath(
  citizenshipCode: string,
  destinationCode: string,
  routeKey: string,
): string {
  return `${citizenshipCode.toUpperCase()}→${destinationCode.toUpperCase()}.route.${routeKey}.applicability`;
}

export function splitDestinationDetailIntoBlocks(
  detail: DestinationDetail,
): DestinationContentBlockInput[] {
  return DESTINATION_DETAIL_BLOCKS.flatMap(({ sectionKey, blockKey, scope }) => {
    const content = detail[blockKey];
    if (content === undefined) {
      return [];
    }
    return [
      {
        sectionKey,
        blockKey,
        scope,
        content,
        assumptions: assumptionDefaultsFor(blockKey),
      },
    ];
  });
}

export function splitDestinationPairingIntoBlocks(
  pairing: DestinationPairing,
): DestinationContentBlockInput[] {
  return PAIRING_BLOCKS.flatMap(({ sectionKey, blockKey, scope }) => {
    const content = pairing[blockKey];
    if (content === undefined) {
      return [];
    }
    return [{ sectionKey, blockKey, scope, content }];
  });
}

export function assembleDestinationDetailFromBlocks(
  blocks: { blockKey: string; content: unknown }[],
) {
  const detail: DestinationDetail = {};
  for (const block of blocks) {
    if (block.blockKey === "quickFacts") {
      detail.quickFacts = block.content as DestinationDetail["quickFacts"];
    } else if (block.blockKey === "country") {
      detail.country = block.content as DestinationDetail["country"];
    } else if (block.blockKey === "living") {
      detail.living = block.content as DestinationDetail["living"];
    } else if (block.blockKey === "work") {
      detail.work = block.content as DestinationDetail["work"];
    } else if (block.blockKey === "family") {
      detail.family = block.content as DestinationDetail["family"];
    }
  }
  return detail;
}

export function assembleDestinationPairingFromBlocks(
  blocks: { blockKey: string; content: unknown }[],
) {
  const pairing: DestinationPairing = {};
  for (const block of blocks) {
    if (block.blockKey === "language") {
      pairing.language = block.content as DestinationPairing["language"];
    } else if (block.blockKey === "entry") {
      pairing.entry = block.content as DestinationPairing["entry"];
    } else if (block.blockKey === "entryDetail") {
      pairing.entryDetail = block.content as DestinationPairing["entryDetail"];
    } else if (block.blockKey === "glance") {
      pairing.glance = block.content as DestinationPairing["glance"];
    } else if (block.blockKey === "fitsYouIf") {
      pairing.fitsYouIf = block.content as DestinationPairing["fitsYouIf"];
    }
  }
  return pairing;
}

function assumptionDefaultsFor(blockKey: string): Record<string, unknown> {
  if (blockKey === "living") {
    return { personas: "demo budget personas; not universal for every household/status" };
  }
  if (blockKey === "work") {
    return { examples: "demo salary and earning-mode examples" };
  }
  if (blockKey === "family") {
    return { household: "demo family/pet examples; route and origin rules can vary" };
  }
  return {};
}

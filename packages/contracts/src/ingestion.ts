export const INGESTION_QUEUE = "pathport-ingestion";
export const FAKE_RESEARCH_JOB = "fake-research";
export const DISCOVERY_RESEARCH_JOB = "research-discovery";
export const EXTRACTION_RESEARCH_JOB = "research-extraction";

export const RENT_RESEARCH_TARGET = {
  path: "DE.living.rent",
  canonicalTargetPath: "DE.living",
  destinationCode: "DE",
  sectionKey: "living",
  blockKey: "living",
  mergePath: "rent",
} as const;

export type ResearchTargetPath = typeof RENT_RESEARCH_TARGET.path;

export type FakeResearchJob = {
  runId: string;
};

export type DiscoveryResearchJob = {
  version: 1;
  runId: string;
};

export type ExtractionResearchJob = {
  version: 1;
  runId: string;
  rootRunId: string;
};

export type IngestionJob = FakeResearchJob | DiscoveryResearchJob | ExtractionResearchJob;

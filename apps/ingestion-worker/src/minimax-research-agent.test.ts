import { describe, expect, it, vi } from "vitest";
import {
  evidenceFromSearchHits,
  extractWebSearchHits,
  MiniMaxResearchAgent,
  normalizeEvidenceCandidates,
  truncateEvidenceArray,
} from "./minimax-research-agent";

const config = {
  modelId: "MiniMax-M3",
  promptVersion: "rent-research-v1",
  guardrailVersion: "rent-guardrails-v1",
  agentVersion: "research-agent-v1",
  runTokenBudget: 40_000,
  cascadeTokenBudget: 100_000,
  runCostCeilingMicros: 100_000,
  cascadeCostCeilingMicros: 250_000,
  maxOutputTokens: 8_000,
  maxSteps: 5,
  pricing: { inputMicrosPerMillion: 300_000, outputMicrosPerMillion: 1_200_000 },
};

describe("MiniMax evidence helpers", () => {
  it("skips malformed tool hits and invalid JSON payloads", () => {
    expect(
      extractWebSearchHits([
        {
          type: "web_search_tool_result",
          content: [
            { type: "web_search_result", title: "Missing url", content: "x" },
            { type: "other", url: "https://example.test", title: "Nope", content: "x" },
            null,
            "skip",
            {
              type: "web_search_result",
              url: "https://example.test/ok",
              title: "Ok",
              content: "Excerpt",
            },
          ],
        },
        { type: "web_search_tool_result", content: "{not-json" },
        { type: "web_search_tool_result", content: '{"not":"array"}' },
        { type: "web_search_tool_result", content: 12 },
      ]),
    ).toEqual([{ url: "https://example.test/ok", title: "Ok", excerpt: "Excerpt" }]);
  });

  it("ranks official hits first and drops community when enough strong sources exist", () => {
    const ranked = evidenceFromSearchHits([
      {
        url: "https://www.reddit.com/r/germany/1",
        title: "Community",
        excerpt: "Anecdote",
      },
      {
        url: "https://news.example.test/article",
        title: "News",
        excerpt: "Secondary",
      },
      {
        url: "https://www.destatis.de/a",
        title: "Official A",
        excerpt: "A",
      },
      {
        url: "https://europa.eu/b",
        title: "Official B",
        excerpt: "B",
      },
      {
        url: "https://data.bbsr.bund.de/c",
        title: "Official C",
        excerpt: "C",
      },
      {
        url: "https://agency.gov.uk/d",
        title: "Official D",
        excerpt: "D",
      },
      {
        url: "not-a-url",
        title: "Broken",
        excerpt: "Broken",
      },
    ]);

    expect(ranked.map((item) => item.title)).toEqual([
      "Official A",
      "Official B",
      "Official C",
      "Official D",
      "News",
      "Broken",
    ]);
    expect(ranked.some((item) => item.trustTier === "community")).toBe(false);
    expect(ranked.find((item) => item.title === "Broken")).toMatchObject({
      sourceType: "other",
      trustTier: "unknown",
    });
  });

  it("keeps community hits when stronger sources are scarce", () => {
    const ranked = evidenceFromSearchHits([
      {
        url: "https://www.facebook.com/post/1",
        title: "FB",
        excerpt: "Post",
      },
      {
        url: "https://blog.example.test/rent",
        title: "Blog",
        excerpt: "Blog excerpt",
      },
    ]);
    expect(ranked).toHaveLength(2);
    expect(ranked[0]?.sourceType).toBe("other");
    expect(ranked[1]?.sourceType).toBe("community");
  });

  it("normalizes excerpt aliases and passes through non-arrays", () => {
    expect(normalizeEvidenceCandidates({ keep: true })).toEqual({ keep: true });
    expect(
      normalizeEvidenceCandidates([
        null,
        "skip",
        {
          url: "https://example.test/c",
          title: "C",
          snippet: "From snippet",
        },
        {
          url: "https://example.test/d",
          title: "D",
          quote: "From quote",
        },
        {
          url: "https://example.test/e",
          title: "E",
          excerpt: "   ",
          content: "Fallback content",
        },
      ]),
    ).toEqual([
      null,
      "skip",
      {
        url: "https://example.test/c",
        title: "C",
        snippet: "From snippet",
        excerpt: "From snippet",
      },
      {
        url: "https://example.test/d",
        title: "D",
        quote: "From quote",
        excerpt: "From quote",
      },
      {
        url: "https://example.test/e",
        title: "E",
        excerpt: "Fallback content",
        content: "Fallback content",
      },
    ]);
    expect(truncateEvidenceArray(undefined)).toBeUndefined();
  });
});

describe("MiniMaxResearchAgent.searchRentEvidence", () => {
  it("prefers tool hits over text JSON", async () => {
    const fetchImpl = vi.fn(async () =>
      Response.json({
        content: [
          { type: "text", text: "I'll search first." },
          {
            type: "web_search_tool_result",
            content: [
              {
                type: "web_search_result",
                url: "https://www.destatis.de/rent",
                title: "Destatis",
                content: "Official excerpt",
              },
            ],
          },
        ],
        usage: { input_tokens: 11, output_tokens: 7 },
      }),
    );
    const agent = new MiniMaxResearchAgent("test-key", config, fetchImpl as typeof fetch);
    const result = await agent.searchRentEvidence({ target: "DE.living.rent" });
    expect(result.value).toEqual([
      {
        url: "https://www.destatis.de/rent",
        title: "Destatis",
        excerpt: "Official excerpt",
        publisher: "destatis.de",
        sourceType: "official",
        trustTier: "primary",
      },
    ]);
    expect(result.usage).toEqual({ inputTokens: 11, outputTokens: 7 });
  });

  it("parses fenced text JSON when tool hits are absent", async () => {
    const fetchImpl = vi.fn(async () =>
      Response.json({
        content: [
          {
            type: "text",
            text: `\`\`\`json
[
  {
    "url": "https://example.test/a",
    "title": "A",
    "sourceType": "other",
    "trustTier": "secondary",
    "verbatim excerpt": "Excerpt A"
  }
]
\`\`\``,
          },
        ],
        usage: { input_tokens: 3, output_tokens: 4 },
      }),
    );
    const agent = new MiniMaxResearchAgent("test-key", config, fetchImpl as typeof fetch);
    const result = await agent.searchRentEvidence({ target: "DE.living.rent" });
    expect(result.value).toEqual([
      {
        url: "https://example.test/a",
        title: "A",
        sourceType: "other",
        trustTier: "secondary",
        excerpt: "Excerpt A",
      },
    ]);
  });

  it("fails when MiniMax returns neither hits nor usable JSON", async () => {
    const fetchImpl = vi.fn(async () =>
      Response.json({
        content: [{ type: "text", text: "Still searching…" }],
        usage: { input_tokens: 1, output_tokens: 1 },
      }),
    );
    const agent = new MiniMaxResearchAgent("test-key", config, fetchImpl as typeof fetch);
    await expect(agent.searchRentEvidence({ target: "DE.living.rent" })).rejects.toThrow(
      /neither JSON evidence nor search hits|did not contain valid JSON/,
    );
  });

  it("surfaces HTTP failures from the web-search endpoint", async () => {
    const fetchImpl = vi.fn(async () => new Response("nope", { status: 502 }));
    const agent = new MiniMaxResearchAgent("test-key", config, fetchImpl as typeof fetch);
    await expect(agent.searchRentEvidence({ target: "DE.living.rent" })).rejects.toThrow(
      /MiniMax web search failed \(502\)/,
    );
  });
});

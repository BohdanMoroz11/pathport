import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, getCitizenships, getDestinations, getRouteDetail, getRoutes } from "./api";

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

describe("getCitizenships", () => {
  it("requests /citizenships and returns the parsed body", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse([{ code: "USA", name: "United States" }]));

    const result = await getCitizenships();

    expect(result).toEqual([{ code: "USA", name: "United States" }]);
    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(String(url)).toContain("/citizenships");
    expect(init).toMatchObject({ cache: "no-store" });
  });

  it("throws an ApiError carrying the status on a non-2xx response", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({}, 500));

    const error = await getCitizenships().catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 500 });
  });
});

describe("getDestinations", () => {
  it("URL-encodes the citizenship code", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse([]));

    await getDestinations("a/b");

    const [url] = fetchMock.mock.calls[0] ?? [];
    expect(String(url)).toContain("/citizenships/a%2Fb/destinations");
  });

  it("returns null on a 404 instead of throwing", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({}, 404));

    await expect(getDestinations("ZZZ")).resolves.toBeNull();
  });

  it("rethrows non-404 errors", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({}, 500));

    await expect(getDestinations("USA")).rejects.toBeInstanceOf(ApiError);
  });
});

describe("getRoutes", () => {
  it("returns null on a 404", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({}, 404));

    await expect(getRoutes("USA", "ZZ")).resolves.toBeNull();
  });
});

describe("getRouteDetail", () => {
  it("returns null for a malformed id (400) as well as an unknown id (404)", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({}, 400));
    await expect(getRouteDetail("not-a-uuid")).resolves.toBeNull();

    fetchMock.mockResolvedValueOnce(jsonResponse({}, 404));
    await expect(getRouteDetail("00000000-0000-0000-0000-000000000000")).resolves.toBeNull();
  });

  it("rethrows a server error rather than masking it as not-found", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({}, 500));

    await expect(getRouteDetail("abc")).rejects.toBeInstanceOf(ApiError);
  });
});

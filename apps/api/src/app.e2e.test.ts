import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AppModule } from "./app.module";

describe("App API", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("responds to /health", async () => {
    const response = await request(app.getHttpAdapter().getInstance()).get("/health").expect(200);

    expect(response.body).toEqual({
      ok: true,
      service: "api",
    });
  });

  it("responds to /ready", async () => {
    const response = await request(app.getHttpAdapter().getInstance()).get("/ready").expect(200);

    expect(response.body).toEqual({
      ok: true,
      service: "api",
    });
  });
});

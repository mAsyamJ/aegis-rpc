import { describe, expect, it, vi, afterEach } from "vitest";
import { corsAllowOrigin, corsHeaders } from "./cors";

describe("cors", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("defaults to wildcard origin", () => {
    vi.stubEnv("AEGIS_CORS_ORIGIN", "");
    expect(corsAllowOrigin()).toBe("*");
    expect(corsHeaders()["Access-Control-Allow-Methods"]).toContain("OPTIONS");
  });

  it("respects AEGIS_CORS_ORIGIN", () => {
    vi.stubEnv("AEGIS_CORS_ORIGIN", "https://app.example.com");
    expect(corsAllowOrigin()).toBe("https://app.example.com");
  });
});

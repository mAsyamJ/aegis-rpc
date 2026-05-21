import { describe, expect, it, vi, afterEach } from "vitest";
import { isPublicApiEnabled } from "./publicApiGuard";

describe("publicApiGuard", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("enabled by default", () => {
    delete process.env.AEGIS_PUBLIC_RPC_ENABLED;
    expect(isPublicApiEnabled()).toBe(true);
  });

  it("disabled when env is false", () => {
    vi.stubEnv("AEGIS_PUBLIC_RPC_ENABLED", "false");
    expect(isPublicApiEnabled()).toBe(false);
  });
});

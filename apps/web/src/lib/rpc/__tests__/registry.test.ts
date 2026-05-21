import { describe, expect, it } from "vitest";
import { rpcMiddlewareStack } from "@/lib/rpc/middleware/registry";

describe("rpcMiddlewareStack", () => {
  it("registers metrics first and passthrough last", () => {
    expect(rpcMiddlewareStack[0]?.name).toBe("metrics");
    expect(rpcMiddlewareStack[rpcMiddlewareStack.length - 1]?.name).toBe(
      "passthrough"
    );
    expect(rpcMiddlewareStack.length).toBeGreaterThanOrEqual(7);
  });
});

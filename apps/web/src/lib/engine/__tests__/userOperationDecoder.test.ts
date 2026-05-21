import { describe, expect, it } from "vitest";
import {
  parseUserOpPreflightParams,
  userOpToPreflightRequest,
} from "@/lib/engine/userOperationDecoder";

describe("userOperationDecoder", () => {
  it("maps userOp to preflight request with default-aa-policy", () => {
    const input = parseUserOpPreflightParams([
      {
        chainId: 84532,
        userOperation: {
          sender: "0x1234567890123456789012345678901234567890",
          nonce: "0x0",
          callData: "0xabcdef",
          callGasLimit: "0x5208",
          verificationGasLimit: "0x5208",
          preVerificationGas: "0x5208",
          maxFeePerGas: "0x1",
          maxPriorityFeePerGas: "0x1",
        },
        entryPoint: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
      },
    ]);
    const preflight = userOpToPreflightRequest(input);
    expect(preflight.policyId).toBe("default-aa-policy");
    expect(preflight.from).toBe(input.userOperation.sender);
    expect(preflight.data).toBe("0xabcdef");
  });
});

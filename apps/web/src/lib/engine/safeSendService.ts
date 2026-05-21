import { createWalletClient, http, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import { getEventByRequestId, updateEvent } from "@/lib/db/eventRepository";
import { forwardRpcCall, rpcUrl } from "@/lib/rpc/client";
import { getPolicy } from "@/lib/policies";
import type { Verdict } from "@/lib/types";

export type SafeSendInput = {
  requestId: string;
  override?: boolean;
  overrideWarn?: boolean;
};

export type SafeSendResult =
  | {
      ok: true;
      requestId: string;
      txHash: `0x${string}`;
      broadcasted: true;
      verdict: Verdict;
      overridden?: boolean;
      note?: string;
    }
  | {
      ok: false;
      verdict: Verdict;
      reasonCode: string;
      broadcasted: false;
      error: string;
    };

function demoTxHash(): `0x${string}` {
  return `0x${crypto.randomUUID().replace(/-/g, "")}${crypto.randomUUID().replace(/-/g, "").slice(0, 8)}` as `0x${string}`;
}

async function broadcastSerializedTx(
  serializedTransaction: string
): Promise<`0x${string}`> {
  const key = process.env.DEPLOYER_PRIVATE_KEY;
  if (!key?.startsWith("0x")) {
    throw new Error("DEPLOYER_PRIVATE_KEY not configured");
  }

  const account = privateKeyToAccount(key as Hex);
  const client = createWalletClient({
    account,
    chain: baseSepolia,
    transport: http(rpcUrl()),
  });

  return client.sendRawTransaction({
    serializedTransaction: serializedTransaction as Hex,
  });
}

export async function runSafeSend(input: SafeSendInput): Promise<SafeSendResult> {
  const event = await getEventByRequestId(input.requestId);
  if (!event) {
    return {
      ok: false,
      verdict: "BLOCK",
      reasonCode: "UNKNOWN_REQUEST",
      broadcasted: false,
      error: "Unknown requestId",
    };
  }

  const policy = getPolicy(event.policyId);
  const overrideFlag = input.override === true || input.overrideWarn === true;
  const canOverride =
    event.verdict === "WARN" &&
    (policy.mode === "warn" || overrideFlag);
  const canSend = event.verdict === "SAFE" || canOverride;

  if (!canSend) {
    return {
      ok: false,
      verdict: event.verdict,
      reasonCode: event.reasonCode,
      broadcasted: false,
      error:
        event.verdict === "BLOCK"
          ? "BLOCK verdict cannot be overridden in enforce mode"
          : "Broadcast blocked",
    };
  }

  const allowBroadcast = process.env.AEGIS_ALLOW_BROADCAST === "true";
  let txHash: `0x${string}`;
  let note: string | undefined;

  if (
    allowBroadcast &&
    event.serializedTransaction &&
    process.env.DEPLOYER_PRIVATE_KEY
  ) {
    try {
      txHash = await broadcastSerializedTx(event.serializedTransaction);
      note = "Broadcast via configured signer";
    } catch {
      const upstream = await forwardRpcCall(null, "eth_sendRawTransaction", [
        event.serializedTransaction,
      ]);
      if ("error" in upstream) {
        return {
          ok: false,
          verdict: event.verdict,
          reasonCode: "BROADCAST_FAILED",
          broadcasted: false,
          error: upstream.error.message,
        };
      }
      txHash = upstream.result as `0x${string}`;
      note = "Broadcast via upstream RPC";
    }
  } else {
    txHash = demoTxHash();
    note = "Demo mode — tx not sent to chain without AEGIS_ALLOW_BROADCAST";
  }

  await updateEvent(input.requestId, { broadcasted: true, txHash });

  return {
    ok: true,
    requestId: input.requestId,
    txHash,
    broadcasted: true,
    verdict: event.verdict,
    overridden: event.verdict === "WARN" && canOverride,
    note,
  };
}

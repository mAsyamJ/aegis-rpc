const FALLBACK_MEMOS: Record<string, string> = {
  UNLIMITED_APPROVAL_UNKNOWN_SPENDER:
    "Aegis blocked an unlimited ERC20 approval to a spender that is not on the policy allowlist. This matches a common wallet-drainer pattern.",
  UNLIMITED_APPROVAL_KNOWN_SPENDER:
    "Unlimited approval to an allowlisted spender. Policy returned WARN — review before signing.",
  UNKNOWN_FUNCTION_SELECTOR:
    "Calldata uses an unrecognized function selector. Policy returned WARN pending review.",
  NATIVE_TRANSFER_ABOVE_USD_LIMIT:
    "Native transfer value exceeds the policy USD limit using Chainlink price data.",
  CHAINLINK_STALE_FEED:
    "Chainlink price feed is stale. Adapter returned a warning signal.",
  ALL_CHECKS_PASSED:
    "All deterministic policy and adapter checks passed.",
  WARNING_SIGNAL: "One or more adapter signals returned WARN.",
  ADAPTER_BLOCK: "An adapter returned BLOCK under enforce mode.",
};

export function templateMemo(reasonCode: string, verdict: string): string {
  const base =
    FALLBACK_MEMOS[reasonCode] ??
    `Aegis ${verdict}: ${reasonCode}. Deterministic policy decided; AI memo unavailable.`;
  return base;
}

export async function generateMemoAsync(
  _requestId: string,
  event: {
    verdict: string;
    reasonCode: string;
    decodedFunction?: string;
    signals: { adapter: string; status: string; message: string }[];
  },
  _verdictResult: { needsAiAnalysis: boolean }
): Promise<{ text: string; source: "ai" | "template" }> {
  const apiKey = process.env.OPENROUTER_API_KEY ?? process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      text: templateMemo(event.reasonCode, event.verdict),
      source: "template",
    };
  }

  try {
    const prompt = [
      "You are the AI explanation service for Aegis RPC.",
      "The deterministic policy already decided the verdict.",
      "Explain facts only in 2-3 sentences.",
      `Verdict: ${event.verdict}`,
      `Reason: ${event.reasonCode}`,
      `Function: ${event.decodedFunction ?? "unknown"}`,
      `Signals: ${JSON.stringify(event.signals.map((s) => ({ a: s.adapter, st: s.status })))}`,
    ].join("\n");

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "anthropic/claude-3.5-haiku",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 200,
      }),
    });

    if (!res.ok) throw new Error(`AI HTTP ${res.status}`);
    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = json.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error("empty AI response");
    return { text, source: "ai" };
  } catch {
    return {
      text: templateMemo(event.reasonCode, event.verdict),
      source: "template",
    };
  }
}

export function getMemoForRequest(
  reasonCode: string,
  verdict: string,
  existing?: string
): string {
  return existing ?? templateMemo(reasonCode, verdict);
}

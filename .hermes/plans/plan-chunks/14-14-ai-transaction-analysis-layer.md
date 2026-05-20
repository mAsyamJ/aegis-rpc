## 14. AI Transaction Analysis Layer

> **This is a complete redesign.** The v3 masterplan had `memoTemplates.ts` as the primary AI path — a static string lookup table by `reasonCode`. That's not AI analysis; it's a switch statement. A judge reading the code would see through it. This section defines a real AI system with four distinct roles, structured prompts, proper async pipeline, and meaningful fallbacks.

### Core Principle (unchanged)
**AI explains and assists. Deterministic policy decides.** The policy engine produces the verdict first. AI never overrides or delays it. AI runs after, async, and its output enriches the audit log, dashboard, and operator UX.

### Why AI Adds Real Value

Deterministic rules handle what can be codified in advance. But real transactions include:
- Function selectors that have never been seen before
- WARN situations where three marginal signals together form a genuine pattern
- Operators facing override decisions who need a plain-English summary of actual risk — not a generic warning

That's where AI adds genuine value: as an analyst and communicator, not a decision-maker.

### The Four AI Roles

```
AI Transaction Analysis Layer
├── Role 1: UnknownSelectorAnalyzer
│   When: intent.isUnknownSelector === true
│   Input: selector hex, calldata bytes, target address, contract code snippet
│   Task: attempt semantic description of what the calldata is doing
│   Output: { guess: string, confidence: "high"|"medium"|"low"|"none", reasoning: string }
│
├── Role 2: WarnContextSynthesizer
│   When: verdict === "WARN" && signals.length > 1
│   Input: all AdapterSignals, intent, policy template
│   Task: synthesize coherent risk summary from multiple partial signals
│   Output: { riskSummary: string, primaryConcern: string }
│
├── Role 3: MemoGenerator
│   When: always (every verdict)
│   Input: verdict, reasonCode, signals, intent, onChainPolicyHash
│   Task: produce 2-4 sentence human-readable explanation
│   Output: { memo: string }
│
└── Role 4: PreSigningAssist
    When: verdict === "WARN" (operator considering override)
    Input: all above + policy limits + what was flagged
    Task: give operator specific information to make a good override decision
    Output: { preSigningAssist: string }
```

### Type Definitions

```typescript
// lib/ai/types.ts

export type AiAnalysisInput = {
  requestId: string;
  intent: TxIntent;
  verdict: Verdict;
  reasonCode: string;
  signals: AdapterSignal[];
  policy: Pick;
  needsUnknownSelectorAnalysis: boolean;
  needsWarnSynthesis: boolean;
};

export type AiAnalysisOutput = {
  requestId: string;
  memo: string;
  unknownSelectorGuess?: string;
  unknownSelectorConfidence?: "high" | "medium" | "low" | "none";
  riskSummary?: string;
  primaryConcern?: string;
  preSigningAssist?: string;
  confidence: "high" | "medium" | "low";
  generatedAt: string;
  usedFallback: boolean;
};
```

### Prompt Templates (lib/ai/prompts.ts)

Every prompt follows the same structure:
- SYSTEM CONTEXT: what Aegis is, what AI's role is (not decision-maker)
- TASK DEFINITION: what this specific role does
- INPUT: structured JSON of relevant facts
- OUTPUT FORMAT: strict JSON schema
- CONSTRAINTS: factual, no hallucination, say "unknown" if uncertain

```typescript
export function buildMemoPrompt(input: AiAnalysisInput): string {
  return `You are the AI memo service for Aegis RPC, a pre-broadcast transaction screening system.
Your role: explain what happened in plain English. You never make enforcement decisions.
Be concise (2-4 sentences), factual, specific. Do not recommend actions — only explain facts.

Verdict: ${input.verdict}
Reason code: ${input.reasonCode}
Decoded function: ${input.intent.decodedFunction ?? "unknown"}
Decoded args: ${JSON.stringify(input.intent.decodedArgs ?? {})}
Adapter signals: ${JSON.stringify(input.signals.map(s => ({ adapter: s.adapter, status: s.status, reasonCode: s.reasonCode, message: s.message })))}
Policy template: ${input.policy.template}
Policy mode: ${input.policy.mode}

Respond ONLY with valid JSON (no markdown, no fences):
{ "memo": "<2-4 sentence explanation>" }`;
}

export function buildUnknownSelectorPrompt(input: AiAnalysisInput): string {
  return `You are analyzing unknown EVM transaction calldata for Aegis RPC.
The transaction decoder does not recognize the function selector.
Attempt to identify what this transaction might be doing based on available signals.
Be honest about uncertainty. Say "unknown" if you cannot determine it.
Do NOT hallucinate function names or fabricate contract behavior.

Target address: ${input.intent.to}
Function selector: ${input.intent.selector ?? "none"}
Calldata length: ${input.intent.calldataLength} bytes
Raw calldata (first 200 chars): ${input.intent.data.slice(0, 200)}
Chain ID: ${input.intent.chainId}

Respond ONLY with valid JSON (no markdown, no fences):
{
  "guess": "",
  "confidence": "high" | "medium" | "low" | "none",
  "reasoning": "<1-2 sentence explanation>"
}`;
}

export function buildWarnSynthesisPrompt(input: AiAnalysisInput): string {
  return `You are synthesizing risk signals for Aegis RPC's operator dashboard.
Multiple adapter signals triggered a WARN verdict. Synthesize into a coherent risk summary.
Be specific about which signals matter most and why they matter together.

Intent: ${input.intent.decodedFunction ?? "unknown"} to ${input.intent.to}
Value: ${input.intent.valueWei.toString()} wei
Signals:
${input.signals.map(s => `- ${s.adapter}: ${s.status} — ${s.message}`).join("\n")}
Policy: ${input.policy.template} / ${input.policy.mode} mode

Respond ONLY with valid JSON (no markdown, no fences):
{
  "riskSummary": "<2-3 sentence risk assessment>",
  "primaryConcern": "<1 sentence, most important concern>"
}`;
}

export function buildPreSigningAssistPrompt(input: AiAnalysisInput): string {
  return `You are helping an operator decide whether to override a WARN verdict in Aegis RPC.
The deterministic policy flagged this transaction. Give specific, factual information.
Do not recommend to override or not override — just explain the facts accurately.

Transaction: ${input.intent.decodedFunction ?? "unknown"} to ${input.intent.to}
Reason flagged: ${input.reasonCode}
Signals that triggered WARN:
${input.signals.filter(s => s.status !== "OK").map(s => `- ${s.adapter}: ${s.message}`).join("\n")}
Policy limits: maxSingleAgentActionUsd=${input.policy.limits.maxSingleAgentActionUsd ?? "none"}

Respond ONLY with valid JSON (no markdown, no fences):
{
  "preSigningAssist": "<2-4 sentences: what was specifically flagged, what the actual data shows, what to consider>"
}`;
}
```

### memoService.ts — Orchestrator

```typescript
import Anthropic from "@anthropic-ai/sdk";
import * as prompts from "./prompts";
import * as fallbacks from "./fallbacks";

const client = new Anthropic(); // reads ANTHROPIC_API_KEY from env

export async function runAiAnalysis(input: AiAnalysisInput): Promise {
  const results: Partial = {
    requestId: input.requestId,
    usedFallback: false,
    generatedAt: new Date().toISOString(),
    confidence: "high",
  };

  // Role 1: Unknown selector (if needed)
  if (input.needsUnknownSelectorAnalysis) {
    const r = await callClaudeJson(
      prompts.buildUnknownSelectorPrompt(input)
    );
    if (r) {
      results.unknownSelectorGuess = r.guess;
      results.unknownSelectorConfidence = r.confidence as AiAnalysisOutput["unknownSelectorConfidence"];
    }
  }

  // Role 2: WARN synthesis (if multiple signals)
  if (input.needsWarnSynthesis) {
    const r = await callClaudeJson(
      prompts.buildWarnSynthesisPrompt(input)
    );
    if (r) {
      results.riskSummary = r.riskSummary;
      results.primaryConcern = r.primaryConcern;
    } else {
      results.riskSummary = fallbacks.getFallbackRiskSummary(input.reasonCode);
      results.usedFallback = true;
    }
  }

  // Role 3: Memo (always)
  const memoResult = await callClaudeJson(prompts.buildMemoPrompt(input));
  results.memo = memoResult?.memo ?? fallbacks.getFallbackMemo(input.reasonCode, input.intent);
  if (!memoResult) results.usedFallback = true;

  // Role 4: Pre-signing assist (only for WARN)
  if (input.verdict === "WARN") {
    const r = await callClaudeJson(prompts.buildPreSigningAssistPrompt(input));
    results.preSigningAssist = r?.preSigningAssist;
  }

  return results as AiAnalysisOutput;
}

async function callClaudeJson(prompt: string): Promise {
  try {
    const msg = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    });
    const text = msg.content[0].type === "text" ? msg.content[0].text : null;
    if (!text) return null;
    const cleaned = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned) as T;
  } catch {
    return null; // Fallback will be used by caller
  }
}
```

### fallbacks.ts — Template Fallbacks (always available, no API key needed)

```typescript
export function getFallbackMemo(reasonCode: string, intent: TxIntent): string {
  const fn = intent.decodedFunction ?? "unknown function";
  const to = intent.to ?? "unknown address";

  const templates: Record = {
    UNLIMITED_APPROVAL_UNKNOWN_SPENDER:
      `Aegis blocked this transaction because it requests unlimited ERC20 approval to an address not on your policy allowlist. Unlimited approvals give permanent token access to the spender. Verify the spender address before proceeding.`,
    STALE_PRICE_FEED:
      `Aegis blocked this transaction because the Chainlink ETH/USD price feed data is older than your policy's freshness limit. High-value actions are blocked until fresh price data is available to prevent execution under stale context.`,
    EXCEEDS_USD_LIMIT:
      `Aegis blocked this transaction because the estimated USD value exceeds your policy's per-action limit. Review your policy limits or get operator approval if this amount is intentional.`,
    SIMULATION_REVERT:
      `Aegis flagged this transaction because a simulation of ${fn} to ${to} reverted. This may indicate a contract error, insufficient balance, or state mismatch. Review before broadcasting.`,
    UNKNOWN_FUNCTION_SELECTOR:
      `Aegis flagged this transaction because the function selector is not recognized. The calldata could not be parsed into a known function. Manual review recommended before proceeding.`,
    ALL_CHECKS_PASSED:
      `This transaction passed all Aegis policy checks. The action is within defined limits, the price feed is fresh, and all addresses are within policy.`,
  };

  return templates[reasonCode] ?? `Aegis returned verdict with reason: ${reasonCode}. Review the adapter signals for details.`;
}

export function getFallbackRiskSummary(reasonCode: string): string {
  const summaries: Record = {
    STALE_PRICE_FEED: "Multiple signals flagged: price feed staleness combined with high-value action creates elevated execution risk.",
    SIMULATION_REVERT: "Transaction simulation reverted. Combined with other signals, this indicates execution risk.",
    UNKNOWN_FUNCTION_SELECTOR: "Unrecognized calldata combined with other signals requires manual review.",
  };
  return summaries[reasonCode] ?? "Multiple risk signals detected. Review each adapter signal individually.";
}
```

### Async Pipeline Design

```
POST /api/preflight
  [1] Decode tx intent                              ~5ms
  [2] Load policy                                   ~10ms
  [3] Run adapters in parallel                      ~500–2000ms
  [4] Evaluate policy → verdict                     ~1ms
  [5] INSERT aegis_event (memo: null)               ~50ms
  [6] ← RETURN RESPONSE TO CLIENT                  ~600–2200ms total
       (verdict is known; client has requestId)
  ↓ (background, non-blocking)
  [7] runAiAnalysis(input)                          ~1000–3000ms
  [8] UPDATE aegis_event SET ai_memo, ai_analysis   ~30ms

Client polls GET /api/ai-analyze?requestId=X for memo.
VerdictCard polls every 2s until memoStatus === "ready".
```

### AI Security Constraints

| Constraint | Implementation |
|---|---|
| AI never decides SAFE/WARN/BLOCK | Verdict computed before AI is called |
| AI output never modifies verdict | Verdict is immutable after `finalizeVerdict()` |
| AI never delays response | Fires after response is returned |
| Prompt injection protection | Input is JSON-serialized, not string-interpolated from user-controlled fields |
| API key never exposed client-side | All Claude calls are server-side only |
| Fallback always works | Every role has a deterministic template fallback |

---

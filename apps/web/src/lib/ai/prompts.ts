export const MEMO_SYSTEM =
  "You are Aegis RPC AI explanation layer. The deterministic policy already decided SAFE, WARN, or BLOCK. Explain facts only. Never change the verdict.";

export function unknownSelectorPrompt(selector: string, to?: string): string {
  return [
    MEMO_SYSTEM,
    "Role: UnknownSelectorAnalyzer",
    `Unknown selector ${selector} on target ${to ?? "unknown"}.`,
    "Guess the likely function purpose in one sentence. List 2 risks.",
  ].join("\n");
}

export function warnContextPrompt(
  verdict: string,
  reasonCode: string,
  signals: string
): string {
  return [
    MEMO_SYSTEM,
    "Role: WarnContextSynthesizer",
    `Verdict ${verdict}, reason ${reasonCode}.`,
    `Signals: ${signals}`,
    "Summarize why an operator should review before signing.",
  ].join("\n");
}

export function memoPrompt(
  verdict: string,
  reasonCode: string,
  decodedFunction?: string
): string {
  return [
    MEMO_SYSTEM,
    "Role: MemoGenerator",
    `Verdict: ${verdict}`,
    `Reason: ${reasonCode}`,
    `Function: ${decodedFunction ?? "unknown"}`,
    "Write 2-3 sentences for OpsRisk dashboard.",
  ].join("\n");
}

export function preSigningAssistPrompt(
  verdict: string,
  reasonCode: string
): string {
  return [
    MEMO_SYSTEM,
    "Role: PreSigningAssist",
    `Verdict ${verdict}, reason ${reasonCode}.`,
    "Return JSON: { headline, bullets[] } with operator guidance.",
  ].join("\n");
}

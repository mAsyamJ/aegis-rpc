export type Verdict = "SAFE" | "WARN" | "BLOCK";
export type AdapterStatus = "OK" | "WARN" | "BLOCK" | "ERROR";
export type PolicyMode = "observe" | "warn" | "enforce";

export interface TxIntent {
  from: string;
  to: string;
  value: string; // wei
  valueUsd?: number;
  data: string;
  selector: string;
  functionSignature?: string;
  decodedArgs?: { name: string; type: string; value: string; highlight?: boolean }[];
  chainId: number;
  nonce?: number;
}

export interface AdapterSignal {
  adapter: string;
  status: AdapterStatus;
  label: string;
  detail?: string;
  latencyMs?: number;
  source?: string;
  data?: Record<string, string | number | boolean>;
}

export interface RiskCheck {
  id: string;
  name: string;
  status: AdapterStatus;
  reasonCode?: string;
  detail?: string;
}

export interface AiAnalysis {
  summary: string;
  risks: string[];
  suggestion?: string;
  confidence?: number;
  model?: string;
  preSigningAssist?: { headline: string; bullets: string[] };
}

export interface PreflightRequest {
  scenarioId?: string;
  intent: TxIntent;
}

export interface PreflightResponse {
  requestId: string;
  verdict: Verdict;
  reasonCode: string;
  reason: string;
  intent: TxIntent;
  checks: RiskCheck[];
  adapters: AdapterSignal[];
  ai?: AiAnalysis;
  policyHash: string;
  policyMode: PolicyMode;
  latencyMs: number;
  broadcasted: boolean;
  createdAt: string;
}

export interface AegisEvent {
  id: string;
  requestId: string;
  verdict: Verdict;
  reasonCode: string;
  scenario: string;
  policyHash: string;
  intent: TxIntent;
  adapters: AdapterSignal[];
  checks: RiskCheck[];
  ai?: AiAnalysis;
  latencyMs: number;
  broadcasted: boolean;
  txHash?: string;
  createdAt: string;
}

export interface AegisPolicy {
  id: string;
  name: string;
  audience: "wallet" | "agent" | "defi" | "rwa" | "backend";
  mode: PolicyMode;
  description: string;
  limits: { name: string; value: string }[];
  allowlists: { name: string; entries: string[] }[];
  rules: { id: string; description: string; severity: Verdict }[];
  policyHash: string;
  updatedAt: string;
}

export interface DemoScenario {
  id: string;
  title: string;
  audience: "agent" | "wallet" | "defi" | "rwa";
  summary: string;
  expectedVerdict: Verdict;
  expectedReasonCode: string;
  intent: TxIntent;
  adapters: AdapterSignal[];
  checks: RiskCheck[];
  ai: AiAnalysis;
  policyHash: string;
  policyMode: PolicyMode;
  latencyMs: number;
}

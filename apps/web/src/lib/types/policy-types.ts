export type Verdict = "SAFE" | "WARN" | "BLOCK";

export type AdapterStatus = "OK" | "WARN" | "BLOCK" | "ERROR";

export type AdapterSignal = {
  adapter: string;
  status: AdapterStatus;
  reasonCode?: string;
  message: string;
  data?: Record<string, unknown>;
  latencyMs?: number;
};

export type AegisPolicy = {
  id: string;
  name: string;
  mode: "observe" | "warn" | "enforce";
  template: "wallet" | "agent" | "defi" | "rwa" | "treasury" | "backend";
  chainId: number;
  limits: {
    maxNativeTransferUsd?: number;
    maxSingleAgentActionUsd?: number;
    maxDailyAgentSpendUsd?: number;
    maxSwapDeviationBps?: number;
  };
  rules: {
    blockUnlimitedApproval: boolean;
    requireSpenderAllowlist: boolean;
    blockUnknownContracts: boolean;
    requireFreshPrice: boolean;
    blockSimulationRevert: boolean;
    flagUnknownSelectors: boolean;
    /** WARN when approve amount exceeds highAllowanceWei (wallet-guard pattern). */
    warnHighAllowance?: boolean;
    /** BLOCK/WARN on denylisted spenders and composite high-risk approve. */
    warnHighRiskSpender?: boolean;
    /** Require treasury inner targets on contract allowlist. */
    requireTreasuryTargetAllowlist?: boolean;
  };
  allowlists: {
    agents: `0x${string}`[];
    recipients: `0x${string}`[];
    spenders: `0x${string}`[];
    contracts: `0x${string}`[];
    selectors: string[];
  };
  denylists: {
    addresses: `0x${string}`[];
    selectors: string[];
  };
};

export type InnerCallSummary = {
  selector?: string;
  decodedFunction?: string;
  isUnlimitedApproval?: boolean;
  isUnknownSelector: boolean;
};

export type TxIntent = {
  requestId: string;
  chainId: number;
  method: "eth_sendRawTransaction" | "aegis_preflight" | "aegis_sendTransaction";
  from?: `0x${string}`;
  to?: `0x${string}`;
  valueWei: bigint;
  data: `0x${string}`;
  rawTx?: `0x${string}`;
  selector?: string;
  decodedFunction?: string;
  decodedArgs?: Record<string, unknown>;
  useCase?: "wallet" | "agent" | "defi" | "rwa" | "treasury" | "backend" | "unknown";
  isUnknownSelector: boolean;
  calldataLength: number;
  isUnlimitedApproval?: boolean;
  /** Multicall inner payloads (Rabby-style unwrap). */
  innerCalls?: InnerCallSummary[];
  /** Safe execTransaction inner target. */
  safeInner?: {
    to?: `0x${string}`;
    valueWei: bigint;
    data: `0x${string}`;
  };
  /** True when any inner call is unlimited approve. */
  hasMulticallInnerRisk?: boolean;
};

export type PreflightRequest = {
  chainId: number;
  from?: string;
  to?: string;
  valueWei?: string;
  data?: string;
  policyId?: string;
  /** Stored on audit event for optional safe-send broadcast replay. */
  serializedTransaction?: string;
};

export type VerdictResult = {
  verdict: Verdict;
  reasonCode: string;
  needsAiAnalysis: boolean;
};

export type AuditEvent = {
  id: string;
  requestId: string;
  createdAt: string;
  chainId: number;
  method: string;
  fromAddress?: string;
  toAddress?: string;
  valueWei: string;
  selector?: string;
  decodedFunction?: string;
  decodedArgs?: Record<string, unknown>;
  /** Hex calldata prefix for AI memo prompts only (no secrets). */
  calldataPreview?: string;
  useCase?: string;
  isUnknownSelector: boolean;
  policyId?: string;
  verdict: Verdict;
  reasonCode: string;
  signals: AdapterSignal[];
  needsAiAnalysis: boolean;
  broadcasted: boolean;
  aiMemo?: string;
  aiAnalysis?: {
    summary: string;
    risks: string[];
    suggestion?: string;
    confidence?: number;
    model?: string;
    role?: string;
    source: "ai" | "template";
    unknownSelectorGuess?: string;
    unknownSelectorConfidence?: string;
    riskSummary?: string;
    primaryConcern?: string;
    preSigningAssist?: { headline: string; bullets: string[] };
  };
  memoStatus: "pending" | "generating" | "ready" | "fallback";
  onChainPolicyHash?: string;
  txHash?: string;
  serializedTransaction?: string;
  unknownSelectorGuess?: string;
  riskSummary?: string;
  primaryConcern?: string;
  aiGeneratedAt?: string;
  aiConfidence?: string;
  latencyMs?: number;
};

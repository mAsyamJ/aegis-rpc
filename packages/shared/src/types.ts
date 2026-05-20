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
};

export type PreflightRequest = {
  chainId: number;
  from?: string;
  to?: string;
  valueWei?: string;
  data?: string;
  policyId?: string;
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
    source: "ai" | "template";
    preSigningAssist?: { headline: string; bullets: string[] };
  };
  memoStatus: "pending" | "generating" | "ready" | "fallback";
  onChainPolicyHash?: string;
  txHash?: string;
  latencyMs?: number;
};

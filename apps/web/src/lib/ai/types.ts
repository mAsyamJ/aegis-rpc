export type AiRole =
  | "UnknownSelectorAnalyzer"
  | "WarnContextSynthesizer"
  | "MemoGenerator"
  | "PreSigningAssist";

export type AiAnalysisResult = {
  summary: string;
  risks: string[];
  suggestion?: string;
  confidence?: number;
  model?: string;
  role?: AiRole;
  source: "ai" | "template";
};

export type MemoServiceResult = AiAnalysisResult & {
  unknownSelectorGuess?: string;
  unknownSelectorConfidence?: string;
  riskSummary?: string;
  primaryConcern?: string;
  generatedAt?: string;
  preSigningAssist?: {
    headline: string;
    bullets: string[];
  };
};

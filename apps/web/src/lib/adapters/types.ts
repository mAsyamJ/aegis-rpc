import type { AdapterSignal, AegisPolicy, TxIntent } from "@/lib/types";

export interface AegisAdapter {
  name: string;
  supports(intent: TxIntent, policy: AegisPolicy): boolean;
  getSignal(intent: TxIntent, policy: AegisPolicy): Promise<AdapterSignal>;
}

export type { AdapterSignal };

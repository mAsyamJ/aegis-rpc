"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { contractAddresses } from "@/lib/chain/addresses";
import type { PolicyMode } from "@/lib/types/aegis";

type AppStatusContextValue = {
  policyMode: PolicyMode;
  setPolicyMode: (mode: PolicyMode) => void;
  activePolicyId: string | null;
  setActivePolicyId: (id: string | null) => void;
  registryAddress: `0x${string}`;
};

const AppStatusContext = createContext<AppStatusContextValue | null>(null);

export function AppStatusProvider({ children }: { children: ReactNode }) {
  const [policyMode, setPolicyModeState] = useState<PolicyMode>("enforce");
  const [activePolicyId, setActivePolicyId] = useState<string | null>(
    "default-agent-policy",
  );

  const setPolicyMode = useCallback((mode: PolicyMode) => {
    setPolicyModeState(mode);
  }, []);

  const value = useMemo(
    () => ({
      policyMode,
      setPolicyMode,
      activePolicyId,
      setActivePolicyId,
      registryAddress: contractAddresses.AegisPolicyRegistry,
    }),
    [policyMode, activePolicyId, setPolicyMode],
  );

  return (
    <AppStatusContext.Provider value={value}>{children}</AppStatusContext.Provider>
  );
}

export function useAppStatus() {
  const ctx = useContext(AppStatusContext);
  if (!ctx) {
    throw new Error("useAppStatus must be used within AppStatusProvider");
  }
  return ctx;
}

import type { AegisPolicy } from "@/lib/types";
import { defaultAgentPolicy } from "./default-agent-policy";

export const defaultAgentPolicyWarn: AegisPolicy = {
  ...defaultAgentPolicy,
  id: "default-agent-policy-warn",
  name: "Default Agent Policy (WARN mode)",
  mode: "warn",
};

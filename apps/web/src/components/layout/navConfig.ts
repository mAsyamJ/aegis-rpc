import {
  Activity,
  Bot,
  Boxes,
  Home,
  LayoutDashboard,
  Play,
  Radio,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type NavItem =
  | { group: string }
  | { href: string; label: string; icon: LucideIcon; marketing?: boolean };

/** In-app sidebar only — avoid trapping users on marketing `/` without context. */
export const appNav: NavItem[] = [
  { group: "Start here" },
  { href: "/demo/live", label: "Live 3-tx demo", icon: Radio },
  { href: "/demo/agent", label: "Agent demo (start)", icon: Play },
  { href: "/demo/wallet", label: "Wallet firewall", icon: Wallet },
  { group: "Operations" },
  { href: "/dashboard", label: "OpsRisk home", icon: LayoutDashboard },
  { href: "/policies", label: "Policy console", icon: Boxes },
  { href: "/adapters", label: "Adapter health", icon: Activity },
  { group: "More" },
  { href: "/", label: "Marketing home", icon: Home, marketing: true },
];

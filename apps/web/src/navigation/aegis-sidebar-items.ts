import {
  Activity,
  Boxes,
  Home,
  LayoutDashboard,
  Play,
  Radio,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export interface NavMainItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  external?: boolean;
}

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const aegisSidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Start here",
    items: [
      { title: "Live 3-tx demo", url: "/demo/live", icon: Radio },
      { title: "Agent demo (start)", url: "/demo/agent", icon: Play },
      { title: "Wallet firewall", url: "/demo/wallet", icon: Wallet },
    ],
  },
  {
    id: 2,
    label: "Operations",
    items: [
      { title: "OpsRisk home", url: "/dashboard", icon: LayoutDashboard },
      { title: "Policy console", url: "/policies", icon: Boxes },
      { title: "Adapter health", url: "/adapters", icon: Activity },
    ],
  },
  {
    id: 3,
    label: "More",
    items: [{ title: "Marketing home", url: "/", icon: Home, external: true }],
  },
];

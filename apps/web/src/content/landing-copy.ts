export const landingCopy = {
  hero: {
    badge: "base-sepolia · overview · v0.1",
    title: "Stop unsafe Web3 transactions",
    titleAccent: "before they reach the chain.",
    lead: "Aegis RPC is a programmable transaction firewall — it decodes intent, runs deterministic policy, and returns SAFE, WARN, or BLOCK before broadcast. AI explains the risk; policy makes the decision.",
    ctas: {
      primary: { label: "Run agent demo", href: "/demo/agent" },
      secondary: { label: "OpsRisk dashboard", href: "/dashboard" },
    },
  },
  productFlow: {
    title: "Decode → Check → Decide",
    steps: [
      {
        id: "decode",
        title: "Decode",
        line: "Readable intent from calldata before broadcast.",
      },
      {
        id: "check",
        title: "Check",
        line: "Deterministic policy plus adapter signals.",
      },
      {
        id: "decide",
        title: "Decide",
        line: "SAFE, WARN, or BLOCK — then audit.",
      },
    ],
  },
  judgeDemo: {
    title: "Try it in 60 seconds",
    subtitle: "Guided judge demo: BLOCK, WARN, AI assist, safe-send.",
    cta: { label: "Start demo", href: "/demo/agent?step=1" },
    steps: [
      { id: "1", label: "BLOCK over-cap" },
      { id: "2", label: "WARN selector" },
      { id: "3", label: "AI assist" },
      { id: "4", label: "Safe-send" },
    ],
  },
  whatStops: {
    title: "What Aegis stops, today",
    cards: [
      {
        verdict: "BLOCK" as const,
        title: "Approval drainer blocked",
        body: "Unlimited ERC-20 approval to an unknown spender — blocked before sign or broadcast.",
        href: "/demo/wallet",
      },
      {
        verdict: "BLOCK" as const,
        title: "Agent over-spend blocked",
        body: "Transfer above policy USD cap — rejected before funds move.",
        href: "/demo/agent",
      },
      {
        verdict: "WARN" as const,
        title: "AI explains, policy decides",
        body: "High-allowance approve flagged with a readable memo — verdict stays deterministic.",
        memoSnippet:
          "selector: 0x095ea7b3 · policy: WARN · memo: high allowance to unknown spender",
        href: "/demo/live",
      },
    ],
  },
  finalCta: {
    title: "Add a security checkpoint before your next transaction.",
    body: "Screen wallets, agents, and backends on Base Sepolia — then open the full OpsRisk dashboard.",
    ctas: {
      primary: { label: "Run the live demo", href: "/demo/live" },
      secondary: { label: "Open OpsRisk dashboard", href: "/dashboard" },
    },
  },
  nav: {
    signUp: "Sign up",
    links: [
      { label: "How it works", href: "#product" },
      { label: "Demo", href: "#demo" },
    ],
  },
  footer: {
    tagline: "Programmable transaction screening before broadcast.",
    product: [
      { label: "Live 3-tx demo", href: "/demo/live" },
      { label: "Agent demo", href: "/demo/agent" },
      { label: "Wallet firewall", href: "/demo/wallet" },
      { label: "OpsRisk dashboard", href: "/dashboard" },
      { label: "Policy console", href: "/policies" },
    ],
    resources: [
      { label: "Adapter health", href: "/adapters" },
      { label: "Preflight API", href: "/api/preflight" },
      { label: "Health check", href: "/api/health" },
    ],
  },
} as const;

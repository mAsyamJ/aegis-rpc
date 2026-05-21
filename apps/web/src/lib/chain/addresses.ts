/** Base Sepolia deployed contracts — synced 2026-05-21 broadcast (testnet keystore). */
export const BASE_SEPOLIA_CHAIN_ID = 84532;

export const contractAddresses = {
  AegisPolicyRegistry:
    (process.env.NEXT_PUBLIC_AEGIS_POLICY_REGISTRY as `0x${string}` | undefined) ??
    ("0xdd59bC2E7Ea61E689d16514428DD618cFB825011" as `0x${string}`),
  DemoERC20:
    (process.env.NEXT_PUBLIC_DEMO_ERC20 as `0x${string}` | undefined) ??
    ("0xba0e8E5CBDD3DC2D3787776298fA524313BAB52E" as `0x${string}`),
  DemoSpender:
    (process.env.NEXT_PUBLIC_DEMO_SPENDER as `0x${string}` | undefined) ??
    ("0x29993246fF751a72B43C1B47583822c017691995" as `0x${string}`),
  AgentUseCasePolicyApp:
    (process.env.NEXT_PUBLIC_AGENT_POLICY_APP as `0x${string}` | undefined) ??
    ("0x0355bDCAC2A7078E67A223422632C94F1af762A0" as `0x${string}`),
  DeFiUseCasePolicyApp:
    (process.env.NEXT_PUBLIC_DEFI_POLICY_APP as `0x${string}` | undefined) ??
    ("0x320b965A9b79229703548E51c5BCAE9C5769406C" as `0x${string}`),
  RWAUseCasePolicyApp:
    (process.env.NEXT_PUBLIC_RWA_POLICY_APP as `0x${string}` | undefined) ??
    ("0x6B41B1d1bFd18be664FC73969B4Dd30323fD025c" as `0x${string}`),
} as const;

export const BASESCAN_SEPOLIA = "https://sepolia.basescan.org/address";

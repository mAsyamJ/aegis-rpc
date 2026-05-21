export type KnownSelectorEntry = {
  selector: string;
  signature: string;
  label: string;
  useCase: "wallet" | "agent" | "defi" | "rwa" | "treasury" | "backend";
};

/** High-value DeFi/admin selectors (not full router surface — plan §25). */
export const KNOWN_SELECTORS: KnownSelectorEntry[] = [
  {
    selector: "0x095ea7b3",
    signature: "approve(address,uint256)",
    label: "ERC20 Approve",
    useCase: "wallet",
  },
  {
    selector: "0xa9059cbb",
    signature: "transfer(address,uint256)",
    label: "ERC20 Transfer",
    useCase: "wallet",
  },
  {
    selector: "0x23b872dd",
    signature: "transferFrom(address,address,uint256)",
    label: "ERC20 Transfer From",
    useCase: "defi",
  },
  {
    selector: "0x38ed1739",
    signature: "swapExactTokensForTokens(uint256,uint256,address[],address,uint256)",
    label: "Uniswap V2 Swap",
    useCase: "defi",
  },
  {
    selector: "0x7ff36ab5",
    signature: "swapExactETHForTokens(uint256,address[],address,uint256)",
    label: "Uniswap V2 Swap ETH",
    useCase: "defi",
  },
  {
    selector: "0x18cbafe5",
    signature: "swapExactTokensForETH(uint256,uint256,address[],address,uint256)",
    label: "Uniswap V2 Swap to ETH",
    useCase: "defi",
  },
  {
    selector: "0xac9650d8",
    signature: "multicall(bytes[])",
    label: "Multicall Batch",
    useCase: "defi",
  },
  {
    selector: "0xbaa2abde",
    signature: "supply(address,uint256,address,uint16)",
    label: "Aave Supply",
    useCase: "defi",
  },
  {
    selector: "0x69328dec",
    signature: "withdraw(address,uint256,address)",
    label: "Aave Withdraw",
    useCase: "defi",
  },
  {
    selector: "0xa694fc3a",
    signature: "stake(uint256)",
    label: "Stake",
    useCase: "defi",
  },
  {
    selector: "0x2e1a7d4d",
    signature: "withdraw(uint256)",
    label: "Withdraw",
    useCase: "treasury",
  },
  {
    selector: "0x40c10f19",
    signature: "mint(address,uint256)",
    label: "Mint",
    useCase: "backend",
  },
  {
    selector: "0x6a761202",
    signature: "execTransaction(address,uint256,bytes,uint8,uint256,uint256,uint256,address,address,bytes)",
    label: "Safe Exec Transaction",
    useCase: "treasury",
  },
  {
    selector: "0xa22cb465",
    signature: "setApprovalForAll(address,bool)",
    label: "Set Approval For All",
    useCase: "wallet",
  },
  {
    selector: "0x468721a7",
    signature: "setApprovalForAll(address,bool)",
    label: "Set Approval For All (alt)",
    useCase: "wallet",
  },
  {
    selector: "0x1249c58b",
    signature: "mint()",
    label: "Mint (no args)",
    useCase: "defi",
  },
  {
    selector: "0x42966c68",
    signature: "burn(uint256)",
    label: "Burn",
    useCase: "defi",
  },
];

const bySelector = new Map(
  KNOWN_SELECTORS.map((e) => [e.selector.toLowerCase(), e])
);

export function lookupKnownSelector(selector?: string): KnownSelectorEntry | undefined {
  if (!selector) return undefined;
  return bySelector.get(selector.toLowerCase());
}

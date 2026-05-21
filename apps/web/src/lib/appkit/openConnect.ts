type AppKitOpen = (options: { view: "Connect" }) => void;

/** Opens the connect modal with browser-detected wallets (EIP-6963) first. */
export function openWalletConnect(open: AppKitOpen) {
  open({ view: "Connect" });
}

export interface WalletProvider {
  id: string;
  label: string;
  badge?: boolean;
}

export const WALLET_PROVIDERS: WalletProvider[] = [
  { id: "walletconnect", label: "WalletConnect", badge: true },
  { id: "metamask", label: "MetaMask" },
  { id: "coinbase", label: "Coinbase Wallet" },
];

export const WALLET_BADGES = ["MetaMask", "WalletConnect", "Coinbase"];

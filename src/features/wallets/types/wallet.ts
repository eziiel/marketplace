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

export type WalletKind = "primary" | "secondary";

export interface CollectorWallet {
  id: string;
  kind: WalletKind;
  displayName: string;
  walletNickname: string;
  networkId: string;
  profileName: string;
  address: string;
  secondaryAddress: string;
  walletType: string;
  referralCode: string;
  email: string;
  ensName: string;
  ensDomain: string;
  createdAt: string;
  updatedAt: string;
}

export interface WalletsResponse {
  wallets: CollectorWallet[];
}

export interface WalletResponse {
  wallet: CollectorWallet;
}

export type WalletInput = Omit<
  CollectorWallet,
  "id" | "createdAt" | "updatedAt"
>;

export interface UpdateWalletInput {
  id: string;
  values: WalletInput;
}

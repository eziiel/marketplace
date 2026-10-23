import type { WalletKind } from "../types/wallet";

export function shortAddress(address: string): string {
  return address.length > 12
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : address;
}

export function walletKindLabel(kind: WalletKind): string {
  return kind === "primary" ? "Principal" : "Secundária";
}

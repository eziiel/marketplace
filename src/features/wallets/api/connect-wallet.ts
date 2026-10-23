import { api } from "@/lib/api";

export interface WalletConnectionResponse {
  walletId: string;
  status: "connected" | "disconnected";
  connectedAt?: string;
}

export async function connectWallet(
  walletId: string,
): Promise<WalletConnectionResponse> {
  const { data } = await api.post<WalletConnectionResponse>(
    `/wallets/${encodeURIComponent(walletId)}/connect`,
  );

  return data;
}

export async function disconnectWallet(
  walletId: string,
): Promise<WalletConnectionResponse> {
  const { data } = await api.post<WalletConnectionResponse>(
    `/wallets/${encodeURIComponent(walletId)}/disconnect`,
  );

  return data;
}

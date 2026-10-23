import { api } from "@/lib/api";
import type { WalletsResponse } from "../types/wallet";

export async function promoteWallet(
  walletId: string,
): Promise<WalletsResponse> {
  const { data } = await api.post<WalletsResponse>(
    `/wallets/${encodeURIComponent(walletId)}/primary`,
  );

  return data;
}

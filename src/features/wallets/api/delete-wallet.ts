import { api } from "@/lib/api";
import type { WalletsResponse } from "@/features/wallets/types/wallet";

export async function deleteWallet(id: string): Promise<WalletsResponse> {
  const { data } = await api.delete<WalletsResponse>(
    `/wallets/${encodeURIComponent(id)}`,
  );

  return data;
}

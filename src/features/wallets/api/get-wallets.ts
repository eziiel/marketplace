import { api } from "@/lib/api";
import type { WalletsResponse } from "@/features/wallets/types/wallet";

export async function getWallets(): Promise<WalletsResponse> {
  const { data } = await api.get<WalletsResponse>("/wallets");

  return data;
}

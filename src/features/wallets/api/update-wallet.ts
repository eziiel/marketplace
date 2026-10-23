import { api } from "@/lib/api";
import type { UpdateWalletInput, WalletResponse } from "@/features/wallets/types/wallet";

export async function updateWallet({
  id,
  values,
}: UpdateWalletInput): Promise<WalletResponse> {
  const { data } = await api.put<WalletResponse>(
    `/wallets/${encodeURIComponent(id)}`,
    values,
  );

  return data;
}

import { api } from "@/lib/api";
import type { WalletInput, WalletResponse } from "@/features/wallets/types/wallet";

export async function createWallet(
  input: WalletInput,
): Promise<WalletResponse> {
  const { data } = await api.post<WalletResponse>("/wallets", input);

  return data;
}

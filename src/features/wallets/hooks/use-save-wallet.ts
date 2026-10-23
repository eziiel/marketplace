import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createWallet } from "@/features/wallets/api/create-wallet";
import { updateWallet } from "@/features/wallets/api/update-wallet";
import type { WalletInput, WalletResponse } from "@/features/wallets/types/wallet";
import { useSessionToken } from "@/lib/session-token";
import { walletsKey } from "./wallet-keys";

export interface SaveWalletInput {
  id: string | null;
  values: WalletInput;
}

export function useSaveWallet() {
  const queryClient = useQueryClient();
  const token = useSessionToken();

  return useMutation({
    mutationFn: ({ id, values }: SaveWalletInput): Promise<WalletResponse> =>
      id ? updateWallet({ id, values }) : createWallet(values),

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: walletsKey(token) });
    },
  });
}

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createWallet } from "../api/create-wallet";
import { updateWallet } from "../api/update-wallet";
import type { WalletInput, WalletResponse } from "../types/wallet";
import { useSessionToken, walletsKey } from "./use-profile-keys";

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

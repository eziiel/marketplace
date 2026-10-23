import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteWallet } from "../api/delete-wallet";
import type { WalletsResponse } from "../types/wallet";
import { useSessionToken, walletsKey } from "./use-profile-keys";

export function useDeleteWallet() {
  const queryClient = useQueryClient();
  const token = useSessionToken();
  const key = walletsKey(token);

  return useMutation({
    mutationFn: deleteWallet,

    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: key });

      const previous = queryClient.getQueryData<WalletsResponse>(key);

      if (previous) {
        queryClient.setQueryData<WalletsResponse>(key, {
          wallets: previous.wallets.filter((wallet) => wallet.id !== id),
        });
      }

      return { previous };
    },

    onError: (_error, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(key, context.previous);
      }
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: key });
    },
  });
}

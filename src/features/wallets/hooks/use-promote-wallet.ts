import { useMutation, useQueryClient } from "@tanstack/react-query";

import { promoteWallet } from "../api/promote-wallet";
import { useSessionToken } from "@/lib/session-token";
import { walletsKey } from "./wallet-keys";

export function usePromoteWallet() {
  const queryClient = useQueryClient();
  const token = useSessionToken();

  return useMutation({
    mutationFn: promoteWallet,

    onSuccess: (response) => {
      queryClient.setQueryData(walletsKey(token), response);
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: walletsKey(token) });
    },
  });
}

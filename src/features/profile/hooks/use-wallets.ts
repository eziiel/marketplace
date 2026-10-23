import { useQuery } from "@tanstack/react-query";

import { getWallets } from "../api/get-wallets";
import { useSessionToken, walletsKey } from "./use-profile-keys";

export function useWallets() {
  const token = useSessionToken();

  return useQuery({
    queryKey: walletsKey(token),
    queryFn: getWallets,
    enabled: Boolean(token),
    retry: false,
    staleTime: 30_000,
  });
}

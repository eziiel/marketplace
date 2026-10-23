import { useQuery } from "@tanstack/react-query";

import { getWallets } from "@/features/wallets/api/get-wallets";
import { useSessionToken } from "@/lib/session-token";
import { walletsKey } from "./wallet-keys";

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

import { useQuery } from "@tanstack/react-query";

import { getMe } from "../api/get-me";
import { getAuthToken } from "../lib/auth-token";

export function useAuthMe() {
  const token = getAuthToken();

  return useQuery({
    queryKey: ["auth", "me", token],
    queryFn: getMe,
    enabled: Boolean(token),
    retry: false,
    staleTime: 0,
  });
}

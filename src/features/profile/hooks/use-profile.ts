import { useQuery } from "@tanstack/react-query";

import { getProfile } from "../api/get-profile";
import { useSessionToken } from "@/lib/session-token";
import { profileKey } from "./profile-keys";

export function useProfile() {
  const token = useSessionToken();

  return useQuery({
    queryKey: profileKey(token),
    queryFn: getProfile,
    enabled: Boolean(token),
    retry: false,
    staleTime: 30_000,
  });
}

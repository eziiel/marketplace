import { useQuery } from "@tanstack/react-query";
import { getFavorites } from "../api/get-favorites";
import { getAuthToken } from "@/features/auth/lib/auth-token";

export function useFavorites() {
  const token = getAuthToken();

  return useQuery({
    queryKey: ["favorites", token],
    queryFn: getFavorites,
    enabled: Boolean(token),
    retry: false,
  });
}

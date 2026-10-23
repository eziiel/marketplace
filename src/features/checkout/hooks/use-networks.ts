import { useQuery } from "@tanstack/react-query";
import { getNetworks } from "../api/get-networks";

export function useNetworks() {
  return useQuery({
    queryKey: ["networks"],
    queryFn: getNetworks,
    staleTime: Infinity,
  });
}

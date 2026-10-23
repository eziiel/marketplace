import { useQuery } from "@tanstack/react-query";
import { createQuote } from "../api/create-quote";
import type { CreateQuoteInput } from "../types/quote";

export function useQuote(
  input: CreateQuoteInput,
  options: { enabled: boolean },
) {
  return useQuery({
    queryKey: ["quote", input.networkId, input.couponCode ?? null],
    queryFn: () => createQuote(input),
    enabled: options.enabled,
    retry: false,
    staleTime: 0,
    gcTime: 0,
  });
}

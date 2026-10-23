import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createQuote } from "../api/create-quote";
import type { CreateQuoteInput } from "../types/quote";

export interface UseQuoteOptions {
  enabled: boolean;
  cartKey?: string;
}

export function useQuote(input: CreateQuoteInput, options: UseQuoteOptions) {
  return useQuery({
    queryKey: [
      "quote",
      input.networkId,
      input.couponCode ?? null,
      options.cartKey ?? null,
    ],
    queryFn: () => createQuote(input),
    enabled: options.enabled,
    retry: false,
    staleTime: 0,
    gcTime: 0,
    placeholderData: options.cartKey ? keepPreviousData : undefined,
  });
}

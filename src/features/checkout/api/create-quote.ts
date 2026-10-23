import { api } from "@/lib/api";
import type { CreateQuoteInput, Quote } from "../types/quote";

export async function createQuote(input: CreateQuoteInput): Promise<Quote> {
  const response = await api.post<Quote>("/quote", input);

  return response.data;
}

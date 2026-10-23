import type { Quote } from "@/features/checkout/types/quote";

const STORAGE_KEY = "marketplace-quotes";

export interface StoredQuote {
  userId: string;
  quote: Quote;
}

type QuoteStore = Record<string, StoredQuote>;

function readStore(): QuoteStore {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    return stored ? (JSON.parse(stored) as QuoteStore) : {};
  } catch {
    return {};
  }
}

function writeStore(store: QuoteStore): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function saveQuote(userId: string, quote: Quote): void {
  const store = readStore();

  store[quote.id] = { userId, quote };
  writeStore(store);
}

export function getStoredQuote(quoteId: string): StoredQuote | null {
  return readStore()[quoteId] ?? null;
}

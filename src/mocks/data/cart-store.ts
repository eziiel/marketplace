import type { Cart } from "@/features/cart/types/cart";

const STORAGE_KEY = "marketplace-carts";

type CartStore = Record<string, Cart>;

function readStore(): CartStore {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    return stored ? (JSON.parse(stored) as CartStore) : {};
  } catch {
    return {};
  }
}

function writeStore(store: CartStore): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function getSessionCart(sessionId: string): Cart {
  const store = readStore();

  return store[sessionId] ?? { items: [] };
}

export function saveSessionCart(sessionId: string, cart: Cart): void {
  const store = readStore();

  store[sessionId] = cart;
  writeStore(store);
}

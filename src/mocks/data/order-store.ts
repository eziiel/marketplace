import type { Order } from "@/features/checkout/types/order";

const STORAGE_KEY = "marketplace-orders";

export interface IdempotencyRecord {
  orderId: string;
  requestHash: string;
}

interface OrderStore {
  orders: Record<string, Record<string, Order>>;
  idempotency: Record<string, Record<string, IdempotencyRecord>>;
}

function readStore(): OrderStore {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return { orders: {}, idempotency: {} };
    }

    const parsed = JSON.parse(stored) as Partial<OrderStore>;

    return {
      orders: parsed.orders ?? {},
      idempotency: parsed.idempotency ?? {},
    };
  } catch {
    return { orders: {}, idempotency: {} };
  }
}

function writeStore(store: OrderStore): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function getOrder(userId: string, orderId: string): Order | null {
  return readStore().orders[userId]?.[orderId] ?? null;
}

export function listOrders(userId: string): Order[] {
  return Object.values(readStore().orders[userId] ?? {});
}

export function saveOrder(userId: string, order: Order): void {
  const store = readStore();
  const userOrders = store.orders[userId] ?? {};

  userOrders[order.id] = order;
  store.orders[userId] = userOrders;
  writeStore(store);
}

export function getIdempotencyRecord(
  userId: string,
  key: string,
): IdempotencyRecord | null {
  return readStore().idempotency[userId]?.[key] ?? null;
}

export function saveIdempotencyRecord(
  userId: string,
  key: string,
  record: IdempotencyRecord,
): void {
  const store = readStore();
  const userKeys = store.idempotency[userId] ?? {};

  userKeys[key] = record;
  store.idempotency[userId] = userKeys;
  writeStore(store);
}

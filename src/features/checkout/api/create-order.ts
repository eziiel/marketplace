import { api } from "@/lib/api";
import type { CreateOrderInput, Order } from "../types/order";

export interface CreateOrderArgs extends CreateOrderInput {
  idempotencyKey: string;
}

export async function createOrder({
  idempotencyKey,
  ...body
}: CreateOrderArgs): Promise<Order> {
  const response = await api.post<Order>("/orders", body, {
    headers: { "Idempotency-Key": idempotencyKey },
  });

  return response.data;
}

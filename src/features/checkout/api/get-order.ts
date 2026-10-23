import { api } from "@/lib/api";
import type { Order } from "../types/order";

export async function getOrder(orderId: string): Promise<Order> {
  const response = await api.get<Order>(
    `/orders/${encodeURIComponent(orderId)}`,
  );

  return response.data;
}

import { api } from "@/lib/api";
import type { Receipt } from "../types/order";

export async function getReceipt(orderId: string): Promise<Receipt> {
  const response = await api.get<Receipt>(
    `/orders/${encodeURIComponent(orderId)}/receipt`,
  );

  return response.data;
}

import { api } from "@/lib/api";
import type { Cart } from "../types/cart";

export async function getCart(): Promise<Cart> {
  const response = await api.get<Cart>("/cart");

  return response.data;
}

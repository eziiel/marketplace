import { api } from "@/lib/api";
import type { Cart, CartItem } from "../types/cart";

export type AddCartItemInput = CartItem;

export async function addCartItem(item: AddCartItemInput): Promise<Cart> {
  const response = await api.post<Cart>("/cart/items", item);

  return response.data;
}

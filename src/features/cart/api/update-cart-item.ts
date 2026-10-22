import { api } from "@/lib/api";
import type { Cart, CartItem } from "../types/cart";

export type UpdateCartItemInput = CartItem;

export async function updateCartItem({
  nftId,
  edition,
  quantity,
}: UpdateCartItemInput): Promise<Cart> {
  const response = await api.patch<Cart>(
    `/cart/items/${encodeURIComponent(nftId)}`,
    { edition, quantity },
  );

  return response.data;
}

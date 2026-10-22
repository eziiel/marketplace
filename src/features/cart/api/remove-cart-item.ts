import { api } from "@/lib/api";
import type { Cart } from "../types/cart";

export interface RemoveCartItemInput {
  nftId: string;
  edition: string;
}

export async function removeCartItem({
  nftId,
  edition,
}: RemoveCartItemInput): Promise<Cart> {
  const response = await api.delete<Cart>(
    `/cart/items/${encodeURIComponent(nftId)}`,
    {
      params: { edition },
    },
  );

  return response.data;
}

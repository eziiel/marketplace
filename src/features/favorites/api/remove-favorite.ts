import { api } from "@/lib/api";
import type { FavoritesResponse } from "../types/favorite";

export async function removeFavorite(
  nftId: string,
): Promise<FavoritesResponse> {
  const { data } = await api.delete<FavoritesResponse>(
    `/favorites/${encodeURIComponent(nftId)}`,
  );
  return data;
}

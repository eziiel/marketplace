import { api } from "@/lib/api";
import type { FavoritesResponse } from "../types/favorite";

export async function addFavorite(nftId: string): Promise<FavoritesResponse> {
  const { data } = await api.post<FavoritesResponse>("/favorites", { nftId });
  return data;
}

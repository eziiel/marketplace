import { api } from "@/lib/api";
import type { FavoritesResponse } from "../types/favorite";

export async function getFavorites(): Promise<FavoritesResponse> {
  const { data } = await api.get<FavoritesResponse>("/favorites");
  return data;
}

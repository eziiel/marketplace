import { api } from "@/lib/api";
import type { NftReviews } from "../types/nft";

export async function getNftReviews(id: string): Promise<NftReviews> {
  const response = await api.get<NftReviews>(
    `/nfts/${encodeURIComponent(id)}/reviews`,
  );

  return response.data;
}

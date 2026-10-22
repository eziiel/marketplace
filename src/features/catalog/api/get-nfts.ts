import { api } from "@/lib/api";
import type { NftListParams, NftListResponse } from "../types/nft";

export async function getNfts(params: NftListParams): Promise<NftListResponse> {
  const response = await api.get<NftListResponse>("/nfts", {
    params,
  });

  return response.data;
}

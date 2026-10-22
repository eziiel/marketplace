import { api } from "@/lib/api";
import type { NFT } from "../types/nft";

export async function getNftById(id: string): Promise<NFT> {
  const response = await api.get<NFT>(`/nfts/${encodeURIComponent(id)}`);

  return response.data;
}

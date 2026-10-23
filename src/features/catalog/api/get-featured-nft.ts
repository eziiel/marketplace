import { api } from "@/lib/api";
import type { NFT } from "../types/nft";

export async function getFeaturedNft(): Promise<NFT> {
  const response = await api.get<NFT>("/nfts/featured");

  return response.data;
}

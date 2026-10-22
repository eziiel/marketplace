import { api } from "@/lib/api";

export interface NFT {
  id: string;
  name: string;
  price: number;
  currency: string;
}

export async function getNfts(): Promise<NFT[]> {
  const response = await api.get<NFT[]>("/nfts");

  return response.data;
}

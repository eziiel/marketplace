export interface NFT {
  id: string;
  name: string;
  price: string;
  currency: "ETH";
  available: number;
  edition: string;
}

export interface NftListParams {
  search?: string;
  page: number;
  sort?: "price_asc" | "price_desc";
}

export interface NftListResponse {
  items: NFT[];
  page: number;
  total: number;
  totalPages: number;
}

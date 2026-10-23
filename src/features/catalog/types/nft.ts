export type NftNetwork = "ethereum" | "polygon" | "solana";

export type NftTag = "new" | "trending";

export interface NFT {
  id: string;
  name: string;
  price: string;
  oldPrice?: string;
  currency: "ETH";
  available: number;
  edition: string;
  collection: string;
  network: NftNetwork;
  image: string;
  gallery: string[];
  tokenId: string;
  attributes: string[];
  creator: string;
  listedAt: string;
  tags?: NftTag[];
  rarity?: string;
  featured?: boolean;
}

export type NftSort = "recent" | "price_asc" | "price_desc";

export type NftTab = "all" | "new" | "trending";

export interface NftListParams {
  search?: string;
  page: number;
  sort?: NftSort;
  collection?: string;
  network?: NftNetwork;
  minPrice?: string;
  maxPrice?: string;
  tab?: NftTab;
}

export interface NftFacetOption {
  value: string;
  label: string;
  count: number;
}

export interface NftFacets {
  collections: NftFacetOption[];
  networks: NftFacetOption[];
  price: {
    min: string;
    max: string;
  };
}

export interface NftListResponse {
  items: NFT[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  facets: NftFacets;
}

export interface NftReview {
  id: string;
  author: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface NftReviews {
  average: number;
  count: number;
  items: NftReview[];
}

export const NFT_EDITIONS = ["1/1", "1/10", "1/50", "Aberta"] as const;

export const NFT_NETWORK_LABELS: Record<NftNetwork, string> = {
  ethereum: "Ethereum",
  polygon: "Polygon",
  solana: "Solana",
};

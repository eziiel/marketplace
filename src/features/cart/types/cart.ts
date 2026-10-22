export interface CartItem {
  nftId: string;
  edition: string;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
}

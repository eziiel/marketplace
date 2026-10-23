export type OrderStatus = "pending" | "confirmed" | "refused";

export interface OrderItem {
  nftId: string;
  edition: string;
  name: string;
  unitPrice: string;
  quantity: number;
  lineTotal: string;
}

export interface OrderTotals {
  subtotal: string;
  discount: string;
  networkFee: string;
  total: string;
  currency: "ETH";
}

export interface Order {
  id: string;
  status: OrderStatus;
  version: number;
  items: OrderItem[];
  totals: OrderTotals;
  networkId: string;
  couponCode: string | null;
  createdAt: string;
  confirmedAt: string | null;
  transactionHash: string | null;
  explorerUrl: string | null;
  refusalReason: string | null;
}

export interface CreateOrderInput {
  quoteId: string;
}

export interface Receipt {
  orderId: string;
  status: OrderStatus;
  items: OrderItem[];
  totals: OrderTotals;
  networkId: string;
  transactionHash: string | null;
  explorerUrl: string | null;
  confirmedAt: string | null;
}

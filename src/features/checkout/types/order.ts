import type { WalletKind } from "@/features/wallets/types/wallet";

export interface OrderWallet {
  id: string;
  kind: WalletKind;
  nickname: string;
  address: string;
  networkId: string;
  walletType: string;
}

export type OrderStatus = "pending" | "confirmed" | "refused";

export interface OrderItem {
  nftId: string;
  edition: string;
  name: string;
  image?: string;
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
  wallet: OrderWallet | null;
  couponCode: string | null;
  createdAt: string;
  confirmedAt: string | null;
  transactionHash: string | null;
  explorerUrl: string | null;
  refusalReason: string | null;
}

export interface CreateOrderInput {
  quoteId: string;
  walletId: string;
}

export interface Receipt {
  orderId: string;
  status: OrderStatus;
  items: OrderItem[];
  totals: OrderTotals;
  networkId: string;
  wallet: OrderWallet | null;
  transactionHash: string | null;
  explorerUrl: string | null;
  confirmedAt: string | null;
}

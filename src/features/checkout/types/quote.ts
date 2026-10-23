export interface CheckoutNetwork {
  id: string;
  label: string;
  fee: string;
}

export interface QuoteLineItem {
  nftId: string;
  edition: string;
  name: string;
  unitPrice: string;
  quantity: number;
  lineTotal: string;
  available: number;
  availabilityOk: boolean;
}

export type CouponStatus = "none" | "applied" | "invalid" | "expired";

export interface Quote {
  id: string;
  currency: "ETH";
  items: QuoteLineItem[];
  subtotal: string;
  discount: string;
  networkId: string;
  networkFee: string;
  total: string;
  couponCode: string | null;
  couponStatus: CouponStatus;
  hasAvailabilityIssue: boolean;
  expiresAt: string;
}

export interface CreateQuoteInput {
  networkId: string;
  couponCode?: string | null;
}

export interface MockCoupon {
  code: string;
  percentOff: number;
  expired: boolean;
}

export const coupons: MockCoupon[] = [
  { code: "WELCOME10", percentOff: 10, expired: false },
  { code: "EXPIRED10", percentOff: 10, expired: true },
];

const COUPON_KEY = "marketplace-coupon";

export function getStoredCoupon(): string | null {
  try {
    return sessionStorage.getItem(COUPON_KEY);
  } catch {
    return null;
  }
}

export function storeCoupon(code: string | null): void {
  try {
    if (code) {
      sessionStorage.setItem(COUPON_KEY, code);
    } else {
      sessionStorage.removeItem(COUPON_KEY);
    }
  } catch {
    return;
  }
}

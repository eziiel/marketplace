export function toCents(value: string): number {
  return Math.round(Number(value) * 100);
}

export function fromCents(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function formatEth(cents: number): string {
  return fromCents(cents).replace(".", ",");
}

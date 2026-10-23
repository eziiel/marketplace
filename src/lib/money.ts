const DECIMALS = 18;
const SCALE = 10n ** BigInt(DECIMALS);

function parse(value: string): bigint {
  const trimmed = value.trim();
  const negative = trimmed.startsWith("-");
  const unsigned = negative ? trimmed.slice(1) : trimmed;
  const [whole, fraction = ""] = unsigned.split(".");
  const paddedFraction = (fraction + "0".repeat(DECIMALS)).slice(0, DECIMALS);
  const result = BigInt(whole || "0") * SCALE + BigInt(paddedFraction || "0");
  return negative ? -result : result;
}

function format(wei: bigint): string {
  const negative = wei < 0n;
  const abs = negative ? -wei : wei;
  const whole = abs / SCALE;
  const fraction = abs % SCALE;
  const fractionStr = fraction
    .toString()
    .padStart(DECIMALS, "0")
    .replace(/0+$/, "");
  const result = fractionStr.length > 0 ? `${whole}.${fractionStr}` : `${whole}`;
  return negative ? `-${result}` : result;
}

export function multiply(price: string, quantity: number): string {
  return format(parse(price) * BigInt(quantity));
}

export function sum(values: string[]): string {
  return format(values.reduce((total, value) => total + parse(value), 0n));
}

export function add(a: string, b: string): string {
  return format(parse(a) + parse(b));
}

export function subtract(a: string, b: string): string {
  return format(parse(a) - parse(b));
}

export function percentage(value: string, percent: number): string {
  return format((parse(value) * BigInt(percent)) / 100n);
}

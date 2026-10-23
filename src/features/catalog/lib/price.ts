const DECIMAL_PART = /^(\d*)(?:\.(\d*))?$/;

export function toCents(value: string): number {
  const match = DECIMAL_PART.exec(value.trim());

  if (!match) {
    return 0;
  }

  const [, whole = "", fraction = ""] = match;
  const cents = `${fraction}00`.slice(0, 2);

  return Number(whole || "0") * 100 + Number(cents);
}

export function fromCents(cents: number): string {
  const safe = Math.max(0, Math.round(cents));
  const rest = safe % 100;

  return `${(safe - rest) / 100}.${String(rest).padStart(2, "0")}`;
}

export function trimDecimal(value: string): string {
  if (!value.includes(".")) {
    return value;
  }

  const trimmed = value.replace(/0+$/, "").replace(/\.$/, "");

  return trimmed.length > 0 ? trimmed : "0";
}

export function formatEth(cents: number): string {
  return fromCents(cents).replace(".", ",");
}

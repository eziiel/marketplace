export type AddressFormat = "evm" | "solana";

interface AddressRule {
  pattern: RegExp;
  hint: string;
  sample: string;
}

const RULES: Record<AddressFormat, AddressRule> = {
  evm: {
    pattern: /^0x[0-9a-fA-F]{40}$/,
    hint: "Informe um endereço 0x válido com 40 caracteres hexadecimais.",
    sample: "0x1234567890abcdef1234567890abcdef12345678",
  },
  solana: {
    pattern: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
    hint: "Informe um endereço base58 válido com 32 a 44 caracteres.",
    sample: "7EqQdEULxWcraVx3mXKFjc84LhCkMGZCkRuDpvcMwJeK",
  },
};

export const DEFAULT_ADDRESS_FORMAT: AddressFormat = "evm";

export function isAddressFormat(value: unknown): value is AddressFormat {
  return value === "evm" || value === "solana";
}

export function addressRule(format: AddressFormat | undefined): AddressRule {
  return RULES[format ?? DEFAULT_ADDRESS_FORMAT];
}

export function isValidAddress(
  address: string,
  format: AddressFormat | undefined,
): boolean {
  return addressRule(format).pattern.test(address.trim());
}

export function addressHint(format: AddressFormat | undefined): string {
  return addressRule(format).hint;
}

export function addressPlaceholder(
  format: AddressFormat | undefined,
): string {
  return format === "solana"
    ? "Endereço base58 da carteira"
    : "Endereço 0x da carteira";
}

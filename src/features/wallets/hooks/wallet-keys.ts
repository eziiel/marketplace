export function walletsKey(token: string | null) {
  return ["wallets", token] as const;
}

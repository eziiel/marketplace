export const devFillEnabled = import.meta.env.DEV;

export const sampleCollector = {
  displayName: "Colecionador de Teste",
  username: "colecionador.teste",
  profileName: "Perfil de Teste",
  walletNickname: "Carteira de teste",
  email: "teste@example.com",
  ensName: "colecionador-teste",
  ensDomain: ".eth",
  referralCode: "KURIO-2026",
  address: "0x1234567890abcdef1234567890abcdef12345678",
  secondaryAddress: "colecionador.eth",
  walletType: "metamask",
  networkId: "ethereum",
};

export function keepFilled<T extends object>(current: T, sample: Partial<T>): T {
  const next = { ...current };

  for (const key of Object.keys(sample) as (keyof T)[]) {
    const existing = next[key];

    if (typeof existing === "string" && existing.trim().length > 0) continue;

    const value = sample[key];

    if (value !== undefined) next[key] = value as T[keyof T];
  }

  return next;
}

import type {
  CollectorWallet,
  WalletInput,
} from "@/features/profile/types/wallet";

const STORAGE_KEY = "marketplace-wallets";

type WalletStore = Record<string, CollectorWallet[]>;

function readStore(): WalletStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) return {};

    const parsed: unknown = JSON.parse(raw);

    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return {};
    }

    return parsed as WalletStore;
  } catch {
    return {};
  }
}

function writeStore(store: WalletStore): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function listWallets(userId: string): CollectorWallet[] {
  return [...(readStore()[userId] ?? [])];
}

export function findWallet(
  userId: string,
  walletId: string,
): CollectorWallet | undefined {
  return listWallets(userId).find((wallet) => wallet.id === walletId);
}

export function createWallet(
  userId: string,
  input: WalletInput,
): CollectorWallet {
  const now = new Date().toISOString();

  const wallet: CollectorWallet = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };

  const store = readStore();

  store[userId] = [...(store[userId] ?? []), wallet];

  writeStore(store);

  return wallet;
}

export function updateWallet(
  userId: string,
  walletId: string,
  input: WalletInput,
): CollectorWallet | null {
  const store = readStore();
  const wallets = store[userId] ?? [];
  const index = wallets.findIndex((wallet) => wallet.id === walletId);

  if (index === -1) return null;

  const updated: CollectorWallet = {
    ...wallets[index],
    ...input,
    updatedAt: new Date().toISOString(),
  };

  wallets[index] = updated;
  store[userId] = wallets;

  writeStore(store);

  return updated;
}

export function removeWallet(userId: string, walletId: string): boolean {
  const store = readStore();
  const wallets = store[userId] ?? [];
  const next = wallets.filter((wallet) => wallet.id !== walletId);

  if (next.length === wallets.length) return false;

  store[userId] = next;

  writeStore(store);

  return true;
}

export function clearWallets(): void {
  localStorage.removeItem(STORAGE_KEY);
}

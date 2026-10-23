import type {
  CollectorWallet,
  WalletInput,
} from "@/features/wallets/types/wallet";

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

function sortByKind(wallets: CollectorWallet[]): CollectorWallet[] {
  return [...wallets].sort((a, b) =>
    a.kind === b.kind ? 0 : a.kind === "primary" ? -1 : 1,
  );
}

export function listWallets(userId: string): CollectorWallet[] {
  return sortByKind(readStore()[userId] ?? []);
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
  const store = readStore();
  const current = store[userId] ?? [];

  const wallet: CollectorWallet = {
    ...input,
    kind: current.length === 0 ? "primary" : input.kind,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };

  store[userId] = [...current, wallet];

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
    kind: wallets[index].kind,
    updatedAt: new Date().toISOString(),
  };

  wallets[index] = updated;
  store[userId] = wallets;

  writeStore(store);

  return updated;
}

export function promoteWallet(
  userId: string,
  walletId: string,
): CollectorWallet[] | null {
  const store = readStore();
  const wallets = store[userId] ?? [];

  if (!wallets.some((wallet) => wallet.id === walletId)) return null;

  const now = new Date().toISOString();

  store[userId] = wallets.map((wallet) => {
    if (wallet.id === walletId) {
      return wallet.kind === "primary"
        ? wallet
        : { ...wallet, kind: "primary", updatedAt: now };
    }

    return wallet.kind === "primary"
      ? { ...wallet, kind: "secondary", updatedAt: now }
      : wallet;
  });

  writeStore(store);

  return sortByKind(store[userId]);
}

export function removeWallet(
  userId: string,
  walletId: string,
): CollectorWallet[] | null {
  const store = readStore();
  const wallets = store[userId] ?? [];
  const target = wallets.find((wallet) => wallet.id === walletId);

  if (!target) return null;

  const remaining = wallets.filter((wallet) => wallet.id !== walletId);

  if (target.kind === "primary" && remaining.length > 0) {
    const now = new Date().toISOString();
    const [next, ...rest] = remaining;

    store[userId] = [{ ...next, kind: "primary", updatedAt: now }, ...rest];
  } else {
    store[userId] = remaining;
  }

  writeStore(store);

  return sortByKind(store[userId]);
}

export function clearWallets(): void {
  localStorage.removeItem(STORAGE_KEY);
}

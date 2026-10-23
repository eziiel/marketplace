import type { NFT } from "@/features/catalog/types/nft";
import { nfts as seed } from "./nfts";

export interface StoredNft extends NFT {
  version: number;
}

const STORAGE_KEY = "marketplace-nfts-v2";

function seedStore(): Record<string, StoredNft> {
  const store: Record<string, StoredNft> = {};

  for (const nft of seed) {
    store[nft.id] = { ...nft, version: 1 };
  }

  return store;
}

function readStore(): Record<string, StoredNft> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      const fresh = seedStore();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));

      return fresh;
    }

    return mergeSeed(JSON.parse(stored) as Record<string, StoredNft>);
  } catch {
    return seedStore();
  }
}

function mergeSeed(
  store: Record<string, StoredNft>,
): Record<string, StoredNft> {
  let changed = false;

  for (const nft of seed) {
    const current = store[nft.id];

    if (!current) {
      store[nft.id] = { ...nft, version: 1 };
      changed = true;
      continue;
    }

    if (current.network === undefined || current.tokenId === undefined) {
      store[nft.id] = { ...nft, ...current, network: current.network ?? nft.network };
      changed = true;
    }
  }

  if (changed) {
    writeStore(store);
  }

  return store;
}

function writeStore(store: Record<string, StoredNft>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function listNfts(): StoredNft[] {
  return Object.values(readStore());
}

export function getNft(id: string): StoredNft | null {
  return readStore()[id] ?? null;
}

export function findNft(id: string, edition: string): StoredNft | null {
  const nft = readStore()[id];

  return nft && nft.edition === edition ? nft : null;
}

export function updateNft(
  id: string,
  patch: { price?: string; available?: number; version: number },
): StoredNft | null {
  const store = readStore();
  const current = store[id];

  if (!current) {
    return null;
  }

  const next: StoredNft = {
    ...current,
    price: patch.price ?? current.price,
    available: patch.available ?? current.available,
    version: patch.version,
  };

  store[id] = next;
  writeStore(store);

  return next;
}

export function decrementStock(
  id: string,
  edition: string,
  quantity: number,
): StoredNft | null {
  const store = readStore();
  const current = store[id];

  if (!current || current.edition !== edition) {
    return null;
  }

  const next: StoredNft = {
    ...current,
    available: current.available - quantity,
    version: current.version + 1,
  };

  store[id] = next;
  writeStore(store);

  return next;
}

export function resetNfts(): void {
  writeStore(seedStore());
}

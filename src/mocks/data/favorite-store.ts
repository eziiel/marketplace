const STORAGE_KEY = "marketplace-favorites";

type FavoritesStore = Record<string, string[]>;

function readStore(): FavoritesStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) return {};

    const parsed: unknown = JSON.parse(raw);

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return {};
    }

    return parsed as FavoritesStore;
  } catch {
    return {};
  }
}

function writeStore(store: FavoritesStore): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function getFavorites(userId: string): string[] {
  return [...(readStore()[userId] ?? [])];
}

export function addFavorite(userId: string, nftId: string): string[] {
  const store = readStore();
  const favorites = new Set(store[userId] ?? []);

  favorites.add(nftId);
  store[userId] = [...favorites];

  writeStore(store);

  return store[userId];
}

export function removeFavorite(userId: string, nftId: string): string[] {
  const store = readStore();

  store[userId] = (store[userId] ?? []).filter((id) => id !== nftId);

  writeStore(store);

  return store[userId];
}

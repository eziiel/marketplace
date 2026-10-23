import type { User } from "@/features/auth/types/auth";
import type { CollectorProfile } from "@/features/profile/types/profile";

const STORAGE_KEY = "marketplace-profiles";

type ProfileStore = Record<string, CollectorProfile>;

function readStore(): ProfileStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) return {};

    const parsed: unknown = JSON.parse(raw);

    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return {};
    }

    return parsed as ProfileStore;
  } catch {
    return {};
  }
}

function writeStore(store: ProfileStore): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function getProfile(user: User): CollectorProfile {
  const stored = readStore()[user.id];

  if (stored) return stored;

  return {
    userId: user.id,
    displayName: user.name,
    username: "",
    email: user.email,
    ensName: "",
    ensDomain: ".eth",
    walletNickname: "",
    avatar: null,
    updatedAt: new Date(0).toISOString(),
  };
}

export function saveProfile(profile: CollectorProfile): CollectorProfile {
  const store = readStore();

  store[profile.userId] = profile;

  writeStore(store);

  return profile;
}

export function findProfileByUsername(
  username: string,
): CollectorProfile | undefined {
  const normalized = username.trim().toLowerCase();

  return Object.values(readStore()).find(
    (profile) => profile.username.toLowerCase() === normalized,
  );
}

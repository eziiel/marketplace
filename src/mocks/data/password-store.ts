import type { MockUser } from "./users";

const STORAGE_KEY = "marketplace-password-hashes";

interface StoredSecret {
  salt: string;
  hash: string;
}

type SecretStore = Record<string, StoredSecret>;

function readStore(): SecretStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) return {};

    const parsed: unknown = JSON.parse(raw);

    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return {};
    }

    return parsed as SecretStore;
  } catch {
    return {};
  }
}

function writeStore(store: SecretStore): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function toHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function digest(salt: string, password: string): Promise<string> {
  const bytes = new TextEncoder().encode(`${salt}:${password}`);
  const hashed = await crypto.subtle.digest("SHA-256", bytes);

  return toHex(hashed);
}

export async function setUserPassword(
  userId: string,
  password: string,
): Promise<void> {
  const salt = crypto.randomUUID();
  const hash = await digest(salt, password);
  const store = readStore();

  store[userId] = { salt, hash };

  writeStore(store);
}

export async function verifyPassword(
  account: MockUser,
  password: string,
): Promise<boolean> {
  const secret = readStore()[account.user.id];

  if (!secret) {
    return account.password.length > 0 && account.password === password;
  }

  return (await digest(secret.salt, password)) === secret.hash;
}

export function hasStoredSecret(userId: string): boolean {
  return Object.hasOwn(readStore(), userId);
}

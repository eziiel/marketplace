import { getAuthToken } from "@/features/auth/lib/auth-token";

export function profileKey(token: string | null) {
  return ["profile", token] as const;
}

export function walletsKey(token: string | null) {
  return ["wallets", token] as const;
}

export function useSessionToken(): string | null {
  return getAuthToken();
}

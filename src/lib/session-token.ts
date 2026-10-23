import { getAuthToken } from "@/features/auth/lib/auth-token";

export function useSessionToken(): string | null {
  return getAuthToken();
}

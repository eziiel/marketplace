import { clearAuthToken, getAuthToken } from "@/features/auth/lib/auth-token";
import { queryClient } from "./query-client";

const PUBLIC_AUTH_PATHS = ["/auth/login", "/auth/signup"];

const SESSION_QUERY_KEY = ["auth"];

type SessionExpiredListener = () => void;

const listeners = new Set<SessionExpiredListener>();

export function onSessionExpired(listener: SessionExpiredListener): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function handleUnauthorized(url: string | undefined): void {
  if (PUBLIC_AUTH_PATHS.some((path) => (url ?? "").startsWith(path))) {
    return;
  }

  if (!getAuthToken()) {
    return;
  }

  clearAuthToken();
  queryClient.removeQueries({ queryKey: SESSION_QUERY_KEY });

  for (const listener of listeners) {
    listener();
  }
}

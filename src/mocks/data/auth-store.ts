import type { AuthSession } from "@/features/auth/types/auth";

const STORAGE_KEY = "marketplace-auth-sessions";

type SessionStore = Record<string, AuthSession>;

function readSessions(): SessionStore {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    return stored ? (JSON.parse(stored) as SessionStore) : {};
  } catch {
    return {};
  }
}

function saveSessions(sessions: SessionStore): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function createAuthSession(user: AuthSession["user"]): AuthSession {
  const token = crypto.randomUUID();

  const session: AuthSession = {
    user,
    token,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  };

  const sessions = readSessions();
  sessions[token] = session;
  saveSessions(sessions);

  return session;
}

export function getAuthSession(token: string): AuthSession | null {
  const sessions = readSessions();
  const session = sessions[token];

  if (!session) {
    return null;
  }

  if (new Date(session.expiresAt).getTime() <= Date.now()) {
    delete sessions[token];
    saveSessions(sessions);
    return null;
  }

  return session;
}

export function deleteAuthSession(token: string): void {
  const sessions = readSessions();

  delete sessions[token];

  saveSessions(sessions);
}

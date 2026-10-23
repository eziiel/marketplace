import { users, type MockUser } from "./users";

const STORAGE_KEY = "marketplace-registered-users";

function getRegisteredUsers(): MockUser[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) return [];

    const parsed: unknown = JSON.parse(stored);

    return Array.isArray(parsed) ? (parsed as MockUser[]) : [];
  } catch {
    return [];
  }
}

export function getAllUsers(): MockUser[] {
  return [...users, ...getRegisteredUsers()];
}

export function findUserByEmail(email: string): MockUser | undefined {
  const normalizedEmail = email.trim().toLowerCase();

  return getAllUsers().find(
    ({ user }) => user.email.toLowerCase() === normalizedEmail,
  );
}

export function createUser(
  name: string,
  email: string,
  password: string,
): MockUser {
  const normalizedEmail = email.trim().toLowerCase();

  if (findUserByEmail(normalizedEmail)) {
    throw new Error("Este e-mail já está cadastrado");
  }

  const newUser: MockUser = {
    user: {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: normalizedEmail,
    },
    password,
  };

  const registeredUsers = getRegisteredUsers();

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([...registeredUsers, newUser]),
  );

  return newUser;
}

import type { User } from "@/features/auth/types/auth";

interface MockUser {
  user: User;
  password: string;
}

export const users: MockUser[] = [
  {
    user: {
      id: "user-1",
      name: "Ana Silva",
      email: "ana@example.com",
    },
    password: "Teste@123",
  },
  {
    user: {
      id: "user-2",
      name: "Bruno Costa",
      email: "bruno@example.com",
    },
    password: "Teste@456",
  },
];

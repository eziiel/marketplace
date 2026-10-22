import { api } from "@/lib/api";
import type { AuthSession, LoginCredentials } from "../types/auth";

export async function login(
  credentials: LoginCredentials,
): Promise<AuthSession> {
  const response = await api.post<AuthSession>("/auth/login", credentials);

  return response.data;
}

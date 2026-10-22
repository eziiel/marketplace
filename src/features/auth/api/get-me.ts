import { api } from "@/lib/api";
import type { User } from "../types/auth";

export interface AuthMeResponse {
  user: User;
  expiresAt: string;
}

export async function getMe(): Promise<AuthMeResponse> {
  const response = await api.get<AuthMeResponse>("/auth/me");

  return response.data;
}


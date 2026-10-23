import { api } from "@/lib/api";
import type { SignupInput, SignupResponse } from "../types/auth";

export async function signup(input: SignupInput): Promise<SignupResponse> {
  const { data } = await api.post<SignupResponse>("/auth/signup", input);

  return data;
}

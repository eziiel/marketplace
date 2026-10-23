import { api } from "@/lib/api";
import type { ProfileResponse } from "../types/profile";

export async function getProfile(): Promise<ProfileResponse> {
  const { data } = await api.get<ProfileResponse>("/profile");

  return data;
}

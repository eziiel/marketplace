import { api } from "@/lib/api";
import type { ProfileResponse, UpdateProfileInput } from "../types/profile";

export async function updateProfile(
  input: UpdateProfileInput,
): Promise<ProfileResponse> {
  const { data } = await api.put<ProfileResponse>("/profile", input);

  return data;
}

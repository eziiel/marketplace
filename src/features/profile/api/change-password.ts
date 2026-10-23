import { api } from "@/lib/api";
import type {
  ChangePasswordInput,
  ChangePasswordResponse,
} from "../types/profile";

export async function changePassword(
  input: ChangePasswordInput,
): Promise<ChangePasswordResponse> {
  const { data } = await api.post<ChangePasswordResponse>(
    "/profile/password",
    input,
  );

  return data;
}

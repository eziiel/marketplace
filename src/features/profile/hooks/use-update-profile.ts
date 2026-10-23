import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateProfile } from "../api/update-profile";
import type { ProfileResponse } from "../types/profile";
import { useSessionToken } from "@/lib/session-token";
import { profileKey } from "./profile-keys";

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const token = useSessionToken();

  return useMutation({
    mutationFn: updateProfile,

    onSuccess: (response: ProfileResponse) => {
      queryClient.setQueryData(profileKey(token), response);
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: profileKey(token) });
    },
  });
}

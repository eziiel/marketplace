import { useMutation, useQueryClient } from "@tanstack/react-query";

import { login } from "../api/login";
import { setAuthToken } from "../lib/auth-token";
import type { AuthMeResponse } from "../api/get-me";

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,

    onSuccess: async (session) => {
      setAuthToken(session.token);

      queryClient.setQueryData<AuthMeResponse>(["auth", "me"], {
        user: session.user,
        expiresAt: session.expiresAt,
      });

      await queryClient.invalidateQueries({
        queryKey: ["cart"],
      });
    },
  });
}
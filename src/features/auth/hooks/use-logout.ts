import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "../api/logout";
import { clearAuthToken } from "../lib/auth-token";

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,

    onSettled: () => {
      clearAuthToken();
      queryClient.clear();
      window.location.assign("/");
    },
  });
}

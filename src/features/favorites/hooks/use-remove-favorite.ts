import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeFavorite } from "../api/remove-favorite";

export function useRemoveFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeFavorite,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
}

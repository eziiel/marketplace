import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addFavorite } from "../api/add-favorite";

export function useAddFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addFavorite,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
}
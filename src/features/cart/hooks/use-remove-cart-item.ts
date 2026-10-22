import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeCartItem } from "../api/remove-cart-item";

export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeCartItem,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["cart"],
      });
    },
  });
}

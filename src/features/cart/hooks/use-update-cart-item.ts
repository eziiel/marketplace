import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCartItem } from "../api/update-cart-item";

export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCartItem,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["cart"],
      });
    },
  });
}

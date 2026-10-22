import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addCartItem } from "../api/add-cart-item";

export function useAddCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addCartItem,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["cart"],
      });
    },
  });
}

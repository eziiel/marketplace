import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createOrder } from "../api/create-order";

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrder,

    onSuccess: async (order) => {
      if (order.status !== "confirmed") {
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["cart"] }),
        queryClient.invalidateQueries({ queryKey: ["nfts"] }),
        queryClient.invalidateQueries({ queryKey: ["nft"] }),
      ]);
    },
  });
}

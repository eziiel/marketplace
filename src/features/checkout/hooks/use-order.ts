import { useQuery } from "@tanstack/react-query";
import { getOrder } from "../api/get-order";

export function useOrder(orderId: string) {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: () => getOrder(orderId),
    retry: false,
    refetchInterval: (query) =>
      query.state.data?.status === "pending" ? 400 : false,
  });
}

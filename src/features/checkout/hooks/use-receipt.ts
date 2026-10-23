import { useQuery } from "@tanstack/react-query";
import { getReceipt } from "../api/get-receipt";

export function useReceipt(orderId: string, options: { enabled: boolean }) {
  return useQuery({
    queryKey: ["receipt", orderId],
    queryFn: () => getReceipt(orderId),
    enabled: options.enabled,
    retry: false,
  });
}

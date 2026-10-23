import { useQuery } from "@tanstack/react-query";
import { getCart } from "../api/get-cart";

export function useCartCount(): number {
  const query = useQuery({
    queryKey: ["cart"],
    queryFn: getCart,
  });

  return (
    query.data?.items.reduce((total, item) => total + item.quantity, 0) ?? 0
  );
}

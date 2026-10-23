import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useRemoveCartItem } from "../hooks/use-remove-cart-item";

import { getCart } from "../api/get-cart";
import { useUpdateCartItem } from "../hooks/use-update-cart-item";
export function CartPage() {
  const {
    data: cart,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["cart"],
    queryFn: getCart,
  });
  const removeMutation = useRemoveCartItem();
  const updateMutation = useUpdateCartItem();
  if (isPending) {
    return <p>Carregando carrinho...</p>;
  }

  if (isError) {
    return <p>Erro ao carregar carrinho: {error.message}</p>;
  }

  if (cart.items.length === 0) {
    return <p>Seu carrinho está vazio.</p>;
  }

  return (
    <main>
      <h1>Meu carrinho</h1>

      {cart.items.map((item) => (
        <div key={`${item.nftId}-${item.edition}`}>
          <p>
            NFT: {item.nftId} — Edição: {item.edition}
          </p>

          <button
            type="button"
            disabled={updateMutation.isPending || item.quantity <= 1}
            onClick={() =>
              updateMutation.mutate({
                ...item,
                quantity: item.quantity - 1,
              })
            }
          >
            −
          </button>

          <span> {item.quantity} </span>

          <button
            type="button"
            disabled={updateMutation.isPending}
            onClick={() =>
              updateMutation.mutate({
                ...item,
                quantity: item.quantity + 1,
              })
            }
          >
            +
          </button>
          <button
            type="button"
            disabled={removeMutation.isPending}
            onClick={() =>
              removeMutation.mutate({
                nftId: item.nftId,
                edition: item.edition,
              })
            }
          >
            Remover
          </button>
        </div>
      ))}

      {updateMutation.isError && (
        <p role="alert">
          Não foi possível atualizar a quantidade:{" "}
          {updateMutation.error.message}
        </p>
      )}
      {removeMutation.isError && (
        <p role="alert">
          Não foi possível remover o item: {removeMutation.error.message}
        </p>
      )}

      <Link to="/checkout">Finalizar compra</Link>
    </main>
  );
}

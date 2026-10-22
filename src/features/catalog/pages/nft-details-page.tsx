import { useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Link } from "@tanstack/react-router";
import { useAddCartItem } from "@/features/cart/hooks/use-add-cart-item";
import { getNftById } from "../api/get-nft-by-id";

export function NftDetailsPage() {
  const { id } = useParams({ from: "/nfts/$id" });

  const {
    data: nft,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["nft", id],
    queryFn: () => getNftById(id),
  });
  const addCartMutation = useAddCartItem();

  if (isPending) {
    return <p>Carregando NFT...</p>;
  }

  if (isError) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return <p>NFT não encontrado.</p>;
    }

    return <p>Erro ao carregar NFT: {error.message}</p>;
  }

  return (
    <main>
      <h1>{nft.name}</h1>
      <p>
        Preço: {nft.price} {nft.currency}
      </p>
      <p>Edição: {nft.edition}</p>
      <p>Disponíveis: {nft.available}</p>
      <button
        type="button"
        disabled={addCartMutation.isPending || nft.available === 0}
        onClick={() => {
          addCartMutation.mutate({
            nftId: nft.id,
            edition: nft.edition,
            quantity: 1,
          });
        }}
      >
        {addCartMutation.isPending ? "Adicionando..." : "Adicionar ao carrinho"}
      </button>

      {addCartMutation.isSuccess && <p>Item adicionado ao carrinho!</p>}

      {addCartMutation.isError && (
        <p role="alert">
          Não foi possível adicionar: {addCartMutation.error.message}
        </p>
      )}

      <Link to="/cart">Ver carrinho</Link>
    </main>
  );
}

import { useQuery } from "@tanstack/react-query";
import { getNfts } from "../api/get-nfts";

export function CatalogPage() {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["nfts"],
    queryFn: getNfts,
  });

  if (isPending) {
    return <p>Carregando NFTs...</p>;
  }

  if (isError) {
    return <p>Erro ao carregar NFTs: {error.message}</p>;
  }

  return (
    <div>
      <h1>Catálogo de NFTs</h1>

      {data.map((nft) => (
        <p key={nft.id}>
          {nft.name} — {nft.price} {nft.currency}
        </p>
      ))}
    </div>
  );
}

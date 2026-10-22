import { useQuery } from "@tanstack/react-query";
import { getNfts } from "../api/get-nfts";
import { useSearch } from "@tanstack/react-router";
import { CatalogSearch } from "../components/catalog-search";
import { CatalogSort } from "../components/catalog-sort";
import { CatalogPagination } from "../components/catalog-pagination";

export function CatalogPage() {
  const params = useSearch({ from: "/" });
  console.log("Parâmetros da URL:", params);

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["nfts", params],
    queryFn: () => getNfts(params),
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

      <CatalogSearch />
      <CatalogSort />

      {data.items.map((nft) => (
        <p key={nft.id}>
          {nft.name} — {nft.price} {nft.currency}
        </p>
      ))}

      <p>
        <CatalogPagination totalPages={data.totalPages} />
      </p>
    </div>
  );
}

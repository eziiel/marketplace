import { useParams } from "@tanstack/react-router";

export function NftDetailsPage() {
  const { id } = useParams({ from: "/nfts/$id" });

  return <h1>Detalhes do NFT: {id}</h1>;
}
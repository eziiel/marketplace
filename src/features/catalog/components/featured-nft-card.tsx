import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import type { NFT } from "../types/nft";

interface FeaturedNftCardProps {
  nft: NFT;
  imageUrl: string;
  className?: string;
}

export function FeaturedNftCard({
  nft,
  imageUrl,
  className,
}: FeaturedNftCardProps) {
  return (
    <Link
      to="/nfts/$id"
      params={{ id: nft.id }}
      aria-label="NFT em destaque: oferta limitada"
      className={cn(
        "group block overflow-hidden rounded-2xl bg-sidebar focus-visible:outline-2 focus-visible:outline-primary",
        className,
      )}
    >
      <div className="bg-primary px-5 py-4">
        <p className="text-lg font-bold tracking-wide text-primary-foreground/60 uppercase">
          NFT em destaque
        </p>
        <p className="mt-1 text-right text-lg font-bold tracking-wide text-white uppercase">
          Oferta limitada
        </p>
      </div>
      <div className="aspect-[4/5] overflow-hidden">
        <img
          src={imageUrl}
          alt=""
          loading="lazy"
          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
    </Link>
  );
}

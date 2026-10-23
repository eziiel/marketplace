import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NFT } from "@/features/catalog/types/nft";
import { nftImage } from "../lib/nft-image";

export interface NftCardProps {
  nft: NFT;
  onFavorite?: (nft: NFT) => void;
  isFavorite?: boolean;
  isFavoritePending?: boolean;
  className?: string;
}

export function NftCard({
  nft,
  onFavorite,
  isFavorite = false,
  isFavoritePending = false,
  className,
}: NftCardProps) {
  const soldOut = nft.available <= 0;
  const image = nft.image || nftImage(nft.id);

  return (
    <article className={cn("group relative", className)}>
      <Link
        to="/nfts/$id"
        params={{ id: nft.id }}
        className="block rounded-[4px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-highlight"
      >
        <div className="rounded-[4px] bg-card px-1 pt-7 pb-5">
          <div className="relative aspect-square overflow-hidden rounded-[20px] bg-secondary">
            <img
              src={image}
              alt={nft.name}
              loading="lazy"
              width={250}
              height={250}
              className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
            />

            {soldOut && (
              <div className="absolute inset-0 grid place-items-center bg-background/60">
                <span className="rounded-[4px] bg-background/85 px-3 py-1 text-xs font-semibold text-foreground">
                  Esgotado
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 space-y-1.5 px-0.5">
          <h3 className="m-0 truncate text-sm font-normal text-foreground">
            {nft.name}
          </h3>
          <p className="flex flex-wrap items-baseline gap-x-2 text-base font-bold text-highlight">
            <span>
              {nft.price} {nft.currency}
            </span>
            {nft.oldPrice && (
              <span className="text-sm font-normal text-muted-foreground/80 line-through">
                <span className="sr-only">Preço anterior </span>
                {nft.oldPrice} {nft.currency}
              </span>
            )}
          </p>
        </div>
      </Link>

      {nft.rarity && (
        <span className="pointer-events-none absolute top-2 left-0 bg-primary px-3 py-1 text-[11px] font-bold tracking-wide text-primary-foreground uppercase">
          {nft.rarity}
        </span>
      )}

      {onFavorite && (
        <button
          type="button"
          onClick={() => onFavorite(nft)}
          disabled={isFavoritePending}
          aria-label={
            isFavorite
              ? `Remover ${nft.name} dos favoritos`
              : `Favoritar ${nft.name}`
          }
          aria-pressed={isFavorite}
          className={cn(
            "absolute top-10 right-4 grid size-9 cursor-pointer place-items-center rounded-full bg-background/85 text-foreground backdrop-blur transition-opacity hover:bg-background focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-highlight disabled:cursor-not-allowed disabled:opacity-50",
            "md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100",
            isFavorite && "md:opacity-100",
          )}
        >
          <Heart
            className={cn("size-4", isFavorite && "fill-highlight text-highlight")}
            aria-hidden
          />
        </button>
      )}
    </article>
  );
}

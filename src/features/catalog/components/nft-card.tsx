import { Link } from "@tanstack/react-router";
import { Heart, ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NFT } from "@/features/catalog/types/nft";

export interface NftCardProps {
  nft: NFT;
  imageUrl?: string;
  rarity?: string;
  collection?: string;
  onFavorite?: (nft: NFT) => void;
  isFavorite?: boolean;
  isFavoritePending?: boolean;
  className?: string;
}

export function NftCard({
  nft,
  imageUrl,
  rarity,
  collection,
  onFavorite,
  isFavorite = false,
  isFavoritePending = false,
  className,
}: NftCardProps) {
  const soldOut = nft.available <= 0;
  const collectionLabel = collection ?? nft.edition;

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/50",
        className,
      )}
    >
      <Link
        to="/nfts/$id"
        params={{ id: nft.id }}
        className="block focus-visible:outline-none"
      >
        <div className="relative aspect-square overflow-hidden bg-secondary">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={nft.name}
              loading="lazy"
              className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div
              role="img"
              aria-label={nft.name}
              className="grid size-full place-items-center bg-linear-to-br from-secondary to-card"
            >
              <ImageOff
                className="size-8 text-muted-foreground/40"
                aria-hidden
              />
            </div>
          )}

          {soldOut && (
            <div className="absolute inset-0 grid place-items-center bg-background/60">
              <span className="rounded-full bg-background/80 px-3 py-1 text-xs font-semibold text-foreground">
                Esgotado
              </span>
            </div>
          )}
        </div>

        <div className="space-y-1 p-3">
          {collectionLabel && (
            <p className="truncate text-[11px] tracking-wide text-muted-foreground uppercase">
              {collectionLabel}
            </p>
          )}

          <h3 className="truncate text-sm font-semibold text-foreground">
            {nft.name}
          </h3>

          <div className="flex items-baseline justify-between gap-2 pt-0.5">
            <p className="text-sm font-bold text-primary">
              {nft.price} {nft.currency}
            </p>
            <p className="shrink-0 text-[11px] text-muted-foreground">
              {soldOut ? "Esgotado" : `${nft.available} disp.`}
            </p>
          </div>
        </div>
      </Link>

      {rarity && (
        <span className="pointer-events-none absolute top-2.5 left-2.5 rounded-full border border-primary/50 bg-background/80 px-2 py-0.5 text-[10px] font-bold tracking-wide text-primary uppercase backdrop-blur">
          {rarity}
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
          className="absolute top-2.5 right-2.5 grid size-8 cursor-pointer place-items-center rounded-full bg-background/80 text-foreground backdrop-blur transition-colors hover:bg-background focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Heart
            className={cn("size-4", isFavorite && "fill-primary text-primary")}
            aria-hidden
          />
        </button>
      )}
    </article>
  );
}

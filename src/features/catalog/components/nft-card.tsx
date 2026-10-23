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
  onQuickView?: (nft: NFT) => void;
  className?: string;
}
export interface NftCardProps {
  nft: NFT;
  imageUrl?: string;
  rarity?: string;
  collection?: string;
  onFavorite?: (nft: NFT) => void;
  onQuickView?: (nft: NFT) => void;
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
        "group relative overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary/40",
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

        <div className="space-y-1 p-4">
          {collectionLabel && (
            <p className="truncate text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              {collectionLabel}
            </p>
          )}

          <h3 className="truncate text-base font-semibold text-foreground">
            {nft.name}
          </h3>

          <div className="flex items-baseline justify-between gap-2 pt-1">
            <p className="text-base font-semibold text-primary">
              {nft.price} {nft.currency}
            </p>
            <p className="shrink-0 text-xs text-muted-foreground">
              {soldOut
                ? "Esgotado"
                : `${nft.available} ${
                    nft.available === 1 ? "disponível" : "disponíveis"
                  }`}
            </p>
          </div>
        </div>
      </Link>

      {rarity && (
        <span className="pointer-events-none absolute top-3 left-3 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-primary-foreground uppercase">
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
          className="grid size-8 cursor-pointer place-items-center rounded-full bg-background/80 text-foreground backdrop-blur transition-colors hover:bg-background focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50"
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

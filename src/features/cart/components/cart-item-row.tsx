import { Trash2 } from "lucide-react";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { nftImage } from "@/features/catalog/lib/nft-image";
import { multiply } from "@/lib/money";
import type { CartItem } from "../types/cart";
import type { NFT } from "@/features/catalog/types/nft";

export interface CartItemRowProps {
  item: CartItem;
  nft?: NFT;
  isUpdating: boolean;
  isRemoving: boolean;
  onDecrement: () => void;
  onIncrement: () => void;
  onRemove: () => void;
}

export function CartItemRow({
  item,
  nft,
  isUpdating,
  isRemoving,
  onDecrement,
  onIncrement,
  onRemove,
}: CartItemRowProps) {
  const name = nft?.name ?? `NFT ${item.nftId}`;
  const currency = nft?.currency ?? "ETH";
  const atStockLimit = nft ? item.quantity >= nft.available : false;

  return (
    <li className="flex gap-4 rounded-2xl border border-border bg-card p-4">
      <div className="size-20 shrink-0 overflow-hidden rounded-xl bg-secondary">
        <img
          src={nftImage(item.nftId)}
          alt={name}
          className="size-full object-cover"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-foreground">
              {name}
            </h3>
            <p className="truncate text-xs text-muted-foreground">
              NFT: {item.nftId} — Edição: {item.edition}
            </p>
          </div>

          <button
            type="button"
            onClick={onRemove}
            disabled={isRemoving}
            aria-label={`Remover ${name}`}
            className="grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40"
          >
            <Trash2 className="size-4" aria-hidden />
          </button>
        </div>

        <div className="flex items-center justify-between gap-3">
          <QuantityStepper
            value={item.quantity}
            onDecrement={onDecrement}
            onIncrement={onIncrement}
            disableDecrement={isUpdating || item.quantity <= 1}
            disableIncrement={isUpdating || atStockLimit}
            label={`Quantidade de ${name}`}
          />
          <p className="shrink-0 text-base font-semibold text-primary">
            {nft ? `${multiply(nft.price, item.quantity)} ${currency}` : "—"}
          </p>
        </div>
      </div>
    </li>
  );
}

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

export const cartColumns =
  "md:grid-cols-[minmax(0,1fr)_110px_110px_120px_40px]";

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
    <li
      className={`grid grid-cols-[minmax(0,1fr)_48px] items-center gap-x-3 rounded-[4px] bg-card pr-2 md:min-h-[66px] ${cartColumns}`}
    >
      <div className="flex min-w-0 items-center gap-3 self-stretch">
        <img
          src={nft?.image || nftImage(item.nftId)}
          alt=""
          width={70}
          height={66}
          className="h-full min-h-[66px] w-[70px] shrink-0 rounded-l-[4px] object-cover"
        />
        <div className="min-w-0 py-2">
          <h3 className="m-0 truncate text-[15px] font-bold text-foreground">
            {name}
          </h3>
          <p className="truncate text-xs text-muted-foreground">
            ID do token: {nft?.tokenId ?? item.nftId}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onRemove}
        disabled={isRemoving}
        aria-label={`Remover ${name}`}
        className="grid size-9 place-items-center justify-self-end rounded-full text-foreground transition-colors hover:bg-secondary hover:text-destructive focus-visible:outline-2 focus-visible:outline-highlight disabled:pointer-events-none disabled:opacity-40 md:order-last"
      >
        <Trash2 className="size-5" strokeWidth={1.5} aria-hidden />
      </button>

      <div className="col-span-2 flex flex-wrap items-center justify-between gap-3 px-4 pb-3 md:contents">
        <p className="text-[15px] font-bold whitespace-nowrap text-highlight">
          <span className="sr-only">Preço unitário: </span>
          {nft ? `${nft.price} ${currency}` : "—"}
        </p>

        <QuantityStepper
          size="sm"
          value={item.quantity}
          onDecrement={onDecrement}
          onIncrement={onIncrement}
          disableDecrement={isUpdating || item.quantity <= 1}
          disableIncrement={isUpdating || atStockLimit}
          label={`Quantidade de ${name}`}
        />

        <p className="text-[15px] font-bold whitespace-nowrap text-highlight">
          <span className="sr-only">Total: </span>
          {nft ? `${multiply(nft.price, item.quantity)} ${currency}` : "—"}
        </p>
      </div>
    </li>
  );
}

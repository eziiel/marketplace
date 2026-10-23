import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button-variants";

export interface Collection {
  edition: string;
  count: number;
}

interface CatalogSidebarProps {
  collections: Collection[];
  activeCollection: string;
  onSelectCollection: (edition: string) => void;
  priceMin: number;
  priceMax: number;
  priceValue: number;
  onPriceInput: (value: number) => void;
  onApplyPrice: () => void;
  className?: string;
}

function formatEth(value: number): string {
  return Number.isFinite(value) ? value.toFixed(2) : "0.00";
}

export function CatalogSidebar({
  collections,
  activeCollection,
  onSelectCollection,
  priceMin,
  priceMax,
  priceValue,
  onPriceInput,
  onApplyPrice,
  className,
}: CatalogSidebarProps) {
  const hasRange = priceMax > priceMin;

  return (
    <aside className={cn("space-y-6", className)}>
      <section className="rounded-2xl border border-border bg-sidebar p-5">
        <h2 className="m-0 text-sm font-semibold tracking-wide text-foreground uppercase">
          Coleções
        </h2>
        <ul className="mt-3 space-y-1">
          {collections.map((collection) => {
            const active = collection.edition === activeCollection;
            return (
              <li key={collection.edition}>
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => onSelectCollection(collection.edition)}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <span className="truncate">{collection.edition}</span>
                  <span
                    className={cn(
                      "shrink-0 text-xs",
                      active ? "text-primary" : "text-muted-foreground/70",
                    )}
                  >
                    ({collection.count})
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="rounded-2xl border border-border bg-sidebar p-5">
        <h2 className="m-0 text-sm font-semibold tracking-wide text-foreground uppercase">
          Faixa de preço
        </h2>

        <input
          type="range"
          min={priceMin}
          max={priceMax}
          step={0.01}
          value={priceValue}
          disabled={!hasRange}
          aria-label="Preço máximo"
          onChange={(event) => onPriceInput(Number(event.target.value))}
          className="mt-4 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary disabled:cursor-not-allowed disabled:opacity-60"
        />

        <p className="mt-3 text-xs text-muted-foreground">
          Preço:{" "}
          <span className="text-foreground">
            {formatEth(priceMin)} – {formatEth(priceValue)} ETH
          </span>
        </p>

        <button
          type="button"
          onClick={onApplyPrice}
          className={cn(
            buttonVariants({ size: "lg" }),
            "mt-4 h-9 w-full text-sm",
          )}
        >
          Aplicar
        </button>
      </section>
    </aside>
  );
}

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button-variants";
import type { NftFacetOption, NftFacets, NftNetwork } from "../types/nft";
import { formatEth } from "../lib/price";
import { PriceRange, type PriceRangeValue } from "./price-range";

export interface CatalogSidebarProps {
  facets?: NftFacets;
  activeCollection?: string;
  activeNetwork?: NftNetwork;
  priceBounds: PriceRangeValue;
  priceValue: PriceRangeValue;
  onPriceChange: (value: PriceRangeValue) => void;
  onApplyPrice: () => void;
  onSelectCollection: (value: string) => void;
  onSelectNetwork: (value: NftNetwork) => void;
  className?: string;
}

interface FacetListProps {
  options: NftFacetOption[];
  activeValue?: string;
  onSelect: (value: string) => void;
  strongCount?: boolean;
}

function FacetList({
  options,
  activeValue,
  onSelect,
  strongCount = false,
}: FacetListProps) {
  return (
    <ul className="mt-3 space-y-0.5">
      {options.map((option) => {
        const active = option.value === activeValue;

        return (
          <li key={option.value}>
            <button
              type="button"
              aria-pressed={active}
              onClick={() => onSelect(option.value)}
              className={cn(
                "flex w-full items-center justify-between gap-3 rounded-[4px] px-3 py-2 text-sm text-highlight transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-highlight",
                active && "bg-primary/15",
              )}
            >
              <span className="truncate">{option.label}</span>
              <span
                className={cn(
                  "shrink-0 tabular-nums",
                  strongCount ? "font-bold" : "text-muted-foreground",
                )}
              >
                ({option.count})
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function FacetSkeleton({ rows }: { rows: number }) {
  return (
    <ul aria-hidden className="mt-3 space-y-2">
      {Array.from({ length: rows }).map((_, index) => (
        <li key={index} className="h-7 animate-pulse rounded-[4px] bg-muted" />
      ))}
    </ul>
  );
}

export function CatalogSidebar({
  facets,
  activeCollection,
  activeNetwork,
  priceBounds,
  priceValue,
  onPriceChange,
  onApplyPrice,
  onSelectCollection,
  onSelectNetwork,
  className,
}: CatalogSidebarProps) {
  const hasRange = priceBounds.max > priceBounds.min;

  return (
    <aside
      aria-label="Filtros do catálogo"
      className={cn("rounded-[4px] bg-sidebar px-5 py-6", className)}
    >
      <section aria-labelledby="facet-collections">
        <h2
          id="facet-collections"
          className="m-0 text-base font-bold text-foreground"
        >
          Coleções
        </h2>
        {facets ? (
          <FacetList
            options={facets.collections}
            activeValue={activeCollection}
            onSelect={onSelectCollection}
            strongCount
          />
        ) : (
          <FacetSkeleton rows={6} />
        )}
      </section>

      <section aria-labelledby="facet-price" className="mt-8">
        <h2 id="facet-price" className="m-0 text-base font-bold text-foreground">
          Faixa de preço
        </h2>
        <div className="mt-3 px-1">
          <PriceRange
            bounds={priceBounds}
            value={priceValue}
            onChange={onPriceChange}
            disabled={!hasRange}
          />
        </div>
        <p className="mt-2 px-3 text-sm text-foreground">
          Preço: {formatEth(priceValue.min)} - {formatEth(priceValue.max)} ETH
        </p>
        <button
          type="button"
          onClick={onApplyPrice}
          disabled={!hasRange}
          className={cn(
            buttonVariants({ size: "lg" }),
            "mt-3 ml-3 h-9 rounded-[4px] px-4 text-sm font-semibold",
          )}
        >
          Aplicar
        </button>
      </section>

      <section aria-labelledby="facet-network" className="mt-8">
        <h2
          id="facet-network"
          className="m-0 text-base font-bold text-foreground"
        >
          Rede
        </h2>
        {facets ? (
          <FacetList
            options={facets.networks}
            activeValue={activeNetwork}
            onSelect={(value) => onSelectNetwork(value as NftNetwork)}
          />
        ) : (
          <FacetSkeleton rows={3} />
        )}
      </section>
    </aside>
  );
}

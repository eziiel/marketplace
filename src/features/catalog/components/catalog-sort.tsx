import { useNavigate, useSearch } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import type { NftListParams } from "../types/nft";

type SortOption = NonNullable<NftListParams["sort"]>;

export function CatalogSort() {
  const navigate = useNavigate({ from: "/" });
  const { sort } = useSearch({ from: "/" });

  function handleSortChange(value: SortOption) {
    void navigate({
      search: (previous) => ({
        ...previous,
        sort: value,
        page: 1,
      }),
    });
  }

  return (
    <label className="flex shrink-0 items-center gap-2 text-sm text-muted-foreground">
      <span className="hidden sm:inline">Ordenar por</span>
      <span className="relative">
        <select
          value={sort ?? "price_asc"}
          onChange={(event) => handleSortChange(event.target.value as SortOption)}
          className="h-11 appearance-none rounded-full border border-border bg-card pr-9 pl-4 text-sm text-foreground transition-colors focus:border-primary focus:outline-none"
        >
          <option value="price_asc">Menor preço</option>
          <option value="price_desc">Maior preço</option>
        </select>
        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
      </span>
    </label>
  );
}

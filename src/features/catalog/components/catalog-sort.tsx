import { useNavigate, useSearch } from "@tanstack/react-router";

import { SelectField } from "@/components/ui/select-field";
import type { NftSort } from "../types/nft";

const SORT_OPTIONS: { value: NftSort; label: string }[] = [
  { value: "recent", label: "Listados recentemente" },
  { value: "price_asc", label: "Menor preço" },
  { value: "price_desc", label: "Maior preço" },
];

export function CatalogSort() {
  const navigate = useNavigate({ from: "/" });
  const { sort } = useSearch({ from: "/" });

  function handleSortChange(value: NftSort) {
    void navigate({
      search: (previous) => ({
        ...previous,
        sort: value,
        page: 1,
      }),
    });
  }

  return (
    <div className="flex min-w-0 items-center gap-1 text-sm text-foreground">
      <span aria-hidden className="shrink-0">Ordenar por:</span>
      <SelectField
        id="catalog-sort"
        name="sort"
        label="Ordenar por"
        value={sort ?? "recent"}
        options={SORT_OPTIONS}
        onValueChange={(value) => handleSortChange(value as NftSort)}
        className="h-8 w-auto min-w-0 cursor-pointer border-0 px-0 focus-visible:outline-2 focus-visible:outline-highlight"
      />
    </div>
  );
}

import { useNavigate, useSearch } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
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
    <label className="flex shrink-0 items-center gap-1 text-sm text-foreground">
      <span>Ordenar por:</span>
      <span className="relative">
        <select
          value={sort ?? "recent"}
          onChange={(event) => handleSortChange(event.target.value as NftSort)}
          className="h-8 cursor-pointer appearance-none bg-transparent pr-6 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-highlight"
        >
          {SORT_OPTIONS.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="bg-card text-foreground"
            >
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-0 size-4 -translate-y-1/2 text-foreground"
        />
      </span>
    </label>
  );
}

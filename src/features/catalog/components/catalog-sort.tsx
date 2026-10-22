import { useNavigate, useSearch } from "@tanstack/react-router";
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
    <label>
      Ordenar por:
      <select
        value={sort ?? "price_asc"}
        onChange={(event) => handleSortChange(event.target.value as SortOption)}
      >
        <option value="price_asc">Menor preço</option>
        <option value="price_desc">Maior preço</option>
      </select>
    </label>
  );
}

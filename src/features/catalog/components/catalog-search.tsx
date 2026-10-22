import { useState, type FormEvent } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";

export function CatalogSearch() {
  const navigate = useNavigate({ from: "/" });
  const searchParams = useSearch({ from: "/" });

  const [search, setSearch] = useState(searchParams.search ?? "");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    void navigate({
      search: (previous) => ({
        ...previous,
        search: search.trim(),
        page: 1,
      }),
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Buscar NFTs..."
      />

      <button type="submit">Buscar</button>
    </form>
  );
}

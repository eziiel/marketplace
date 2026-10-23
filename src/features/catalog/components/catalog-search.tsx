import { useState, type FormEvent } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button-variants";

export function CatalogSearch({ className }: { className?: string }) {
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
    <form
      onSubmit={handleSubmit}
      role="search"
      className={cn("relative w-full", className)}
    >
      <Search
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <input
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Buscar NFTs..."
        aria-label="Buscar NFTs"
        className="h-11 w-full rounded-full border border-border bg-card pr-24 pl-11 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none"
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "default" }),
          "absolute top-1/2 right-1.5 -translate-y-1/2 rounded-full px-4",
        )}
      >
        Buscar
      </button>
    </form>
  );
}

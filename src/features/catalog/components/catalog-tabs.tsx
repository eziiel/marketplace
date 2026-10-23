import { Link, useSearch } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import type { NftTab } from "../types/nft";

const TABS: { value: NftTab; label: string }[] = [
  { value: "all", label: "Todos os NFTs" },
  { value: "new", label: "Novos lançamentos" },
  { value: "trending", label: "Em alta" },
];

export function CatalogTabs() {
  const { tab } = useSearch({ from: "/" });
  const current = tab ?? "all";

  return (
    <nav aria-label="Filtro rápido">
      <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
        {TABS.map((item) => {
          const active = item.value === current;

          return (
            <li key={item.value}>
              <Link
                to="/"
                search={(previous) => ({
                  ...previous,
                  tab: item.value === "all" ? undefined : item.value,
                  page: 1,
                })}
                hash="catalogo"
                aria-current={active ? "true" : undefined}
                className={cn(
                  "relative block py-1 font-medium transition-colors",
                  active
                    ? "text-highlight"
                    : "text-foreground hover:text-highlight",
                )}
              >
                {item.label}
                {active && (
                  <span
                    aria-hidden
                    className="absolute -bottom-0.5 left-0 h-0.5 w-full bg-highlight"
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

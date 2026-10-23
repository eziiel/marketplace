import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CatalogPaginationProps {
  page: number;
  totalPages: number;
}

type PageItem = number | "ellipsis-start" | "ellipsis-end";

function pageItems(page: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items: PageItem[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);

  if (start > 2) items.push("ellipsis-start");

  for (let current = start; current <= end; current += 1) {
    items.push(current);
  }

  if (end < totalPages - 1) items.push("ellipsis-end");

  items.push(totalPages);

  return items;
}

const boxClass =
  "grid size-9 place-items-center rounded-[4px] border text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-highlight disabled:pointer-events-none disabled:opacity-40";

export function CatalogPagination({ page, totalPages }: CatalogPaginationProps) {
  const navigate = useNavigate({ from: "/" });

  if (totalPages <= 1) {
    return null;
  }

  function changePage(nextPage: number) {
    void navigate({
      search: (previous) => ({
        ...previous,
        page: nextPage,
      }),
      hash: "catalogo",
    });
  }

  return (
    <nav
      aria-label="Paginação do catálogo"
      className="flex flex-wrap items-center justify-end gap-2"
    >
      {page > 1 && (
        <button
          type="button"
          onClick={() => changePage(page - 1)}
          aria-label="Página anterior"
          className={cn(boxClass, "border-border text-foreground hover:border-highlight")}
        >
          <ChevronLeft className="size-4" aria-hidden />
        </button>
      )}

      {pageItems(page, totalPages).map((item) =>
        typeof item === "number" ? (
          <button
            key={item}
            type="button"
            onClick={() => changePage(item)}
            aria-label={`Página ${item}`}
            aria-current={item === page ? "page" : undefined}
            className={cn(
              boxClass,
              item === page
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-foreground hover:border-highlight",
            )}
          >
            {item}
          </button>
        ) : (
          <span
            key={item}
            aria-hidden
            className="grid size-9 place-items-center text-sm text-muted-foreground"
          >
            …
          </span>
        ),
      )}

      {page < totalPages && (
        <button
          type="button"
          onClick={() => changePage(page + 1)}
          aria-label="Próxima página"
          className={cn(boxClass, "border-border text-foreground hover:border-highlight")}
        >
          <ChevronRight className="size-4" aria-hidden />
        </button>
      )}
    </nav>
  );
}

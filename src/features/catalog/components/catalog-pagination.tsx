import { useNavigate, useSearch } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface CatalogPaginationProps {
  totalPages: number;
}

export function CatalogPagination({ totalPages }: CatalogPaginationProps) {
  const navigate = useNavigate({ from: "/" });
  const { page } = useSearch({ from: "/" });

  function changePage(nextPage: number) {
    void navigate({
      search: (previous) => ({
        ...previous,
        page: nextPage,
      }),
    });
  }

  return (
    <nav
      aria-label="Paginação do catálogo"
      className="flex items-center justify-center gap-3"
    >
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => changePage(page - 1)}
        className={cn(buttonVariants({ variant: "outline", size: "lg" }), "gap-1")}
      >
        <ChevronLeft aria-hidden />
        <span>Anterior</span>
      </button>

      <span className="text-sm text-muted-foreground" aria-live="polite">
        Página {page} de {totalPages}
      </span>

      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => changePage(page + 1)}
        className={cn(buttonVariants({ variant: "outline", size: "lg" }), "gap-1")}
      >
        <span>Próxima</span>
        <ChevronRight aria-hidden />
      </button>
    </nav>
  );
}

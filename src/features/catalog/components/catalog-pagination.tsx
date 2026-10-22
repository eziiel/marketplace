import { useNavigate, useSearch } from "@tanstack/react-router";

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
    <nav aria-label="Paginação do catálogo">
      <button disabled={page <= 1} onClick={() => changePage(page - 1)}>
        Anterior
      </button>

      <span>
        Página {page} de {totalPages}
      </span>

      <button
        disabled={page >= totalPages}
        onClick={() => changePage(page + 1)}
      >
        Próxima
      </button>
    </nav>
  );
}

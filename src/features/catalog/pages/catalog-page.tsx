import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { TriangleAlert, SearchX } from "lucide-react";

import { getNfts } from "../api/get-nfts";
import { CatalogSearch } from "../components/catalog-search";
import { CatalogSort } from "../components/catalog-sort";
import { CatalogPagination } from "../components/catalog-pagination";
import { NftCard } from "../components/nft-card";

import { Container } from "@/components/layout/container";
import { SiteHeader } from "@/components/layout/site-header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { getAuthToken } from "@/features/auth/lib/auth-token";
import { useAuthMe } from "@/features/auth/hooks/use-auth-me";
import { useLogout } from "@/features/auth/hooks/use-logout";

function CatalogSkeleton() {
  return (
    <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <li
          key={index}
          className="overflow-hidden rounded-2xl border border-border bg-card"
        >
          <div className="aspect-square animate-pulse bg-secondary" />
          <div className="space-y-2 p-4">
            <div className="h-3 w-1/3 animate-pulse rounded bg-secondary" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-secondary" />
            <div className="h-4 w-1/4 animate-pulse rounded bg-secondary" />
          </div>
        </li>
      ))}
    </ul>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card px-6 py-16 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-destructive/10 text-destructive">
        <TriangleAlert aria-hidden />
      </span>
      <div className="space-y-1">
        <p className="font-semibold text-foreground">
          Não foi possível carregar os NFTs
        </p>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className={cn(buttonVariants({ size: "lg" }), "px-5")}
      >
        Tentar novamente
      </button>
    </div>
  );
}

function EmptyState({
  hasSearch,
  onClear,
}: {
  hasSearch: boolean;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card px-6 py-16 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-secondary text-muted-foreground">
        <SearchX aria-hidden />
      </span>
      <div className="space-y-1">
        <p className="font-semibold text-foreground">Nenhum NFT encontrado</p>
        <p className="text-sm text-muted-foreground">
          {hasSearch
            ? "Tente ajustar sua busca ou limpar os filtros."
            : "Ainda não há NFTs disponíveis."}
        </p>
      </div>
      {hasSearch && (
        <button
          type="button"
          onClick={onClear}
          className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
        >
          Limpar busca
        </button>
      )}
    </div>
  );
}

export function CatalogPage() {
  const params = useSearch({ from: "/" });
  const navigate = useNavigate({ from: "/" });

  const isAuthenticated = Boolean(getAuthToken());
  const authMe = useAuthMe();
  const logoutMutation = useLogout();

  const { data, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["nfts", params],
    queryFn: () => getNfts(params),
  });

  function clearSearch() {
    void navigate({
      search: (previous) => ({
        ...previous,
        search: "",
        page: 1,
      }),
    });
  }

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader
        isAuthenticated={isAuthenticated}
        userName={authMe.data?.user.name}
        onLogout={() => logoutMutation.mutate()}
      />

      <main className="flex-1 pb-24 md:pb-12">
        <Container className="space-y-8 py-6 md:space-y-10 md:py-10">
          <section className="overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card via-card to-background p-6 md:p-12">
            <p className="text-sm font-medium text-primary">
              Bem-vindo à Kurio
            </p>
            <h1 className="m-0 mt-2 max-w-xl text-3xl font-bold tracking-tight text-foreground md:text-5xl">
              Seja dono da cultura digital
            </h1>
            <p className="mt-3 max-w-md text-sm text-muted-foreground md:text-base">
              Descubra NFTs selecionados de criadores do mundo todo.
            </p>
            <a
              href="#catalogo"
              className={cn(buttonVariants({ size: "lg" }), "mt-6 px-6")}
            >
              Explorar
            </a>
          </section>

          <section id="catalogo" className="scroll-mt-20 space-y-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="m-0 text-xl font-semibold text-foreground md:text-2xl">
                  Catálogo de NFTs
                </h2>
                {!isPending && !isError && (
                  <p className="shrink-0 text-sm text-muted-foreground">
                    {data.total} {data.total === 1 ? "item" : "itens"}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <CatalogSearch className="sm:max-w-md" />
                <div className="sm:ml-auto">
                  <CatalogSort />
                </div>
              </div>
            </div>

            {isPending ? (
              <CatalogSkeleton />
            ) : isError ? (
              <ErrorState
                message={error.message}
                onRetry={() => void refetch()}
              />
            ) : data.items.length === 0 ? (
              <EmptyState
                hasSearch={Boolean(params.search)}
                onClear={clearSearch}
              />
            ) : (
              <>
                <ul
                  aria-busy={isFetching}
                  className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4"
                >
                  {data.items.map((nft) => (
                    <li key={nft.id}>
                      <NftCard nft={nft} />
                    </li>
                  ))}
                </ul>

                <CatalogPagination totalPages={data.totalPages} />
              </>
            )}
          </section>
        </Container>
      </main>

      <MobileNav />
    </div>
  );
}

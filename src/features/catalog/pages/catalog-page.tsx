import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { TriangleAlert, SearchX } from "lucide-react";
import { getAuthToken } from "@/features/auth/lib/auth-token";
import { useFavorites } from "@/features/favorites/hooks/use-favorites";
import { useAddFavorite } from "@/features/favorites/hooks/use-add-favorite";
import { useRemoveFavorite } from "@/features/favorites/hooks/use-remove-favorite";
import type { NFT } from "../types/nft";
import { getNfts } from "../api/get-nfts";
import { nftImage, heroImage } from "../lib/nft-image";
import { CatalogSearch } from "../components/catalog-search";
import { CatalogSort } from "../components/catalog-sort";
import { CatalogPagination } from "../components/catalog-pagination";
import { CatalogSidebar, type Collection } from "../components/catalog-sidebar";
import { NftCard } from "../components/nft-card";

import { Container } from "@/components/layout/container";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { MobileNav } from "@/components/layout/mobile-nav";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

import { useAuthMe } from "@/features/auth/hooks/use-auth-me";
import { useLogout } from "@/features/auth/hooks/use-logout";

function CatalogSkeleton() {
  return (
    <ul className="grid grid-cols-2 gap-4 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <li
          key={index}
          className="overflow-hidden rounded-xl border border-border bg-card"
        >
          <div className="aspect-square animate-pulse bg-secondary" />
          <div className="space-y-2 p-3">
            <div className="h-3 w-1/3 animate-pulse rounded bg-secondary" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-secondary" />
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
  hasFilter,
  onClear,
}: {
  hasFilter: boolean;
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
          {hasFilter
            ? "Tente ajustar sua busca ou limpar os filtros."
            : "Ainda não há NFTs disponíveis."}
        </p>
      </div>
      {hasFilter && (
        <button
          type="button"
          onClick={onClear}
          className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
        >
          Limpar filtros
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

  const favorites = useFavorites();
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();

  const favoriteIds = new Set(favorites.data?.nftIds ?? []);
  const isFavoritePending = addFavorite.isPending || removeFavorite.isPending;

  const [priceInput, setPriceInput] = useState<number | null>(null);
  const [appliedMax, setAppliedMax] = useState<number | null>(null);

  function handleFavorite(nft: NFT) {
    if (!getAuthToken()) {
      void navigate({
        to: "/",
        search: (previous) => ({ ...previous, auth: "login" }),
      });
      return;
    }

    if (favoriteIds.has(nft.id)) {
      removeFavorite.mutate(nft.id);
      return;
    }

    addFavorite.mutate(nft.id);
  }

  const { data, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["nfts", params],
    queryFn: () => getNfts(params),
  });

  const allNfts = useQuery({
    queryKey: ["nfts", "all"],
    queryFn: () => getNfts({ search: "", page: 1, sort: "price_asc" }),
  });

  const allItems = allNfts.data?.items ?? [];
  const collectionMap = new Map<string, number>();
  for (const nft of allItems) {
    collectionMap.set(nft.edition, (collectionMap.get(nft.edition) ?? 0) + 1);
  }
  const collections: Collection[] = [...collectionMap.entries()].map(
    ([edition, count]) => ({ edition, count }),
  );

  const prices = allItems.map((nft) => Number(nft.price));
  const priceMin = prices.length ? Math.floor(Math.min(...prices) * 100) / 100 : 0;
  const priceMax = prices.length ? Math.ceil(Math.max(...prices) * 100) / 100 : 0;

  const sliderValue = priceInput ?? priceMax;
  const effectiveMax = appliedMax ?? priceMax;

  const activeCollection = params.search ?? "";

  function selectCollection(edition: string) {
    const next = activeCollection === edition ? "" : edition;
    void navigate({
      to: "/",
      search: (previous) => ({ ...previous, search: next, page: 1 }),
    });
  }

  function clearFilters() {
    setAppliedMax(null);
    setPriceInput(null);
    void navigate({
      to: "/",
      search: (previous) => ({ ...previous, search: "", page: 1 }),
    });
  }

  const visibleItems = (data?.items ?? []).filter(
    (nft) => Number(nft.price) <= effectiveMax + 1e-9,
  );
  const hasFilter = Boolean(params.search) || appliedMax !== null;

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader
        isAuthenticated={isAuthenticated}
        userName={authMe.data?.user.name}
        onLogout={() => logoutMutation.mutate()}
        onSearch={() => document.getElementById("catalog-search")?.focus()}
      />

      <main className="flex-1 pb-6 md:pb-0">
        <Container className="space-y-8 py-6 md:py-8">
          <section className="grid items-center gap-6 overflow-hidden rounded-3xl border border-border bg-linear-to-br from-card via-card to-background p-6 md:grid-cols-[1.1fr_0.9fr] md:p-10">
            <div>
              <p className="text-sm text-primary">Bem-vindo à Kurio</p>
              <h1 className="m-0 mt-2 max-w-xl text-3xl font-bold tracking-tight text-foreground uppercase md:text-5xl">
                Seja dono da arte digital
              </h1>
              <p className="mt-3 max-w-md text-sm text-muted-foreground md:text-base">
                Descubra NFTs selecionados de criadores do mundo todo e construa
                sua coleção na rede.
              </p>
              <a
                href="#catalogo"
                className={cn(buttonVariants({ size: "lg" }), "mt-6 h-10 px-6")}
              >
                Explorar
              </a>
            </div>
            <div className="relative hidden aspect-square overflow-hidden rounded-2xl border border-border md:block">
              <img
                src={heroImage}
                alt="Destaque de NFT da coleção Kurio"
                className="size-full object-cover"
              />
            </div>
          </section>

          <section
            id="catalogo"
            className="scroll-mt-20 grid gap-6 lg:grid-cols-[260px_1fr] lg:items-start"
          >
            <CatalogSidebar
              className="hidden lg:block"
              collections={collections}
              activeCollection={activeCollection}
              onSelectCollection={selectCollection}
              priceMin={priceMin}
              priceMax={priceMax}
              priceValue={sliderValue}
              onPriceInput={setPriceInput}
              onApplyPrice={() => setAppliedMax(sliderValue)}
            />

            <div className="space-y-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="m-0 text-xl font-semibold text-foreground md:text-2xl">
                    Catálogo de NFTs
                  </h2>
                  {!isPending && !isError && (
                    <p className="shrink-0 text-sm text-muted-foreground">
                      {visibleItems.length}{" "}
                      {visibleItems.length === 1 ? "item" : "itens"}
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
              ) : visibleItems.length === 0 ? (
                <EmptyState hasFilter={hasFilter} onClear={clearFilters} />
              ) : (
                <>
                  <ul
                    aria-busy={isFetching}
                    className="grid grid-cols-2 gap-4 lg:grid-cols-3"
                  >
                    {visibleItems.map((nft) => (
                      <li key={nft.id}>
                        <NftCard
                          nft={nft}
                          imageUrl={nftImage(nft.id)}
                          rarity={nft.available <= 3 ? "Raro" : undefined}
                          onFavorite={handleFavorite}
                          isFavorite={favoriteIds.has(nft.id)}
                          isFavoritePending={isFavoritePending}
                        />
                      </li>
                    ))}
                  </ul>

                  <CatalogPagination totalPages={data.totalPages} />
                </>
              )}
            </div>
          </section>
        </Container>
      </main>

      <SiteFooter />
      <MobileNav />
    </div>
  );
}

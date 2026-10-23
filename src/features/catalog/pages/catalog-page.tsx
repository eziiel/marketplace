import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { SearchX, SlidersHorizontal, TriangleAlert } from "lucide-react";

import { getAuthToken } from "@/features/auth/lib/auth-token";
import { useAuthMe } from "@/features/auth/hooks/use-auth-me";
import { useLogout } from "@/features/auth/hooks/use-logout";
import { useFavorites } from "@/features/favorites/hooks/use-favorites";
import { useAddFavorite } from "@/features/favorites/hooks/use-add-favorite";
import { useRemoveFavorite } from "@/features/favorites/hooks/use-remove-favorite";

import { Container } from "@/components/layout/container";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { MobileNav } from "@/components/layout/mobile-nav";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

import { NFT_NETWORK_LABELS, type NFT, type NftNetwork } from "../types/nft";
import { getNfts } from "../api/get-nfts";
import { getFeaturedNft } from "../api/get-featured-nft";
import { heroImage } from "../lib/nft-image";
import { formatEth, fromCents, toCents } from "../lib/price";
import { CatalogSidebar } from "../components/catalog-sidebar";
import { CatalogFiltersDrawer } from "../components/catalog-filters-drawer";
import { CatalogTabs } from "../components/catalog-tabs";
import { CatalogSort } from "../components/catalog-sort";
import { CatalogPagination } from "../components/catalog-pagination";
import { FeaturedNft } from "../components/featured-nft";
import { NftCard } from "../components/nft-card";
import { PromoBanners } from "../components/promo-banners";
import { MintDiary } from "../components/mint-diary";
import type { PriceRangeValue } from "../components/price-range";

const PAGE_SIZE = 9;

const gridClass =
  "grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:gap-x-[34px] lg:gap-y-10";

interface PriceDraft {
  key: string;
  value: PriceRangeValue;
}

function CatalogSkeleton() {
  return (
    <ul aria-label="Carregando catálogo" className={gridClass}>
      {Array.from({ length: PAGE_SIZE }).map((_, index) => (
        <li key={index}>
          <div className="rounded-[4px] bg-card px-1 pt-7 pb-5">
            <div className="aspect-square animate-pulse rounded-[20px] bg-secondary" />
          </div>
          <div className="mt-4 space-y-2 px-0.5">
            <div className="h-3.5 w-2/3 animate-pulse rounded bg-card" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-card" />
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
    <div className="flex flex-col items-center gap-4 rounded-[4px] bg-card px-6 py-16 text-center">
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
        className={cn(buttonVariants({ size: "lg" }), "rounded-[4px] px-5")}
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
    <div className="flex flex-col items-center gap-4 rounded-[4px] bg-card px-6 py-16 text-center">
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
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "rounded-[4px]",
          )}
        >
          Limpar filtros
        </button>
      )}
    </div>
  );
}

function FilterChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-[4px] bg-card px-2 py-1 text-foreground">
      {children}
    </span>
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

  const listQuery = useQuery({
    queryKey: ["nfts", params],
    queryFn: () => getNfts(params),
  });

  const featuredQuery = useQuery({
    queryKey: ["nfts", "featured"],
    queryFn: getFeaturedNft,
  });

  const facets = listQuery.data?.facets;

  const priceBounds: PriceRangeValue = {
    min: facets ? toCents(facets.price.min) : 0,
    max: facets ? toCents(facets.price.max) : 0,
  };

  const appliedPrice: PriceRangeValue = {
    min: params.minPrice ? toCents(params.minPrice) : priceBounds.min,
    max: params.maxPrice ? toCents(params.maxPrice) : priceBounds.max,
  };

  const priceKey = `${params.minPrice ?? ""}|${params.maxPrice ?? ""}|${priceBounds.min}|${priceBounds.max}`;
  const [priceDraft, setPriceDraft] = useState<PriceDraft | null>(null);
  const priceValue =
    priceDraft && priceDraft.key === priceKey ? priceDraft.value : appliedPrice;

  const [filtersOpen, setFiltersOpen] = useState(false);

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

  function selectCollection(value: string) {
    setFiltersOpen(false);
    void navigate({
      to: "/",
      search: (previous) => ({
        ...previous,
        collection: params.collection === value ? undefined : value,
        page: 1,
      }),
    });
  }

  function selectNetwork(value: NftNetwork) {
    setFiltersOpen(false);
    void navigate({
      to: "/",
      search: (previous) => ({
        ...previous,
        network: params.network === value ? undefined : value,
        page: 1,
      }),
    });
  }

  function applyPrice() {
    const next = priceValue;

    setFiltersOpen(false);
    setPriceDraft(null);
    void navigate({
      to: "/",
      search: (previous) => ({
        ...previous,
        minPrice: next.min > priceBounds.min ? fromCents(next.min) : undefined,
        maxPrice: next.max < priceBounds.max ? fromCents(next.max) : undefined,
        page: 1,
      }),
    });
  }

  function clearFilters() {
    setFiltersOpen(false);
    setPriceDraft(null);
    void navigate({ to: "/", search: { page: 1 } });
  }

  const hasPriceFilter = Boolean(params.minPrice || params.maxPrice);
  const hasFilter = Boolean(
    params.search ||
      params.collection ||
      params.network ||
      hasPriceFilter ||
      (params.tab && params.tab !== "all"),
  );

  const items = listQuery.data?.items ?? [];

  const sidebar = (
    <CatalogSidebar
      facets={facets}
      activeCollection={params.collection}
      activeNetwork={params.network}
      priceBounds={priceBounds}
      priceValue={priceValue}
      onPriceChange={(value) => setPriceDraft({ key: priceKey, value })}
      onApplyPrice={applyPrice}
      onSelectCollection={selectCollection}
      onSelectNetwork={selectNetwork}
    />
  );

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader
        isAuthenticated={isAuthenticated}
        userName={authMe.data?.user.name}
        onLogout={() => logoutMutation.mutate()}
      />

      <main className="flex-1 pb-6 md:pb-0">
        <Container className="pt-8 md:pt-9">
          <section
            aria-labelledby="hero-title"
            className="grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_minmax(260px,450px)] md:gap-12"
          >
            <div className="md:pl-10">
              <p className="text-sm text-foreground">Bem-vindo à Kurio</p>
              <h1
                id="hero-title"
                className="m-0 mt-5 max-w-[600px] text-3xl leading-[1.4] font-bold tracking-normal text-foreground uppercase sm:text-4xl lg:text-[46px]"
              >
                Seja dono do futuro da arte digital
              </h1>
              <p className="mt-4 max-w-[560px] text-sm leading-6 text-muted-foreground">
                Descubra NFTs selecionados de criadores emergentes e
                consagrados. Colecione arte digital rara, apoie artistas e
                tenha uma parte da cultura da internet.
              </p>
              <Link
                to="/"
                search={{ page: 1 }}
                hash="catalogo"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "mt-9 h-10 rounded-[4px] px-7 text-sm font-bold uppercase",
                )}
              >
                Explorar
              </Link>
              <div
                aria-hidden
                className="mt-10 hidden justify-end gap-2.5 pr-6 md:flex lg:pr-28"
              >
                <span className="size-2 rounded-full bg-primary" />
                <span className="size-2 rounded-full bg-primary" />
                <span className="size-2 rounded-full bg-primary" />
              </div>
            </div>

            <div className="overflow-hidden rounded-[24px]">
              <img
                src={heroImage}
                alt="Emerald Ape #042, NFT em destaque da coleção Kurio"
                width={450}
                height={450}
                className="aspect-square w-full object-cover"
              />
            </div>
          </section>

          <section
            id="catalogo"
            aria-labelledby="catalog-title"
            className="mt-16 grid scroll-mt-24 gap-10 lg:mt-20 lg:grid-cols-[310px_minmax(0,1fr)] lg:gap-12"
          >
            <div className="hidden space-y-6 lg:block">
              {sidebar}
              <FeaturedNft nft={featuredQuery.data} />
            </div>

            <div className="min-w-0">
              <h2 id="catalog-title" className="sr-only">
                Catálogo de NFTs
              </h2>

              <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
                <CatalogTabs />
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setFiltersOpen(true)}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "lg" }),
                      "h-9 gap-1.5 rounded-[4px] px-3 lg:hidden",
                    )}
                  >
                    <SlidersHorizontal className="size-4" aria-hidden />
                    Filtros
                  </button>
                  <CatalogSort />
                </div>
              </div>

              {hasFilter && (
                <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>Filtros ativos:</span>
                  {params.search && (
                    <FilterChip>Busca: “{params.search}”</FilterChip>
                  )}
                  {params.tab && params.tab !== "all" && (
                    <FilterChip>
                      {params.tab === "new" ? "Novos lançamentos" : "Em alta"}
                    </FilterChip>
                  )}
                  {params.collection && (
                    <FilterChip>{params.collection}</FilterChip>
                  )}
                  {params.network && (
                    <FilterChip>{NFT_NETWORK_LABELS[params.network]}</FilterChip>
                  )}
                  {hasPriceFilter && (
                    <FilterChip>
                      {formatEth(appliedPrice.min)} – {formatEth(appliedPrice.max)}{" "}
                      ETH
                    </FilterChip>
                  )}
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="font-semibold text-highlight hover:underline focus-visible:outline-2 focus-visible:outline-highlight"
                  >
                    Limpar filtros
                  </button>
                </div>
              )}

              <div className="mt-6">
                {listQuery.isPending ? (
                  <CatalogSkeleton />
                ) : listQuery.isError ? (
                  <ErrorState
                    message={listQuery.error.message}
                    onRetry={() => void listQuery.refetch()}
                  />
                ) : items.length === 0 ? (
                  <EmptyState hasFilter={hasFilter} onClear={clearFilters} />
                ) : (
                  <>
                    <ul
                      aria-label="Resultados do catálogo"
                      aria-busy={listQuery.isFetching}
                      className={gridClass}
                    >
                      {items.map((nft) => (
                        <li key={nft.id}>
                          <NftCard
                            nft={nft}
                            onFavorite={handleFavorite}
                            isFavorite={favoriteIds.has(nft.id)}
                            isFavoritePending={isFavoritePending}
                          />
                        </li>
                      ))}
                    </ul>

                    <div className="mt-10">
                      <CatalogPagination
                        page={listQuery.data.page}
                        totalPages={listQuery.data.totalPages}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>

          <PromoBanners />
          <MintDiary />
        </Container>
      </main>

      <SiteFooter />
      <MobileNav />

      <CatalogFiltersDrawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
      >
        {sidebar}
      </CatalogFiltersDrawer>
    </div>
  );
}

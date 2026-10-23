import { useState, type ReactNode } from "react";
import { useQuery, useQueries } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import axios from "axios";
import { ShoppingCart } from "lucide-react";

import { getCart } from "../api/get-cart";
import { useRemoveCartItem } from "../hooks/use-remove-cart-item";
import { useUpdateCartItem } from "../hooks/use-update-cart-item";
import { getStoredCoupon, storeCoupon } from "../lib/coupon-storage";
import { CartItemRow, cartColumns } from "../components/cart-item-row";
import { CartSummary } from "../components/cart-summary";

import { getNftById } from "@/features/catalog/api/get-nft-by-id";
import { getNfts } from "@/features/catalog/api/get-nfts";
import { NftCarousel } from "@/features/catalog/components/nft-carousel";
import { useNetworks } from "@/features/checkout/hooks/use-networks";
import { useQuote } from "@/features/checkout/hooks/use-quote";
import { Container } from "@/components/layout/container";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { crumbs } from "@/components/layout/crumbs";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

import { getAuthToken } from "@/features/auth/lib/auth-token";
import { useAuthMe } from "@/features/auth/hooks/use-auth-me";
import { useLogout } from "@/features/auth/hooks/use-logout";

function messageFromError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;

    return data?.message ?? error.message;
  }

  return error instanceof Error ? error.message : "Erro inesperado";
}

function CartShell({
  cartCount,
  children,
}: {
  cartCount?: number;
  children: ReactNode;
}) {
  const isAuthenticated = Boolean(getAuthToken());
  const authMe = useAuthMe();
  const logoutMutation = useLogout();

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader
        activeNav="Mercado"
        cartCount={cartCount}
        isAuthenticated={isAuthenticated}
        userName={authMe.data?.user.name}
        onLogout={() => logoutMutation.mutate()}
      />
      <main className="flex-1 pb-6 md:pb-0">
        <Container className="py-6 md:py-8">
          <Breadcrumb
            items={[crumbs.home, crumbs.market]}
            current="Carrinho"
            className="mb-5"
          />
          <h1 className="sr-only">Carrinho</h1>
          {children}
        </Container>
      </main>
      <SiteFooter />
      <MobileNav cartCount={cartCount} />
    </div>
  );
}

function TableHeader() {
  return (
    <div
      aria-hidden
      className={cn(
        "hidden gap-x-3 border-b border-border pb-2 text-sm text-muted-foreground md:grid",
        cartColumns,
      )}
    >
      <span>NFTs</span>
      <span>Preço</span>
      <span>Edições</span>
      <span>Total</span>
      <span />
    </div>
  );
}

function AlsoViewed({ excludeIds }: { excludeIds: string[] }) {
  const query = useQuery({
    queryKey: ["nfts", { page: 1, tab: "trending" }],
    queryFn: () => getNfts({ page: 1, tab: "trending" }),
  });

  const items = (query.data?.items ?? []).filter(
    (item) => !excludeIds.includes(item.id),
  );

  return (
    <NftCarousel
      title="Colecionadores também viram"
      items={items}
      isLoading={query.isPending}
      className="mt-16"
    />
  );
}

export function CartPage() {
  const {
    data: cart,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["cart"],
    queryFn: getCart,
  });
  const removeMutation = useRemoveCartItem();
  const updateMutation = useUpdateCartItem();

  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(() =>
    getStoredCoupon(),
  );

  const items = cart?.items ?? [];
  const nftQueries = useQueries({
    queries: items.map((item) => ({
      queryKey: ["nft", item.nftId],
      queryFn: () => getNftById(item.nftId),
    })),
  });

  const networksQuery = useNetworks();
  const networkId = networksQuery.data?.[0]?.id ?? "";
  const cartKey = items
    .map((item) => `${item.nftId}:${item.edition}:${item.quantity}`)
    .join("|");

  const quoteQuery = useQuote(
    { networkId, couponCode: appliedCoupon },
    { enabled: Boolean(networkId) && items.length > 0, cartKey },
  );

  const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);

  function applyCoupon(code: string) {
    const next = code.length > 0 ? code : null;
    setAppliedCoupon(next);
    storeCoupon(next);
  }

  if (isPending) {
    return (
      <CartShell>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_333px] lg:gap-[84px]">
          <div>
            <TableHeader />
            <ul aria-label="Carregando carrinho" className="mt-4 space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <li
                  key={index}
                  className="h-[66px] animate-pulse rounded-[4px] bg-card"
                />
              ))}
            </ul>
          </div>
          <div className="space-y-3">
            <div className="h-7 w-2/3 animate-pulse rounded bg-card" />
            <div className="h-10 w-full animate-pulse rounded bg-card" />
            <div className="h-5 w-full animate-pulse rounded bg-card" />
            <div className="h-5 w-full animate-pulse rounded bg-card" />
          </div>
        </div>
      </CartShell>
    );
  }

  if (isError) {
    return (
      <CartShell>
        <div
          role="alert"
          className="flex flex-col items-center gap-4 rounded-[4px] bg-card px-6 py-20 text-center"
        >
          <p className="text-lg font-semibold text-foreground">
            Erro ao carregar carrinho: {error.message}
          </p>
        </div>
      </CartShell>
    );
  }

  if (cart.items.length === 0) {
    return (
      <CartShell cartCount={0}>
        <div className="flex flex-col items-center gap-4 rounded-[4px] bg-card px-6 py-20 text-center">
          <span className="grid size-14 place-items-center rounded-full bg-secondary text-muted-foreground">
            <ShoppingCart aria-hidden />
          </span>
          <p className="text-lg font-semibold text-foreground">
            Seu carrinho está vazio.
          </p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Explore o catálogo e adicione NFTs à sua coleção.
          </p>
          <Link
            to="/"
            search={{ page: 1 }}
            hash="catalogo"
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-10 rounded-[4px] px-6 font-bold",
            )}
          >
            Explorar catálogo
          </Link>
        </div>
        <AlsoViewed excludeIds={[]} />
      </CartShell>
    );
  }

  return (
    <CartShell cartCount={totalQuantity}>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_333px] lg:gap-[84px]">
        <div>
          <TableHeader />

          <div aria-live="polite" className="space-y-2">
            {updateMutation.isError && (
              <p role="alert" className="mt-3 text-sm text-destructive">
                Não foi possível atualizar a quantidade:{" "}
                {messageFromError(updateMutation.error)}
              </p>
            )}
            {removeMutation.isError && (
              <p role="alert" className="mt-3 text-sm text-destructive">
                Não foi possível remover o item:{" "}
                {messageFromError(removeMutation.error)}
              </p>
            )}
          </div>

          <ul aria-label="Itens do carrinho" className="mt-4 space-y-4">
            {cart.items.map((item, index) => (
              <CartItemRow
                key={`${item.nftId}-${item.edition}`}
                item={item}
                nft={nftQueries[index]?.data}
                isUpdating={updateMutation.isPending}
                isRemoving={removeMutation.isPending}
                onDecrement={() =>
                  updateMutation.mutate({
                    ...item,
                    quantity: item.quantity - 1,
                  })
                }
                onIncrement={() =>
                  updateMutation.mutate({
                    ...item,
                    quantity: item.quantity + 1,
                  })
                }
                onRemove={() =>
                  removeMutation.mutate({
                    nftId: item.nftId,
                    edition: item.edition,
                  })
                }
              />
            ))}
          </ul>
        </div>

        <div className="lg:sticky lg:top-24">
          <CartSummary
            quote={quoteQuery.data}
            isPending={quoteQuery.isPending || networksQuery.isPending}
            isFetching={quoteQuery.isFetching}
            errorMessage={
              quoteQuery.isError
                ? messageFromError(quoteQuery.error)
                : networksQuery.isError
                  ? messageFromError(networksQuery.error)
                  : undefined
            }
            onRetry={() => {
              void networksQuery.refetch();
              void quoteQuery.refetch();
            }}
            appliedCoupon={appliedCoupon}
            onApplyCoupon={applyCoupon}
            onRemoveCoupon={() => applyCoupon("")}
          />
        </div>
      </div>

      <AlsoViewed excludeIds={cart.items.map((item) => item.nftId)} />
    </CartShell>
  );
}

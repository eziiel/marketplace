import type { ReactNode } from "react";
import { useQuery, useQueries } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";

import { getCart } from "../api/get-cart";
import { useRemoveCartItem } from "../hooks/use-remove-cart-item";
import { useUpdateCartItem } from "../hooks/use-update-cart-item";
import { CartItemRow } from "../components/cart-item-row";
import { CartSummary } from "../components/cart-summary";

import { getNftById } from "@/features/catalog/api/get-nft-by-id";
import { Container } from "@/components/layout/container";
import { SiteHeader } from "@/components/layout/site-header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { multiply, sum } from "@/lib/money";

import { getAuthToken } from "@/features/auth/lib/auth-token";
import { useAuthMe } from "@/features/auth/hooks/use-auth-me";
import { useLogout } from "@/features/auth/hooks/use-logout";

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
        cartCount={cartCount}
        isAuthenticated={isAuthenticated}
        userName={authMe.data?.user.name}
        onLogout={() => logoutMutation.mutate()}
      />
      <main className="flex-1 pb-24 md:pb-12">
        <Container className="py-6 md:py-10">{children}</Container>
      </main>
      <MobileNav cartCount={cartCount} />
    </div>
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

  const items = cart?.items ?? [];
  const nftQueries = useQueries({
    queries: items.map((item) => ({
      queryKey: ["nft", item.nftId],
      queryFn: () => getNftById(item.nftId),
    })),
  });

  const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);

  if (isPending) {
    return (
      <CartShell>
        <h1 className="m-0 mb-6 text-2xl font-bold text-foreground md:text-3xl">
          Meu carrinho
        </h1>
        <ul className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <li
              key={index}
              className="h-28 animate-pulse rounded-2xl border border-border bg-card"
            />
          ))}
        </ul>
      </CartShell>
    );
  }

  if (isError) {
    return (
      <CartShell>
        <div
          role="alert"
          className="flex flex-col items-center gap-4 rounded-3xl border border-border bg-card px-6 py-20 text-center"
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
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-border bg-card px-6 py-20 text-center">
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
            className={cn(buttonVariants({ size: "lg" }), "px-6")}
          >
            Explorar catálogo
          </Link>
        </div>
      </CartShell>
    );
  }

  const subtotal = sum(
    cart.items.map((item, index) => {
      const nft = nftQueries[index]?.data;
      return nft ? multiply(nft.price, item.quantity) : "0";
    }),
  );
  const currency =
    nftQueries.find((query) => query.data)?.data?.currency ?? "ETH";

  return (
    <CartShell cartCount={totalQuantity}>
      <h1 className="m-0 mb-6 text-2xl font-bold text-foreground md:text-3xl">
        Meu carrinho
      </h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
        <div className="space-y-4">
          {updateMutation.isError && (
            <p role="alert" className="text-sm text-destructive">
              Não foi possível atualizar a quantidade:{" "}
              {updateMutation.error.message}
            </p>
          )}
          {removeMutation.isError && (
            <p role="alert" className="text-sm text-destructive">
              Não foi possível remover o item: {removeMutation.error.message}
            </p>
          )}

          <ul className="space-y-4">
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

        <div className="lg:sticky lg:top-20">
          <CartSummary
            subtotal={subtotal}
            currency={currency}
            itemCount={totalQuantity}
          />
        </div>
      </div>
    </CartShell>
  );
}

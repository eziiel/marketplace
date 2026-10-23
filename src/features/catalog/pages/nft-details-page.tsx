import { useState, type ReactNode } from "react";
import { useParams, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ImageOff, ChevronRight, ShoppingCart, Check } from "lucide-react";

import { useAddCartItem } from "@/features/cart/hooks/use-add-cart-item";
import { getNftById } from "../api/get-nft-by-id";

import { Container } from "@/components/layout/container";
import { SiteHeader } from "@/components/layout/site-header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

import { getAuthToken } from "@/features/auth/lib/auth-token";
import { useAuthMe } from "@/features/auth/hooks/use-auth-me";
import { useLogout } from "@/features/auth/hooks/use-logout";

function DetailsShell({ children }: { children: ReactNode }) {
  const isAuthenticated = Boolean(getAuthToken());
  const authMe = useAuthMe();
  const logoutMutation = useLogout();

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader
        isAuthenticated={isAuthenticated}
        userName={authMe.data?.user.name}
        onLogout={() => logoutMutation.mutate()}
      />
      <main className="flex-1 pb-24 md:pb-12">
        <Container className="py-6 md:py-10">{children}</Container>
      </main>
      <MobileNav />
    </div>
  );
}

function DetailsSkeleton() {
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="aspect-square animate-pulse rounded-3xl bg-card" />
      <div className="space-y-4">
        <div className="h-8 w-2/3 animate-pulse rounded bg-card" />
        <div className="h-6 w-1/3 animate-pulse rounded bg-card" />
        <div className="h-24 w-full animate-pulse rounded bg-card" />
        <div className="h-11 w-40 animate-pulse rounded-full bg-card" />
      </div>
    </div>
  );
}

export function NftDetailsPage() {
  const { id } = useParams({ from: "/nfts/$id" });

  const {
    data: nft,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["nft", id],
    queryFn: () => getNftById(id),
  });
  const addCartMutation = useAddCartItem();
  const [quantity, setQuantity] = useState(1);

  if (isPending) {
    return (
      <DetailsShell>
        <DetailsSkeleton />
      </DetailsShell>
    );
  }

  if (isError) {
    const notFound =
      axios.isAxiosError(error) && error.response?.status === 404;

    return (
      <DetailsShell>
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-border bg-card px-6 py-20 text-center">
          <p className="text-lg font-semibold text-foreground">
            {notFound
              ? "NFT não encontrado."
              : `Erro ao carregar NFT: ${error.message}`}
          </p>
          <Link
            to="/"
            search={{ page: 1 }}
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
          >
            Voltar ao catálogo
          </Link>
        </div>
      </DetailsShell>
    );
  }

  const soldOut = nft.available === 0;
  const maxQuantity = Math.max(nft.available, 1);
  const effectiveQuantity = Math.min(quantity, maxQuantity);

  return (
    <DetailsShell>
      <nav
        aria-label="Trilha"
        className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground"
      >
        <Link to="/" search={{ page: 1 }} className="hover:text-foreground">
          Início
        </Link>
        <ChevronRight className="size-3.5" aria-hidden />
        <span className="truncate text-foreground">{nft.name}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        <div
          role="img"
          aria-label={nft.name}
          className="relative grid aspect-square place-items-center overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-secondary to-card"
        >
          <ImageOff className="size-12 text-muted-foreground/40" aria-hidden />
          {soldOut && (
            <span className="absolute top-4 left-4 rounded-full bg-background/80 px-3 py-1 text-xs font-semibold text-foreground">
              Esgotado
            </span>
          )}
        </div>

        <div className="flex flex-col">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {nft.edition}
          </p>
          <h1 className="m-0 mt-1 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {nft.name}
          </h1>

          <p className="mt-4 text-sm text-muted-foreground">
            Preço:{" "}
            <span className="text-2xl font-bold text-primary">
              {nft.price} {nft.currency}
            </span>
          </p>

          <dl className="mt-6 space-y-3 border-t border-border pt-6 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Edição: {nft.edition}</dt>
              <dd className="text-foreground">Kurio Editions</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">
                Disponíveis: {nft.available}
              </dt>
              <dd className="text-foreground">
                {soldOut ? "Sem estoque" : "Em estoque"}
              </dd>
            </div>
          </dl>

          <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-border pt-6">
            <QuantityStepper
              value={effectiveQuantity}
              onDecrement={() => setQuantity((q) => Math.max(q - 1, 1))}
              onIncrement={() =>
                setQuantity((q) => Math.min(q + 1, maxQuantity))
              }
              disableDecrement={effectiveQuantity <= 1 || soldOut}
              disableIncrement={effectiveQuantity >= maxQuantity || soldOut}
            />
            <span className="text-sm text-muted-foreground">
              Máximo {nft.available} por compra
            </span>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              disabled={addCartMutation.isPending || soldOut}
              onClick={() => {
                addCartMutation.mutate({
                  nftId: nft.id,
                  edition: nft.edition,
                  quantity: effectiveQuantity,
                });
              }}
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-11 flex-1 px-6 text-sm",
              )}
            >
              {addCartMutation.isPending
                ? "Adicionando..."
                : "Adicionar ao carrinho"}
            </button>
            <Link
              to="/cart"
              aria-label="Ver carrinho"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-11 px-4",
              )}
            >
              <ShoppingCart aria-hidden />
              <span>Ver carrinho</span>
            </Link>
          </div>

          <div aria-live="polite" className="mt-4 min-h-6">
            {addCartMutation.isSuccess && (
              <p className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                <Check className="size-4" aria-hidden />
                Item adicionado ao carrinho!
              </p>
            )}
            {addCartMutation.isError && (
              <p role="alert" className="text-sm text-destructive">
                Não foi possível adicionar: {addCartMutation.error.message}
              </p>
            )}
          </div>
        </div>
      </div>
    </DetailsShell>
  );
}

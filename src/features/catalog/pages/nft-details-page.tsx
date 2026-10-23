import { useState, type ReactNode } from "react";
import { useParams, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Check, Heart, Mail } from "lucide-react";

import { useAddCartItem } from "@/features/cart/hooks/use-add-cart-item";
import { getNftById } from "../api/get-nft-by-id";
import { getNfts } from "../api/get-nfts";
import { getNftReviews } from "../api/get-nft-reviews";
import { nftImage } from "../lib/nft-image";
import { NFT_EDITIONS, NFT_NETWORK_LABELS, type NFT } from "../types/nft";
import { NftCarousel } from "../components/nft-carousel";
import { NftGallery } from "../components/nft-gallery";
import { NftRating } from "../components/nft-rating";
import { NftDetailsTabs } from "../components/nft-details-tabs";

import { Container } from "@/components/layout/container";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { crumbs } from "@/components/layout/crumbs";
import { BrandIcon } from "@/components/icons/brand-icon";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

import { getAuthToken } from "@/features/auth/lib/auth-token";
import { useAuthMe } from "@/features/auth/hooks/use-auth-me";
import { useLogout } from "@/features/auth/hooks/use-logout";
import { useFavorites } from "@/features/favorites/hooks/use-favorites";
import { useAddFavorite } from "@/features/favorites/hooks/use-add-favorite";
import { useRemoveFavorite } from "@/features/favorites/hooks/use-remove-favorite";

function DetailsShell({ children }: { children: ReactNode }) {
  const isAuthenticated = Boolean(getAuthToken());
  const authMe = useAuthMe();
  const logoutMutation = useLogout();

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader
        activeNav="Mercado"
        isAuthenticated={isAuthenticated}
        userName={authMe.data?.user.name}
        onLogout={() => logoutMutation.mutate()}
      />
      <main className="flex-1 pb-6 md:pb-0">
        <Container className="py-6 md:py-8">{children}</Container>
      </main>
      <SiteFooter />
      <MobileNav />
    </div>
  );
}

function DetailsSkeleton() {
  return (
    <div aria-label="Carregando NFT" className="grid gap-8 lg:grid-cols-[572px_minmax(0,1fr)]">
      <div className="flex flex-col-reverse gap-4 md:flex-row md:gap-7">
        <div className="flex gap-3 md:w-[100px] md:flex-col md:gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="size-[72px] animate-pulse rounded-[6px] bg-card md:size-[100px]"
            />
          ))}
        </div>
        <div className="flex-1 rounded-[4px] bg-card p-6">
          <div className="aspect-square animate-pulse rounded-[20px] bg-secondary" />
        </div>
      </div>
      <div className="space-y-4">
        <div className="h-8 w-2/3 animate-pulse rounded bg-card" />
        <div className="h-6 w-1/3 animate-pulse rounded bg-card" />
        <div className="h-20 w-full animate-pulse rounded bg-card" />
        <div className="h-10 w-1/2 animate-pulse rounded bg-card" />
        <div className="h-10 w-full animate-pulse rounded bg-card" />
      </div>
    </div>
  );
}

function editionOptions(nft: NFT): string[] {
  const options: string[] = [...NFT_EDITIONS];

  return options.includes(nft.edition) ? options : [nft.edition, ...options];
}

const shareButton =
  "grid size-6 place-items-center text-muted-foreground transition-colors hover:text-highlight focus-visible:outline-2 focus-visible:outline-highlight";

export function NftDetailsPage() {
  const { id } = useParams({ from: "/nfts/$id" });
  const navigate = useNavigate();

  const {
    data: nft,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["nft", id],
    queryFn: () => getNftById(id),
  });

  const reviewsQuery = useQuery({
    queryKey: ["nft", id, "reviews"],
    queryFn: () => getNftReviews(id),
    enabled: Boolean(nft),
  });

  const relatedQuery = useQuery({
    queryKey: ["nfts", { page: 1, collection: nft?.collection }],
    queryFn: () => getNfts({ page: 1, collection: nft?.collection }),
    enabled: Boolean(nft),
  });

  const favorites = useFavorites();
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();
  const isFavorite = Boolean(nft && favorites.data?.nftIds.includes(nft.id));
  const favoritePending = addFavorite.isPending || removeFavorite.isPending;

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
        <div className="flex flex-col items-center gap-4 rounded-[4px] bg-card px-6 py-20 text-center">
          <p className="text-lg font-semibold text-foreground">
            {notFound
              ? "NFT não encontrado."
              : `Erro ao carregar NFT: ${error.message}`}
          </p>
          <Link
            to="/"
            search={{ page: 1 }}
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "rounded-[4px]",
            )}
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
  const images =
    nft.gallery.length > 0 ? nft.gallery : [nft.image || nftImage(nft.id)];
  const related = (relatedQuery.data?.items ?? []).filter(
    (item) => item.id !== nft.id,
  );
  const reviews = reviewsQuery.data;
  const nftId = nft.id;
  const shareUrl = window.location.href;
  const shareText = `${nft.name} na Kurio`;

  function handleFavorite() {
    if (!getAuthToken()) {
      void navigate({
        to: "/nfts/$id",
        params: { id: nftId },
        search: { auth: "login" },
      });
      return;
    }

    if (isFavorite) {
      removeFavorite.mutate(nftId);
      return;
    }

    addFavorite.mutate(nftId);
  }

  return (
    <DetailsShell>
      <Breadcrumb
        items={[crumbs.home, crumbs.market]}
        current={nft.name}
        className="mb-5"
      />

      <div className="grid gap-8 lg:grid-cols-[572px_minmax(0,1fr)]">
        <NftGallery images={images} name={nft.name} soldOut={soldOut} />

        <div className="min-w-0">
          <h1 className="m-0 text-2xl leading-tight font-bold tracking-normal text-foreground md:text-[26px]">
            {nft.name}
          </h1>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-border pb-4">
            <p className="text-[22px] font-bold text-highlight">
              <span className="sr-only">Preço: </span>
              {nft.price} {nft.currency}
            </p>
            {reviews ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <NftRating average={reviews.average} count={reviews.count} />
                <span aria-hidden>
                  {reviews.count} avaliações de colecionadores
                </span>
              </p>
            ) : (
              <span
                aria-hidden
                className="h-4 w-56 animate-pulse rounded bg-card"
              />
            )}
          </div>

          <h2 className="m-0 mt-4 text-sm font-normal text-muted-foreground">
            Sobre este NFT:
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Um colecionável digital finalizado à mão da coleção Kurio Editions,
            verificado na {NFT_NETWORK_LABELS[nft.network]}, com arte
            desbloqueável e acesso para colecionadores.
          </p>

          <p id="edition-label" className="mt-5 text-sm text-muted-foreground">
            Edição:
          </p>
          <ul
            aria-labelledby="edition-label"
            className="mt-3 flex flex-wrap gap-2"
          >
            {editionOptions(nft).map((edition) => {
              const active = edition === nft.edition;

              return (
                <li key={edition}>
                  <span
                    aria-current={active ? "true" : undefined}
                    aria-disabled={active ? undefined : true}
                    className={cn(
                      "inline-flex h-6 items-center rounded-full border px-2.5 text-xs uppercase",
                      active
                        ? "border-highlight text-highlight"
                        : "border-foreground/60 text-foreground/60",
                    )}
                  >
                    {edition}
                    {!active && (
                      <span className="sr-only"> (edição indisponível)</span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <QuantityStepper
                value={effectiveQuantity}
                onDecrement={() => setQuantity((q) => Math.max(q - 1, 1))}
                onIncrement={() =>
                  setQuantity((q) => Math.min(q + 1, maxQuantity))
                }
                disableDecrement={effectiveQuantity <= 1 || soldOut}
                disableIncrement={effectiveQuantity >= maxQuantity || soldOut}
              />
              <span className="text-xs text-muted-foreground">
                Disponíveis: {nft.available}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
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
                  "h-[38px] min-w-[130px] rounded-[4px] px-5 text-sm font-bold uppercase",
                )}
              >
                {addCartMutation.isPending
                  ? "Adicionando..."
                  : soldOut
                    ? "Esgotado"
                    : "Comprar"}
              </button>
              <button
                type="button"
                onClick={handleFavorite}
                disabled={favoritePending}
                aria-pressed={isFavorite}
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-[38px] min-w-[130px] gap-2 rounded-[4px] border-primary bg-transparent px-4 text-sm text-highlight hover:bg-primary/10 hover:text-highlight dark:border-primary dark:bg-transparent dark:hover:bg-primary/10",
                )}
              >
                <Heart
                  className={cn("size-4", isFavorite && "fill-highlight")}
                  aria-hidden
                />
                {isFavorite ? "Favoritado" : "Favoritar"}
              </button>
            </div>
          </div>

          <div aria-live="polite" className="mt-3 min-h-5">
            {addCartMutation.isSuccess && (
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium text-highlight">
                <span className="inline-flex items-center gap-1.5">
                  <Check className="size-4" aria-hidden />
                  Item adicionado ao carrinho!
                </span>
                <Link
                  to="/cart"
                  className="underline underline-offset-4 hover:text-foreground"
                >
                  Ver carrinho
                </Link>
              </p>
            )}
            {addCartMutation.isError && (
              <p role="alert" className="text-sm text-destructive">
                Não foi possível adicionar: {addCartMutation.error.message}
              </p>
            )}
            {(addFavorite.isError || removeFavorite.isError) && (
              <p role="alert" className="text-sm text-destructive">
                Não foi possível atualizar os favoritos.
              </p>
            )}
          </div>

          <dl className="mt-4 space-y-3 text-[15px] text-foreground">
            <div className="flex gap-1.5">
              <dt>ID do token:</dt>
              <dd>{nft.tokenId}</dd>
            </div>
            <div className="flex gap-1.5">
              <dt>Coleção:</dt>
              <dd>{nft.collection}</dd>
            </div>
            {nft.attributes.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                <dt>Atributos:</dt>
                <dd>{nft.attributes.join(", ")}</dd>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <dt>Compartilhar este NFT:</dt>
              <dd className="flex items-center gap-1">
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Compartilhar no LinkedIn"
                  className={shareButton}
                >
                  <BrandIcon name="linkedin" className="size-4" />
                </a>
                <a
                  href={`mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(shareUrl)}`}
                  aria-label="Compartilhar por e-mail"
                  className={shareButton}
                >
                  <Mail className="size-4" aria-hidden />
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Compartilhar no Twitter"
                  className={shareButton}
                >
                  <BrandIcon name="twitter" className="size-4" />
                </a>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-12">
        <NftDetailsTabs nft={nft} reviewCount={reviews?.count} />
      </div>

      <NftCarousel
        title="Mais desta coleção"
        items={related}
        isLoading={relatedQuery.isPending}
        className="mt-16"
      />
    </DetailsShell>
  );
}

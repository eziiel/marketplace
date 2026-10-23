import { useId, useState, type KeyboardEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { getNftReviews } from "../api/get-nft-reviews";
import { NFT_NETWORK_LABELS, type NFT } from "../types/nft";
import { NftRating } from "./nft-rating";

type TabValue = "details" | "reviews";

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function Fact({ label, children }: { label: string; children: string }) {
  return (
    <div className="mt-4">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm leading-6 text-foreground">{children}</dd>
    </div>
  );
}

function ReviewsPanel({ nftId }: { nftId: string }) {
  const reviewsQuery = useQuery({
    queryKey: ["nft", nftId, "reviews"],
    queryFn: () => getNftReviews(nftId),
  });

  if (reviewsQuery.isPending) {
    return (
      <ul aria-label="Carregando avaliações" className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <li key={index} className="h-20 animate-pulse rounded-[4px] bg-card" />
        ))}
      </ul>
    );
  }

  if (reviewsQuery.isError) {
    return (
      <p role="alert" className="text-sm text-destructive">
        Não foi possível carregar as avaliações: {reviewsQuery.error.message}
      </p>
    );
  }

  const reviews = reviewsQuery.data;

  return (
    <div>
      <p className="flex flex-wrap items-center gap-3 text-sm text-foreground">
        <span aria-hidden>
          <NftRating average={reviews.average} />
        </span>
        <span>
          {reviews.average} de 5 · {reviews.count} avaliações de colecionadores
        </span>
      </p>
      <ul className="mt-6 space-y-5">
        {reviews.items.map((review) => (
          <li key={review.id} className="border-b border-border pb-5 last:border-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-bold text-foreground">
                {review.author}
              </span>
              <span className="flex items-center gap-3 text-xs text-muted-foreground">
                <NftRating average={review.rating} size="sm" />
                <time dateTime={review.createdAt}>
                  {formatDate(review.createdAt)}
                </time>
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {review.comment}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function NftDetailsTabs({
  nft,
  reviewCount,
}: {
  nft: NFT;
  reviewCount?: number;
}) {
  const baseId = useId();
  const [tab, setTab] = useState<TabValue>("details");
  const network = NFT_NETWORK_LABELS[nft.network];

  const tabs: { value: TabValue; label: string }[] = [
    { value: "details", label: "Detalhes do NFT" },
    {
      value: "reviews",
      label:
        reviewCount === undefined
          ? "Avaliações de colecionadores"
          : `Avaliações de colecionadores (${reviewCount})`,
    },
  ];

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") {
      return;
    }

    event.preventDefault();
    const index = tabs.findIndex((item) => item.value === tab);
    const offset = event.key === "ArrowRight" ? 1 : -1;
    const next = tabs[(index + offset + tabs.length) % tabs.length];
    setTab(next.value);
    document.getElementById(`${baseId}-tab-${next.value}`)?.focus();
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label="Informações do NFT"
        onKeyDown={handleKeyDown}
        className="flex flex-wrap gap-x-8 gap-y-2 border-b border-border text-sm"
      >
        {tabs.map((item) => {
          const active = item.value === tab;

          return (
            <button
              key={item.value}
              id={`${baseId}-tab-${item.value}`}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls={`${baseId}-panel-${item.value}`}
              tabIndex={active ? 0 : -1}
              onClick={() => setTab(item.value)}
              className={cn(
                "relative pb-3 font-bold transition-colors focus-visible:outline-2 focus-visible:outline-highlight",
                active
                  ? "text-highlight"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
              {active && (
                <span
                  aria-hidden
                  className="absolute bottom-0 left-0 h-0.5 w-full bg-highlight"
                />
              )}
            </button>
          );
        })}
      </div>

      <div
        id={`${baseId}-panel-details`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-details`}
        hidden={tab !== "details"}
        className="pt-6"
      >
        <p className="text-sm leading-6 text-muted-foreground">
          {nft.name} é uma obra digital {nft.edition} finalizada à mão da
          coleção Kurio Editions. Cada atributo fica armazenado nos metadados do
          token e verificado na {network}. A obra explora identidade, movimento
          e luz em um mundo digital sem fronteiras.
        </p>
        <p className="mt-6 text-sm leading-6 text-muted-foreground">
          A propriedade inclui a arte em alta resolução, lançamentos exclusivos
          para colecionadores e um registro permanente de procedência registrada
          na rede. {nft.creator} recebe 5% de direitos autorais nas vendas
          secundárias, apoiando novos trabalhos e lançamentos da comunidade.
        </p>
        <dl className="mt-2">
          <Fact label="Rede:">
            {`Cunhado na ${network} com procedência imutável e metadados armazenados no IPFS.`}
          </Fact>
          <Fact label="Contrato:">
            0x7A42...19E8 • Contrato inteligente ERC-721 verificado.
          </Fact>
          <Fact label="Direitos autorais:">
            Direitos autorais do criador: 5% nas vendas secundárias, pagos
            automaticamente pelos mercados compatíveis.
          </Fact>
        </dl>
      </div>

      <div
        id={`${baseId}-panel-reviews`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-reviews`}
        hidden={tab !== "reviews"}
        className="pt-6"
      >
        {tab === "reviews" && <ReviewsPanel nftId={nft.id} />}
      </div>
    </div>
  );
}

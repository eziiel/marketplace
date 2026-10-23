import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button-variants";
import type { NftListParams } from "../types/nft";

interface Banner {
  title: string;
  description: string;
  image: string;
  search: NftListParams;
}

const banners: Banner[] = [
  {
    title: "Lançamentos gênesis\nde edição limitada",
    description:
      "Colecione edições escassas diretamente dos criadores antes da revelação pública.",
    image: "/img/nfts/NFT%20Artwork%2003.png",
    search: { page: 1, tab: "new" },
  },
  {
    title: "Arte digital selecionada\ne muito mais",
    description:
      "Explore novos artistas, coleções verificadas e obras digitais que definem a cultura.",
    image: "/img/nfts/NFT%20Artwork%2005.png",
    search: { page: 1, collection: "Arte digital" },
  },
];

export function PromoBanners() {
  return (
    <section
      id="criadores"
      aria-label="Destaques dos criadores"
      className="mt-16 grid scroll-mt-24 gap-6 md:mt-20 md:grid-cols-2 md:gap-8"
    >
      {banners.map((banner) => (
        <article
          key={banner.title}
          className="grid grid-cols-[minmax(120px,0.8fr)_1fr] overflow-hidden rounded-2xl bg-card sm:grid-cols-[minmax(200px,287px)_1fr]"
        >
          <img
            src={banner.image}
            alt=""
            width={287}
            height={250}
            className="h-full min-h-[200px] w-full rounded-2xl object-cover"
          />
          <div className="flex flex-col items-end justify-center gap-3 p-5 text-right sm:p-7">
            <h3 className="m-0 text-base leading-snug font-bold whitespace-pre-line text-foreground sm:text-lg">
              {banner.title}
            </h3>
            <p className="text-xs leading-6 text-muted-foreground sm:text-sm">
              {banner.description}
            </p>
            <Link
              to="/"
              search={banner.search}
              hash="catalogo"
              className={cn(
                buttonVariants({ size: "lg" }),
                "mt-1 h-10 gap-1.5 rounded-[4px] px-6 text-sm font-semibold",
              )}
            >
              Explorar
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </article>
      ))}
    </section>
  );
}

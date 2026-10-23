import { Link } from "@tanstack/react-router";
import type { NFT } from "../types/nft";

export function FeaturedNft({ nft }: { nft?: NFT }) {
  if (!nft) {
    return null;
  }

  return (
    <section
      aria-labelledby="featured-nft-title"
      className="overflow-hidden rounded-[4px] bg-[#261910]"
    >
      <div className="px-5 pt-6 pb-4">
        <h2
          id="featured-nft-title"
          className="m-0 text-[22px] font-bold tracking-wide text-highlight uppercase"
        >
          NFT em destaque
        </h2>
        <p className="mt-2 text-center text-lg font-bold tracking-wide text-foreground uppercase">
          Oferta limitada
        </p>
      </div>
      <Link
        to="/nfts/$id"
        params={{ id: nft.id }}
        className="block focus-visible:outline-2 focus-visible:outline-highlight"
      >
        <img
          src={nft.image}
          alt={`${nft.name}, ${nft.price} ${nft.currency}, ${nft.available} disponíveis`}
          width={310}
          height={360}
          className="aspect-[310/360] w-full rounded-t-[20px] object-cover"
        />
      </Link>
    </section>
  );
}

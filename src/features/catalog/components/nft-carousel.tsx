import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { NFT } from "../types/nft";
import { NftCard } from "./nft-card";

export interface NftCarouselProps {
  title: string;
  items: NFT[];
  isLoading?: boolean;
  className?: string;
}

const SKELETON_COUNT = 5;

function CardSkeleton() {
  return (
    <div aria-hidden>
      <div className="rounded-[4px] bg-card px-1 pt-7 pb-5">
        <div className="aspect-square animate-pulse rounded-[20px] bg-secondary" />
      </div>
      <div className="mt-4 space-y-2 px-0.5">
        <div className="h-3.5 w-2/3 animate-pulse rounded bg-card" />
        <div className="h-4 w-1/3 animate-pulse rounded bg-card" />
      </div>
    </div>
  );
}

export function NftCarousel({
  title,
  items,
  isLoading = false,
  className,
}: NftCarouselProps) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [pages, setPages] = useState(1);
  const [activePage, setActivePage] = useState(0);

  useEffect(() => {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    function measure() {
      if (!track) {
        return;
      }

      const width = track.clientWidth || 1;
      setPages(Math.max(1, Math.ceil(track.scrollWidth / width)));
      setActivePage(Math.round(track.scrollLeft / width));
    }

    measure();
    track.addEventListener("scroll", measure, { passive: true });
    const observer = new ResizeObserver(measure);
    observer.observe(track);

    return () => {
      track.removeEventListener("scroll", measure);
      observer.disconnect();
    };
  }, [items.length]);

  function goToPage(page: number) {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    track.scrollTo({ left: page * track.clientWidth, behavior: "smooth" });
  }

  if (!isLoading && items.length === 0) {
    return null;
  }

  return (
    <section aria-label={title} className={className}>
      <h2 className="m-0 border-b border-border pb-3 text-[15px] font-bold text-highlight">
        {title}
      </h2>

      <ul
        ref={trackRef}
        className="scrollbar-none mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto sm:gap-6 lg:gap-[25px]"
      >
        {isLoading
          ? Array.from({ length: SKELETON_COUNT }).map((_, index) => (
              <li
                key={index}
                className="w-[160px] shrink-0 snap-start sm:w-[200px] lg:w-[220px]"
              >
                <CardSkeleton />
              </li>
            ))
          : items.map((item) => (
              <li
                key={item.id}
                className="w-[160px] shrink-0 snap-start sm:w-[200px] lg:w-[220px]"
              >
                <NftCard nft={item} />
              </li>
            ))}
      </ul>

      {pages > 1 && (
        <div className="mt-8 flex justify-center gap-2.5">
          {Array.from({ length: pages }).map((_, index) => {
            const active = index === activePage;

            return (
              <button
                key={index}
                type="button"
                onClick={() => goToPage(index)}
                aria-label={`Ir para a página ${index + 1} de ${pages}`}
                aria-current={active ? "true" : undefined}
                className={cn(
                  "size-2.5 rounded-full border border-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight",
                  active ? "bg-primary" : "bg-transparent hover:bg-primary/40",
                )}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}

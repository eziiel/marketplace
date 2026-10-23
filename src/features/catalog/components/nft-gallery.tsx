import { useRef, useState, type MouseEvent } from "react";
import { X, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NftGalleryProps {
  images: string[];
  name: string;
  soldOut?: boolean;
  className?: string;
}

export function NftGallery({
  images,
  name,
  soldOut = false,
  className,
}: NftGalleryProps) {
  const [index, setIndex] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const current = images[Math.min(index, images.length - 1)];

  function closeOnBackdrop(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) {
      dialogRef.current?.close();
    }
  }

  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-4 md:flex-row md:gap-7",
        className,
      )}
    >
      {images.length > 1 && (
        <ul
          aria-label="Miniaturas"
          className="scrollbar-none flex gap-3 overflow-x-auto md:w-[100px] md:shrink-0 md:flex-col md:gap-4 md:overflow-visible"
        >
          {images.map((image, position) => {
            const active = position === index;

            return (
              <li key={`${image}-${position}`} className="shrink-0">
                <button
                  type="button"
                  onClick={() => setIndex(position)}
                  aria-label={`Imagem ${position + 1} de ${images.length}`}
                  aria-pressed={active}
                  className={cn(
                    "block size-[72px] overflow-hidden rounded-[6px] border-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight md:size-[100px]",
                    active
                      ? "border-primary"
                      : "border-transparent hover:border-primary/50",
                  )}
                >
                  <img
                    src={image}
                    alt=""
                    width={100}
                    height={100}
                    className="size-full object-cover"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="min-w-0 flex-1 rounded-[4px] bg-card p-4 md:p-6">
        <div className="relative aspect-square overflow-hidden rounded-[20px] bg-secondary">
          <img
            src={current}
            alt={name}
            width={400}
            height={400}
            className="size-full object-cover"
          />
          {soldOut && (
            <span className="absolute top-4 left-4 rounded-[4px] bg-background/85 px-3 py-1 text-xs font-semibold text-foreground">
              Esgotado
            </span>
          )}
          <button
            type="button"
            onClick={() => dialogRef.current?.showModal()}
            aria-label="Ampliar imagem"
            className="absolute top-3 right-3 grid size-8 place-items-center rounded-full bg-background/85 text-foreground transition-colors hover:bg-background focus-visible:outline-2 focus-visible:outline-highlight"
          >
            <ZoomIn className="size-4" aria-hidden />
          </button>
        </div>
      </div>

      <dialog
        ref={dialogRef}
        aria-label={`${name} ampliado`}
        onClick={closeOnBackdrop}
        className="m-auto max-h-[90vh] max-w-[90vw] rounded-[8px] bg-card p-3 backdrop:bg-black/80"
      >
        <img
          src={current}
          alt={name}
          className="max-h-[80vh] w-auto max-w-full rounded-[12px] object-contain"
        />
        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          aria-label="Fechar"
          className="absolute top-5 right-5 grid size-9 place-items-center rounded-full bg-background/85 text-foreground transition-colors hover:bg-background focus-visible:outline-2 focus-visible:outline-highlight"
        >
          <X className="size-4" aria-hidden />
        </button>
      </dialog>
    </div>
  );
}

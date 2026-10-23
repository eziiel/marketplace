import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NftRatingProps {
  average: number;
  count?: number;
  size?: "sm" | "md";
  className?: string;
}

export function NftRating({
  average,
  count,
  size = "md",
  className,
}: NftRatingProps) {
  const filled = Math.round(average);
  const label =
    count === undefined
      ? `${average} de 5`
      : `${average} de 5, ${count} ${count === 1 ? "avaliação" : "avaliações"}`;

  return (
    <span
      role="img"
      aria-label={label}
      className={cn("inline-flex items-center gap-0.5", className)}
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          aria-hidden
          className={cn(
            size === "sm" ? "size-3.5" : "size-4",
            index < filled
              ? "fill-primary text-primary"
              : "fill-transparent text-primary/50",
          )}
        />
      ))}
    </span>
  );
}

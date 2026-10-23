import { cn } from "@/lib/utils";
import { formatEth } from "../lib/price";

export interface PriceRangeValue {
  min: number;
  max: number;
}

interface PriceRangeProps {
  bounds: PriceRangeValue;
  value: PriceRangeValue;
  onChange: (value: PriceRangeValue) => void;
  disabled?: boolean;
}

const thumbClass =
  "pointer-events-none absolute inset-x-0 top-1/2 m-0 h-4 w-full -translate-y-1/2 appearance-none bg-transparent focus-visible:outline-none disabled:cursor-not-allowed [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-background [&::-moz-range-thumb]:bg-primary [&::-moz-range-track]:bg-transparent [&::-webkit-slider-runnable-track]:h-4 [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:bg-primary [&:focus-visible::-moz-range-thumb]:ring-2 [&:focus-visible::-moz-range-thumb]:ring-highlight [&:focus-visible::-webkit-slider-thumb]:ring-2 [&:focus-visible::-webkit-slider-thumb]:ring-highlight";

export function PriceRange({
  bounds,
  value,
  onChange,
  disabled = false,
}: PriceRangeProps) {
  const span = Math.max(bounds.max - bounds.min, 1);
  const start = ((value.min - bounds.min) / span) * 100;
  const end = ((value.max - bounds.min) / span) * 100;

  return (
    <div className="relative h-6">
      <div
        aria-hidden
        className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-primary/35"
      />
      <div
        aria-hidden
        className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-primary"
        style={{ left: `${start}%`, right: `${100 - end}%` }}
      />
      <input
        type="range"
        min={bounds.min}
        max={bounds.max}
        step={1}
        value={value.min}
        disabled={disabled}
        aria-label="Preço mínimo"
        aria-valuetext={`${formatEth(value.min)} ETH`}
        onChange={(event) =>
          onChange({
            min: Math.min(Number(event.target.value), value.max),
            max: value.max,
          })
        }
        className={cn(thumbClass, "z-10")}
      />
      <input
        type="range"
        min={bounds.min}
        max={bounds.max}
        step={1}
        value={value.max}
        disabled={disabled}
        aria-label="Preço máximo"
        aria-valuetext={`${formatEth(value.max)} ETH`}
        onChange={(event) =>
          onChange({
            min: value.min,
            max: Math.max(Number(event.target.value), value.min),
          })
        }
        className={cn(thumbClass, "z-20")}
      />
    </div>
  );
}

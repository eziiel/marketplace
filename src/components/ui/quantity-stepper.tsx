import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface QuantityStepperProps {
  value: number;
  onDecrement: () => void;
  onIncrement: () => void;
  disableDecrement?: boolean;
  disableIncrement?: boolean;
  label?: string;
  className?: string;
}

const stepButton =
  "grid size-8 place-items-center rounded-full text-foreground transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40";

export function QuantityStepper({
  value,
  onDecrement,
  onIncrement,
  disableDecrement,
  disableIncrement,
  label = "Quantidade",
  className,
}: QuantityStepperProps) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-border bg-card p-1",
        className,
      )}
    >
      <button
        type="button"
        onClick={onDecrement}
        disabled={disableDecrement}
        aria-label="Diminuir quantidade"
        className={stepButton}
      >
        <Minus className="size-4" aria-hidden />
      </button>
      <span
        aria-live="polite"
        className="min-w-8 text-center text-sm font-semibold text-foreground tabular-nums"
      >
        {value}
      </span>
      <button
        type="button"
        onClick={onIncrement}
        disabled={disableIncrement}
        aria-label="Aumentar quantidade"
        className={stepButton}
      >
        <Plus className="size-4" aria-hidden />
      </button>
    </div>
  );
}

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface QuantityStepperProps {
  value: number;
  onDecrement: () => void;
  onIncrement: () => void;
  disableDecrement?: boolean;
  disableIncrement?: boolean;
  label?: string;
  size?: "sm" | "lg";
  className?: string;
}

const stepButton =
  "grid shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight disabled:pointer-events-none disabled:opacity-40";

const sizes = {
  sm: {
    button: "size-5",
    icon: "size-3",
    value: "min-w-6 text-sm",
  },
  lg: {
    button: "size-10",
    icon: "size-5",
    value: "min-w-10 text-lg",
  },
};

export function QuantityStepper({
  value,
  onDecrement,
  onIncrement,
  disableDecrement,
  disableIncrement,
  label = "Quantidade",
  size = "lg",
  className,
}: QuantityStepperProps) {
  const style = sizes[size];

  return (
    <div
      role="group"
      aria-label={label}
      className={cn("inline-flex items-center gap-1", className)}
    >
      <button
        type="button"
        onClick={onDecrement}
        disabled={disableDecrement}
        aria-label="Diminuir quantidade"
        className={cn(stepButton, style.button)}
      >
        <Minus className={style.icon} strokeWidth={3} aria-hidden />
      </button>
      <span
        aria-live="polite"
        className={cn(
          "text-center font-semibold text-foreground tabular-nums",
          style.value,
        )}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={onIncrement}
        disabled={disableIncrement}
        aria-label="Aumentar quantidade"
        className={cn(stepButton, style.button)}
      >
        <Plus className={style.icon} strokeWidth={3} aria-hidden />
      </button>
    </div>
  );
}

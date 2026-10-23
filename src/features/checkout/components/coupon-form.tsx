import { useState, type FormEvent } from "react";
import { cn } from "@/lib/utils";
import type { CouponStatus } from "../types/quote";

export interface CouponFormProps {
  appliedCoupon: string | null;
  status?: CouponStatus;
  onApply: (code: string) => void;
  onRemove: () => void;
  label?: string;
  className?: string;
}

export function CouponForm({
  appliedCoupon,
  status = "none",
  onApply,
  onRemove,
  label = "Código promocional",
  className,
}: CouponFormProps) {
  const [code, setCode] = useState(appliedCoupon ?? "");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onApply(code.trim());
  }

  const applied = appliedCoupon !== null && status === "applied";
  const invalid = status === "invalid" || status === "expired";

  return (
    <form onSubmit={handleSubmit} className={className}>
      <label htmlFor="coupon" className="text-sm text-muted-foreground">
        {label}
      </label>
      <div className="mt-2 flex">
        <input
          id="coupon"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="Digite o código promocional..."
          autoComplete="off"
          aria-describedby="coupon-status"
          aria-invalid={invalid || undefined}
          className="h-[38px] w-full min-w-0 rounded-l-[4px] border border-foreground/70 bg-transparent px-3 text-xs text-foreground placeholder:text-muted-foreground focus-visible:border-highlight focus-visible:outline-none aria-invalid:border-destructive"
        />
        <button
          type="submit"
          className="h-[38px] shrink-0 rounded-r-[4px] bg-primary px-5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/85 focus-visible:outline-2 focus-visible:outline-highlight"
        >
          Aplicar
        </button>
      </div>
      <p
        id="coupon-status"
        aria-live="polite"
        className={cn(
          "mt-2 min-h-5 text-xs",
          invalid ? "text-destructive" : "text-highlight",
        )}
      >
        {applied && (
          <>
            Cupom {appliedCoupon} aplicado.{" "}
            <button
              type="button"
              onClick={() => {
                setCode("");
                onRemove();
              }}
              className="underline underline-offset-2 hover:text-foreground"
            >
              Remover
            </button>
          </>
        )}
        {status === "invalid" && "Cupom inválido."}
        {status === "expired" && "Cupom expirado."}
      </p>
    </form>
  );
}

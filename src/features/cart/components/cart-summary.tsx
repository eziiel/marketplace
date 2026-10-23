import { Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { CouponForm } from "@/features/checkout/components/coupon-form";
import type { Quote } from "@/features/checkout/types/quote";

export interface CartSummaryProps {
  quote?: Quote;
  isPending: boolean;
  isFetching: boolean;
  errorMessage?: string;
  onRetry: () => void;
  appliedCoupon: string | null;
  onApplyCoupon: (code: string) => void;
  onRemoveCoupon: () => void;
}

function Line({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-[15px] text-foreground tabular-nums">{value}</dd>
    </div>
  );
}

export function CartSummary({
  quote,
  isPending,
  isFetching,
  errorMessage,
  onRetry,
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
}: CartSummaryProps) {
  const currency = quote?.currency ?? "ETH";

  return (
    <section aria-labelledby="cart-summary-title">
      <h2
        id="cart-summary-title"
        className="m-0 border-b border-border pb-2 text-lg font-normal text-foreground"
      >
        Resumo da carteira
      </h2>

      <CouponForm
        appliedCoupon={appliedCoupon}
        status={quote?.couponStatus}
        onApply={onApplyCoupon}
        onRemove={onRemoveCoupon}
        className="mt-6"
      />

      {isPending && !errorMessage && (
        <div aria-label="Calculando resumo" className="mt-4 space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-5 animate-pulse rounded bg-card" />
          ))}
        </div>
      )}

      {errorMessage && (
        <div className="mt-4 space-y-3">
          <p role="alert" className="text-sm text-destructive">
            Não foi possível calcular o resumo: {errorMessage}
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="text-sm font-bold text-highlight underline underline-offset-4 hover:text-foreground"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {quote && (
        <>
          <dl
            aria-busy={isFetching}
            className={cn("mt-4 space-y-3", isFetching && "opacity-60")}
          >
            <Line label="Subtotal" value={`${quote.subtotal} ${currency}`} />
            <Line
              label="Desconto do lançamento"
              value={`(-) ${quote.discount} ${currency}`}
            />
            <Line
              label="Taxa de rede"
              value={`${quote.networkFee} ${currency}`}
            />
            <p className="flex items-center justify-end gap-1.5 text-xs text-highlight">
              {isFetching && (
                <Loader2 className="size-3 animate-spin" aria-hidden />
              )}
              Taxa estimada
            </p>
            <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
              <dt className="text-[15px] text-muted-foreground">Total</dt>
              <dd className="text-xl font-bold text-highlight tabular-nums">
                {quote.total} {currency}
              </dd>
            </div>
          </dl>

          {quote.hasAvailabilityIssue && (
            <p role="alert" className="mt-3 text-xs text-destructive">
              Um ou mais itens excedem a disponibilidade atual. Ajuste as
              quantidades para continuar.
            </p>
          )}
        </>
      )}

      <Link
        to="/checkout"
        className="mt-6 flex h-10 w-full items-center justify-center rounded-[4px] bg-primary text-[15px] font-bold text-primary-foreground transition-colors hover:bg-primary/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight"
      >
        Conectar e finalizar
      </Link>
      <Link
        to="/"
        search={{ page: 1 }}
        hash="catalogo"
        className="mt-4 block text-center text-[15px] text-highlight transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-highlight"
      >
        Continuar explorando
      </Link>
    </section>
  );
}

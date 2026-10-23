import { Link } from "@tanstack/react-router";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

export interface CartSummaryProps {
  subtotal: string;
  currency: string;
  itemCount: number;
}

export function CartSummary({ subtotal, currency, itemCount }: CartSummaryProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h2 className="m-0 text-lg font-semibold text-foreground">Resumo</h2>

      <dl className="mt-4 space-y-3 border-t border-border pt-4 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">
            Subtotal ({itemCount} {itemCount === 1 ? "item" : "itens"})
          </dt>
          <dd className="font-semibold text-foreground">
            {subtotal} {currency}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
          <dt className="font-medium text-foreground">Total</dt>
          <dd className="text-lg font-bold text-primary">
            {subtotal} {currency}
          </dd>
        </div>
      </dl>

      <p className="mt-3 text-xs text-muted-foreground">
        Taxas de rede e descontos são calculados no checkout.
      </p>

      <Link
        to="/checkout"
        className={cn(buttonVariants({ size: "lg" }), "mt-5 h-11 w-full text-sm")}
      >
        Finalizar compra
      </Link>
      <Link
        to="/"
        search={{ page: 1 }}
        className={cn(
          buttonVariants({ variant: "ghost", size: "lg" }),
          "mt-2 h-10 w-full text-sm text-muted-foreground",
        )}
      >
        Continuar explorando
      </Link>
    </div>
  );
}

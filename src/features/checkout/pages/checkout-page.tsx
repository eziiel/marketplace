import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import axios from "axios";
import { ChevronRight, Loader2, Tag, TriangleAlert } from "lucide-react";

import { Container } from "@/components/layout/container";
import { SiteHeader } from "@/components/layout/site-header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

import { getAuthToken } from "@/features/auth/lib/auth-token";
import { useAuthMe } from "@/features/auth/hooks/use-auth-me";
import { useLogout } from "@/features/auth/hooks/use-logout";

import { useNetworks } from "../hooks/use-networks";
import { useQuote } from "../hooks/use-quote";
import { useCreateOrder } from "../hooks/use-create-order";

function messageFromError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;

    return data?.message ?? error.message;
  }

  return "Erro inesperado";
}

function CheckoutShell({ children }: { children: ReactNode }) {
  const isAuthenticated = Boolean(getAuthToken());
  const authMe = useAuthMe();
  const logoutMutation = useLogout();

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader
        isAuthenticated={isAuthenticated}
        userName={authMe.data?.user.name}
        onLogout={() => logoutMutation.mutate()}
      />
      <main className="flex-1 pb-24 md:pb-12">
        <Container className="py-6 md:py-10">{children}</Container>
      </main>
      <MobileNav />
    </div>
  );
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const networksQuery = useNetworks();

  const [selectedNetworkId, setSelectedNetworkId] = useState<string | null>(
    null,
  );
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  const networkId = selectedNetworkId ?? networksQuery.data?.[0]?.id ?? "";

  const quoteQuery = useQuote(
    { networkId, couponCode: appliedCoupon },
    { enabled: Boolean(networkId) },
  );
  const quote = quoteQuery.data;

  const createOrder = useCreateOrder();
  const idempotencyKeyRef = useRef(crypto.randomUUID());

  useEffect(() => {
    if (quote?.id) {
      idempotencyKeyRef.current = crypto.randomUUID();
    }
  }, [quote?.id]);

  function handleApplyCoupon(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = couponInput.trim();
    setAppliedCoupon(trimmed.length > 0 ? trimmed : null);
  }

  function handleConfirm() {
    if (!quote) {
      return;
    }

    createOrder.mutate(
      { quoteId: quote.id, idempotencyKey: idempotencyKeyRef.current },
      {
        onSuccess: (order) => {
          void navigate({
            to: "/orders/$orderId",
            params: { orderId: order.id },
          });
        },
      },
    );
  }

  if (networksQuery.isPending) {
    return (
      <CheckoutShell>
        <div className="flex items-center justify-center gap-2 rounded-3xl border border-border bg-card px-6 py-20 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Carregando checkout...
        </div>
      </CheckoutShell>
    );
  }

  if (networksQuery.isError) {
    return (
      <CheckoutShell>
        <div
          role="alert"
          className="flex flex-col items-center gap-3 rounded-3xl border border-destructive/30 bg-destructive/10 px-6 py-16 text-center"
        >
          <TriangleAlert className="size-6 text-destructive" aria-hidden />
          <p className="text-sm text-destructive">
            Erro ao carregar redes: {messageFromError(networksQuery.error)}
          </p>
        </div>
      </CheckoutShell>
    );
  }

  const showQuoteLoading = !quote && !quoteQuery.isError;

  return (
    <CheckoutShell>
      <nav
        aria-label="Trilha"
        className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground"
      >
        <Link to="/" search={{ page: 1 }} className="hover:text-foreground">
          Início
        </Link>
        <ChevronRight className="size-3.5" aria-hidden />
        <Link to="/cart" className="hover:text-foreground">
          Carrinho
        </Link>
        <ChevronRight className="size-3.5" aria-hidden />
        <span className="text-foreground">Pagamento</span>
      </nav>

      <h1 className="m-0 mb-6 text-2xl font-bold text-foreground md:text-3xl">
        Finalizar compra
      </h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px] lg:items-start">
        <div className="space-y-6">
          <fieldset className="rounded-2xl border border-border bg-card p-5">
            <legend className="px-1 text-sm font-semibold text-foreground">
              Rede
            </legend>
            <div className="mt-2 grid gap-3">
              {networksQuery.data.map((network) => {
                const selected = network.id === networkId;

                return (
                  <label
                    key={network.id}
                    className={cn(
                      "flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 transition-colors",
                      selected
                        ? "border-primary bg-primary/10"
                        : "border-border bg-background hover:border-primary/40",
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        aria-hidden
                        className={cn(
                          "grid size-4 shrink-0 place-items-center rounded-full border",
                          selected
                            ? "border-primary"
                            : "border-muted-foreground",
                        )}
                      >
                        {selected && (
                          <span className="size-2 rounded-full bg-primary" />
                        )}
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {network.label}
                      </span>
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Taxa {network.fee} ETH
                    </span>
                    <input
                      type="radio"
                      name="network"
                      value={network.id}
                      checked={selected}
                      onChange={() => setSelectedNetworkId(network.id)}
                      className="sr-only"
                    />
                  </label>
                );
              })}
            </div>
          </fieldset>

          <form
            onSubmit={handleApplyCoupon}
            className="rounded-2xl border border-border bg-card p-5"
          >
            <label
              htmlFor="coupon"
              className="text-sm font-semibold text-foreground"
            >
              Cupom de desconto
            </label>
            <div className="mt-2 flex gap-2">
              <Input
                id="coupon"
                value={couponInput}
                onChange={(event) => setCouponInput(event.target.value)}
                placeholder="Código do cupom"
                className="flex-1"
              />
              <button
                type="submit"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-11 px-4 text-sm",
                )}
              >
                Aplicar cupom
              </button>
            </div>
          </form>
        </div>

        <aside className="lg:sticky lg:top-20">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="m-0 text-lg font-semibold text-foreground">
              Resumo do pedido
            </h2>

            {showQuoteLoading && (
              <div className="mt-4 flex items-center gap-2 border-t border-border pt-4 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Calculando cotação...
              </div>
            )}

            {quoteQuery.isError && (
              <div className="mt-4 space-y-3 border-t border-border pt-4">
                <p
                  role="alert"
                  className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                  <TriangleAlert className="size-4 shrink-0" aria-hidden />
                  {messageFromError(quoteQuery.error)}
                </p>
                <Link
                  to="/"
                  search={{ search: "", page: 1, sort: "price_asc" }}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "h-10 w-full text-sm",
                  )}
                >
                  Voltar ao catálogo
                </Link>
              </div>
            )}

            {quote && (
              <>
                <ul className="mt-4 space-y-3 border-t border-border pt-4">
                  {quote.items.map((item) => (
                    <li
                      key={`${item.nftId}-${item.edition}`}
                      className="flex items-start justify-between gap-3 text-sm"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-foreground">
                          {item.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {item.edition} · {item.quantity} × {item.unitPrice}{" "}
                          {quote.currency}
                        </span>
                        {!item.availabilityOk && (
                          <span
                            role="alert"
                            className="mt-0.5 block text-xs font-medium text-destructive"
                          >
                            Estoque insuficiente
                          </span>
                        )}
                      </span>
                      <span className="shrink-0 font-semibold text-foreground">
                        {item.lineTotal} {quote.currency}
                      </span>
                    </li>
                  ))}
                </ul>

                {quote.couponStatus === "applied" && (
                  <p className="mt-3 flex items-center gap-1.5 text-sm text-primary">
                    <Tag className="size-3.5" aria-hidden />
                    Cupom {quote.couponCode} aplicado
                  </p>
                )}
                {quote.couponStatus === "invalid" && (
                  <p role="alert" className="mt-3 text-sm text-destructive">
                    Cupom inválido
                  </p>
                )}
                {quote.couponStatus === "expired" && (
                  <p role="alert" className="mt-3 text-sm text-destructive">
                    Cupom expirado
                  </p>
                )}

                <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Subtotal</dt>
                    <dd className="text-foreground">
                      {quote.subtotal} {quote.currency}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Desconto</dt>
                    <dd className="text-foreground">
                      {quote.discount} {quote.currency}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Taxa de rede</dt>
                    <dd className="text-foreground">
                      {quote.networkFee} {quote.currency}
                    </dd>
                  </div>
                </dl>

                <p className="mt-4 flex items-baseline justify-between gap-3 border-t border-border pt-4">
                  <span className="text-sm font-semibold text-foreground">
                    Total:
                  </span>{" "}
                  <span className="text-xl font-bold text-primary">
                    {quote.total} {quote.currency}
                  </span>
                </p>

                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={
                    createOrder.isPending ||
                    quote.hasAvailabilityIssue ||
                    quoteQuery.isFetching
                  }
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "mt-5 h-11 w-full text-sm",
                  )}
                >
                  {createOrder.isPending
                    ? "Processando..."
                    : "Confirmar pedido"}
                </button>

                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Pagamento simulado para fins de demonstração.
                </p>

                {createOrder.isError && (
                  <div className="mt-3 space-y-2">
                    <p
                      role="alert"
                      className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                    >
                      <TriangleAlert className="size-4 shrink-0" aria-hidden />
                      {messageFromError(createOrder.error)}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        createOrder.reset();
                        void quoteQuery.refetch();
                      }}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "lg" }),
                        "h-10 w-full text-sm",
                      )}
                    >
                      Refazer cotação
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </aside>
      </div>
    </CheckoutShell>
  );
}

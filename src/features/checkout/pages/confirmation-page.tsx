import type { ReactNode } from "react";
import { Link, useParams } from "@tanstack/react-router";
import axios from "axios";
import {
  CheckCircle2,
  ExternalLink,
  Loader2,
  TriangleAlert,
  XCircle,
} from "lucide-react";

import { Container } from "@/components/layout/container";
import { SiteHeader } from "@/components/layout/site-header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

import { getAuthToken } from "@/features/auth/lib/auth-token";
import { useAuthMe } from "@/features/auth/hooks/use-auth-me";
import { useLogout } from "@/features/auth/hooks/use-logout";

import { useOrder } from "../hooks/use-order";
import { useReceipt } from "../hooks/use-receipt";
import { useNetworks } from "../hooks/use-networks";

function ConfirmationShell({ children }: { children: ReactNode }) {
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

function formatDate(value: string | null): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  const day = date.toLocaleDateString("pt-BR", { day: "2-digit" });
  const month = date
    .toLocaleDateString("pt-BR", { month: "short" })
    .replace(".", "");

  return `${day} ${month} ${date.getFullYear()}`;
}

export function ConfirmationPage() {
  const { orderId } = useParams({ from: "/orders/$orderId" });
  const orderQuery = useOrder(orderId);
  const order = orderQuery.data;

  const receiptQuery = useReceipt(orderId, {
    enabled: order?.status === "confirmed",
  });
  const receipt = receiptQuery.data;

  const networksQuery = useNetworks();
  const networkLabel =
    networksQuery.data?.find((network) => network.id === order?.networkId)
      ?.label ?? order?.networkId;

  if (orderQuery.isPending) {
    return (
      <ConfirmationShell>
        <div className="mx-auto flex max-w-lg items-center justify-center gap-2 rounded-3xl border border-border bg-card px-6 py-20 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Carregando pedido...
        </div>
      </ConfirmationShell>
    );
  }

  if (orderQuery.isError) {
    const notFound =
      axios.isAxiosError(orderQuery.error) &&
      orderQuery.error.response?.status === 404;

    return (
      <ConfirmationShell>
        <div
          role="alert"
          className="mx-auto flex max-w-lg flex-col items-center gap-3 rounded-3xl border border-border bg-card px-6 py-16 text-center"
        >
          <TriangleAlert className="size-6 text-destructive" aria-hidden />
          <p className="text-base font-semibold text-foreground">
            {notFound ? "Pedido não encontrado." : "Erro ao carregar pedido."}
          </p>
          <Link
            to="/"
            search={{ search: "", page: 1, sort: "price_asc" }}
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
          >
            Voltar ao catálogo
          </Link>
        </div>
      </ConfirmationShell>
    );
  }

  if (!order) {
    return null;
  }

  if (order.status === "refused") {
    return (
      <ConfirmationShell>
        <div className="mx-auto flex max-w-lg flex-col items-center gap-4 rounded-3xl border border-destructive/30 bg-card px-6 py-12 text-center">
          <span className="grid size-14 place-items-center rounded-full bg-destructive/10 text-destructive">
            <XCircle className="size-7" aria-hidden />
          </span>
          <h1 className="m-0 text-2xl font-bold text-foreground">
            Pagamento recusado
          </h1>
          <p className="text-sm text-muted-foreground">
            {order.refusalReason ?? "Não foi possível concluir o pagamento."}
          </p>
          <p className="text-sm text-muted-foreground">
            Seu carrinho foi preservado.
          </p>
          <div className="mt-2 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/checkout"
              className={cn(buttonVariants({ size: "lg" }), "h-11 px-6 text-sm")}
            >
              Tentar novamente
            </Link>
            <Link
              to="/cart"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-11 px-6 text-sm",
              )}
            >
              Voltar ao carrinho
            </Link>
          </div>
        </div>
      </ConfirmationShell>
    );
  }

  if (order.status === "pending") {
    return (
      <ConfirmationShell>
        <div className="mx-auto flex max-w-lg flex-col items-center gap-4 rounded-3xl border border-border bg-card px-6 py-16 text-center">
          <span className="grid size-14 place-items-center rounded-full bg-primary/10 text-primary">
            <Loader2 className="size-7 animate-spin" aria-hidden />
          </span>
          <h1 className="m-0 text-2xl font-bold text-foreground">
            Pedido pendente
          </h1>
          <p className="text-sm text-muted-foreground">
            Aguardando confirmação do pagamento...
          </p>
        </div>
      </ConfirmationShell>
    );
  }

  return (
    <ConfirmationShell>
      <div className="mx-auto max-w-lg overflow-hidden rounded-3xl border border-border bg-card">
        <div className="flex flex-col items-center gap-3 border-b border-border px-6 py-8 text-center">
          <span className="grid size-14 place-items-center rounded-full bg-primary/10 text-primary">
            <CheckCircle2 className="size-7" aria-hidden />
          </span>
          <h1 className="m-0 text-2xl font-bold text-foreground">
            Pedido confirmado
          </h1>
          <p className="text-sm text-muted-foreground">
            Seus NFTs agora estão na sua carteira.
          </p>
          <p className="text-xs text-muted-foreground">Pedido: {order.id}</p>
        </div>

        <dl className="grid grid-cols-3 gap-px bg-border">
          <div className="bg-card px-4 py-3">
            <dt className="text-xs text-muted-foreground">Data</dt>
            <dd className="mt-0.5 text-sm font-medium text-foreground">
              {formatDate(order.confirmedAt)}
            </dd>
          </div>
          <div className="bg-card px-4 py-3">
            <dt className="text-xs text-muted-foreground">Total</dt>
            <dd className="mt-0.5 text-sm font-medium text-primary">
              {order.totals.total} {order.totals.currency}
            </dd>
          </div>
          <div className="bg-card px-4 py-3">
            <dt className="text-xs text-muted-foreground">Rede</dt>
            <dd className="mt-0.5 truncate text-sm font-medium text-foreground">
              {networkLabel}
            </dd>
          </div>
        </dl>

        <div className="px-6 py-6">
          <h2 className="m-0 text-sm font-semibold text-foreground">
            Detalhes da transação
          </h2>

          {receiptQuery.isPending && (
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Carregando recibo...
            </div>
          )}

          {receipt && (
            <>
              <ul className="mt-4 space-y-3 border-t border-border pt-4">
                {receipt.items.map((item) => (
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
                        {receipt.totals.currency}
                      </span>
                    </span>
                    <span className="shrink-0 font-semibold text-foreground">
                      {item.lineTotal} {receipt.totals.currency}
                    </span>
                  </li>
                ))}
              </ul>

              <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="text-foreground">
                    {receipt.totals.subtotal} {receipt.totals.currency}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Desconto</dt>
                  <dd className="text-foreground">
                    {receipt.totals.discount} {receipt.totals.currency}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Taxa de rede</dt>
                  <dd className="text-foreground">
                    {receipt.totals.networkFee} {receipt.totals.currency}
                  </dd>
                </div>
              </dl>

              <p className="mt-4 flex items-baseline justify-between gap-3 border-t border-border pt-4">
                <span className="text-sm font-semibold text-foreground">
                  Total:
                </span>{" "}
                <span className="text-xl font-bold text-primary">
                  {receipt.totals.total} {receipt.totals.currency}
                </span>
              </p>

              {receipt.transactionHash && (
                <p className="mt-4 rounded-xl border border-border bg-background px-3 py-2 text-xs break-all text-muted-foreground">
                  Transação: {receipt.transactionHash}
                </p>
              )}

              <p className="mt-3 text-xs text-muted-foreground">
                Transação simulada e confirmada na rede {networkLabel} para fins
                de demonstração.
              </p>

              {receipt.explorerUrl && (
                <a
                  href={receipt.explorerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "mt-4 h-11 w-full gap-2 text-sm",
                  )}
                >
                  <ExternalLink className="size-4" aria-hidden />
                  Ver no explorador
                </a>
              )}
            </>
          )}

          <Link
            to="/"
            search={{ search: "", page: 1, sort: "price_asc" }}
            className={cn(
              buttonVariants({ size: "lg" }),
              "mt-3 h-11 w-full text-sm",
            )}
          >
            Voltar ao catálogo
          </Link>
        </div>
      </div>
    </ConfirmationShell>
  );
}

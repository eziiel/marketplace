import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import axios from "axios";
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

export function CheckoutPage() {
  const navigate = useNavigate();
  const networksQuery = useNetworks();

  const [networkId, setNetworkId] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  useEffect(() => {
    const first = networksQuery.data?.[0];

    if (!networkId && first) {
      setNetworkId(first.id);
    }
  }, [networkId, networksQuery.data]);

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
    return <p>Carregando checkout...</p>;
  }

  if (networksQuery.isError) {
    return (
      <p role="alert">
        Erro ao carregar redes: {messageFromError(networksQuery.error)}
      </p>
    );
  }

  return (
    <main>
      <h1>Finalizar compra</h1>

      <label htmlFor="network">Rede</label>
      <select
        id="network"
        value={networkId}
        onChange={(event) => setNetworkId(event.target.value)}
      >
        {networksQuery.data.map((network) => (
          <option key={network.id} value={network.id}>
            {network.label}
          </option>
        ))}
      </select>

      <form onSubmit={handleApplyCoupon}>
        <label htmlFor="coupon">Cupom</label>
        <input
          id="coupon"
          value={couponInput}
          onChange={(event) => setCouponInput(event.target.value)}
          placeholder="Código do cupom"
        />
        <button type="submit">Aplicar cupom</button>
      </form>

      {quoteQuery.isLoading && <p>Calculando cotação...</p>}

      {quoteQuery.isError && (
        <div>
          <p role="alert">{messageFromError(quoteQuery.error)}</p>
          <Link to="/" search={{ search: "", page: 1, sort: "price_asc" }}>
            Voltar ao catálogo
          </Link>
        </div>
      )}

      {quote && (
        <section>
          <h2>Resumo</h2>

          <ul>
            {quote.items.map((item) => (
              <li key={`${item.nftId}-${item.edition}`}>
                {item.name} — {item.edition} — {item.quantity} × {item.unitPrice}{" "}
                {quote.currency} = {item.lineTotal} {quote.currency}
                {!item.availabilityOk && (
                  <span role="alert"> (estoque insuficiente)</span>
                )}
              </li>
            ))}
          </ul>

          {quote.couponStatus === "applied" && (
            <p>Cupom {quote.couponCode} aplicado</p>
          )}
          {quote.couponStatus === "invalid" && (
            <p role="alert">Cupom inválido</p>
          )}
          {quote.couponStatus === "expired" && (
            <p role="alert">Cupom expirado</p>
          )}

          <p>
            Subtotal: {quote.subtotal} {quote.currency}
          </p>
          <p>
            Desconto: {quote.discount} {quote.currency}
          </p>
          <p>
            Taxa de rede: {quote.networkFee} {quote.currency}
          </p>
          <p>
            <strong>
              Total: {quote.total} {quote.currency}
            </strong>
          </p>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={
              createOrder.isPending ||
              quote.hasAvailabilityIssue ||
              quoteQuery.isFetching
            }
          >
            {createOrder.isPending ? "Processando..." : "Confirmar pedido"}
          </button>

          {createOrder.isError && (
            <div>
              <p role="alert">{messageFromError(createOrder.error)}</p>
              <button
                type="button"
                onClick={() => {
                  createOrder.reset();
                  void quoteQuery.refetch();
                }}
              >
                Refazer cotação
              </button>
            </div>
          )}
        </section>
      )}
    </main>
  );
}

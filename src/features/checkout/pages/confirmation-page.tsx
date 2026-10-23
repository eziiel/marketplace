import { Link, useParams } from "@tanstack/react-router";
import axios from "axios";
import { useOrder } from "../hooks/use-order";
import { useReceipt } from "../hooks/use-receipt";

export function ConfirmationPage() {
  const { orderId } = useParams({ from: "/orders/$orderId" });
  const orderQuery = useOrder(orderId);
  const order = orderQuery.data;

  const receiptQuery = useReceipt(orderId, {
    enabled: order?.status === "confirmed",
  });
  const receipt = receiptQuery.data;

  if (orderQuery.isPending) {
    return <p>Carregando pedido...</p>;
  }

  if (orderQuery.isError) {
    if (
      axios.isAxiosError(orderQuery.error) &&
      orderQuery.error.response?.status === 404
    ) {
      return <p>Pedido não encontrado.</p>;
    }

    return <p role="alert">Erro ao carregar pedido.</p>;
  }

  if (!order) {
    return null;
  }

  if (order.status === "refused") {
    return (
      <main>
        <h1>Pagamento recusado</h1>
        <p>{order.refusalReason ?? "Não foi possível concluir o pagamento."}</p>
        <p>Seu carrinho foi preservado.</p>
        <Link to="/checkout">Tentar novamente</Link>
        <Link to="/cart">Voltar ao carrinho</Link>
      </main>
    );
  }

  if (order.status === "pending") {
    return (
      <main>
        <h1>Pedido pendente</h1>
        <p>Aguardando confirmação do pagamento...</p>
      </main>
    );
  }

  return (
    <main>
      <h1>Pedido confirmado</h1>
      <p>Pedido: {order.id}</p>

      {receiptQuery.isPending && <p>Carregando recibo...</p>}

      {receipt && (
        <section>
          <h2>Recibo</h2>

          <ul>
            {receipt.items.map((item) => (
              <li key={`${item.nftId}-${item.edition}`}>
                {item.name} — {item.edition} — {item.quantity} × {item.unitPrice}{" "}
                {receipt.totals.currency} = {item.lineTotal}{" "}
                {receipt.totals.currency}
              </li>
            ))}
          </ul>

          <p>
            Subtotal: {receipt.totals.subtotal} {receipt.totals.currency}
          </p>
          <p>
            Desconto: {receipt.totals.discount} {receipt.totals.currency}
          </p>
          <p>
            Taxa de rede: {receipt.totals.networkFee} {receipt.totals.currency}
          </p>
          <p>
            <strong>
              Total: {receipt.totals.total} {receipt.totals.currency}
            </strong>
          </p>

          {receipt.transactionHash && <p>Transação: {receipt.transactionHash}</p>}
          {receipt.explorerUrl && (
            <a href={receipt.explorerUrl} target="_blank" rel="noreferrer">
              Ver no explorador
            </a>
          )}
        </section>
      )}

      <Link to="/" search={{ search: "", page: 1, sort: "price_asc" }}>
        Voltar ao catálogo
      </Link>
    </main>
  );
}

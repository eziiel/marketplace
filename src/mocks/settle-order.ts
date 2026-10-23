import type { Order } from "@/features/checkout/types/order";
import { getOrder, saveOrder } from "./data/order-store";
import { getSessionCart, saveSessionCart } from "./data/cart-store";
import { decrementStock } from "./data/nft-store";
import { getScenario } from "./data/scenario-store";
import { emitNftUpdated, emitOrderUpdated } from "./socket/realtime";

export function settleOrder(userId: string, orderId: string): void {
  const order = getOrder(userId, orderId);

  if (!order || order.status !== "pending") {
    return;
  }

  if (getScenario() === "payment_refused") {
    const refused: Order = {
      ...order,
      status: "refused",
      version: order.version + 1,
      refusalReason: "Pagamento recusado",
    };

    saveOrder(userId, refused);
    emitOrderUpdated({ id: refused.id, version: refused.version });

    return;
  }

  const now = new Date().toISOString();
  const hash = `0x${crypto.randomUUID().replace(/-/g, "")}`;

  const confirmed: Order = {
    ...order,
    status: "confirmed",
    version: order.version + 1,
    confirmedAt: now,
    transactionHash: hash,
    explorerUrl: `https://etherscan.io/tx/${hash}`,
  };

  saveOrder(userId, confirmed);

  for (const line of confirmed.items) {
    const nft = decrementStock(line.nftId, line.edition, line.quantity);

    if (nft) {
      emitNftUpdated({
        id: nft.id,
        version: nft.version,
        price: nft.price,
        available: nft.available,
      });
    }
  }

  const cart = getSessionCart(`user:${userId}`);
  const purchased = new Set(
    confirmed.items.map((line) => `${line.nftId}:${line.edition}`),
  );

  cart.items = cart.items.filter(
    (item) => !purchased.has(`${item.nftId}:${item.edition}`),
  );
  saveSessionCart(`user:${userId}`, cart);

  emitOrderUpdated({ id: confirmed.id, version: confirmed.version });
}

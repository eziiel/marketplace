import { ws } from "msw/ws";
import { SocketIoExtension, type SocketIoMessage } from "./socket-io-extension";

export const realtimeLink = ws.link(/\/realtime\//, {
  extensions: [new SocketIoExtension()],
});

export const realtimeHandlers = [
  realtimeLink.addEventListener("connection", () => {}),
];

function broadcast(event: string, payload: unknown): void {
  const message: SocketIoMessage = { event, args: [payload] };
  realtimeLink.broadcast(message);
}

export interface NftUpdatedPayload {
  id: string;
  version: number;
  price: string;
  available: number;
}

export interface OrderUpdatedPayload {
  id: string;
  version: number;
}

export function emitNftUpdated(payload: NftUpdatedPayload): void {
  broadcast("nft.updated", payload);
}

export function emitOrderUpdated(payload: OrderUpdatedPayload): void {
  broadcast("order.updated", payload);
}

import { WebSocketExtension } from "msw/ws";
import type {
  WebSocketData,
  WebSocketExtensionContext,
  WebSocketExtensionResult,
} from "msw/ws";

export interface SocketIoMessage {
  event: string;
  args: unknown[];
}

const HANDSHAKE = {
  upgrades: [],
  pingInterval: 300000,
  pingTimeout: 200000,
  maxPayload: 1000000,
};

export class SocketIoExtension extends WebSocketExtension<SocketIoMessage> {
  match(context: WebSocketExtensionContext<SocketIoMessage>): boolean {
    return context.client.url.searchParams.has("EIO");
  }

  connect(): WebSocketExtensionResult<WebSocketData> {
    return `0${JSON.stringify({ sid: crypto.randomUUID(), ...HANDSHAKE })}`;
  }

  receive(data: WebSocketData): WebSocketExtensionResult<WebSocketData> {
    if (typeof data !== "string") {
      return undefined;
    }

    if (data.startsWith("40")) {
      return `40${JSON.stringify({ sid: crypto.randomUUID() })}`;
    }

    if (data === "2") {
      return "3";
    }

    return undefined;
  }

  encode(message: SocketIoMessage): WebSocketExtensionResult<WebSocketData> {
    return `42${JSON.stringify([message.event, ...message.args])}`;
  }

  decode(data: WebSocketData): WebSocketExtensionResult<SocketIoMessage> {
    if (typeof data !== "string" || !data.startsWith("42")) {
      return undefined;
    }

    try {
      const payload = JSON.parse(data.slice(2)) as [string, ...unknown[]];
      const [event, ...args] = payload;

      return { event, args };
    } catch {
      return undefined;
    }
  }
}

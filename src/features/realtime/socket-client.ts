import type { Socket } from "socket.io-client";

let socketPromise: Promise<Socket> | null = null;

export function getSocket(): Promise<Socket> {
  if (!socketPromise) {
    socketPromise = import("socket.io-client").then(({ io }) =>
      io(window.location.origin, {
        path: "/realtime/",
        transports: ["websocket"],
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 300,
      }),
    );
  }

  return socketPromise;
}

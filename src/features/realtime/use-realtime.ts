import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Socket } from "socket.io-client";
import type { NFT } from "@/features/catalog/types/nft";
import { getSocket } from "./socket-client";
import type { NftUpdatedEvent, OrderUpdatedEvent } from "./types";

function setReady(value: boolean): void {
  (window as unknown as { __realtimeReady?: boolean }).__realtimeReady = value;
}

export function useRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const lastSeen = new Map<string, number>();
    let active = true;
    let current: Socket | null = null;

    function applyIfNewer(key: string, version: number): boolean {
      const previous = lastSeen.get(key) ?? 0;

      if (version <= previous) {
        return false;
      }

      lastSeen.set(key, version);

      return true;
    }

    function handleNftUpdated(payload: NftUpdatedEvent) {
      if (!applyIfNewer(`nft:${payload.id}`, payload.version)) {
        return;
      }

      queryClient.setQueryData<NFT>(["nft", payload.id], (old) =>
        old
          ? { ...old, price: payload.price, available: payload.available }
          : old,
      );
      void queryClient.invalidateQueries({ queryKey: ["nfts"] });
      void queryClient.invalidateQueries({ queryKey: ["quote"] });
    }

    function handleOrderUpdated(payload: OrderUpdatedEvent) {
      if (!applyIfNewer(`order:${payload.id}`, payload.version)) {
        return;
      }

      if (queryClient.getQueryData(["order", payload.id])) {
        void queryClient.invalidateQueries({
          queryKey: ["order", payload.id],
        });
        void queryClient.invalidateQueries({
          queryKey: ["receipt", payload.id],
        });
      }
    }

    function handleConnect() {
      setReady(true);
      void queryClient.invalidateQueries({ queryKey: ["nfts"] });
      void queryClient.invalidateQueries({ queryKey: ["nft"] });
      void queryClient.invalidateQueries({ queryKey: ["cart"] });
      void queryClient.invalidateQueries({ queryKey: ["order"] });
    }

    function handleDisconnect() {
      setReady(false);
    }

    void getSocket().then((socket) => {
      if (!active) {
        return;
      }

      current = socket;
      socket.on("nft.updated", handleNftUpdated);
      socket.on("order.updated", handleOrderUpdated);
      socket.on("connect", handleConnect);
      socket.on("disconnect", handleDisconnect);

      if (socket.disconnected) {
        socket.connect();
      } else {
        handleConnect();
      }
    });

    return () => {
      active = false;

      if (current) {
        current.off("nft.updated", handleNftUpdated);
        current.off("order.updated", handleOrderUpdated);
        current.off("connect", handleConnect);
        current.off("disconnect", handleDisconnect);
      }
    };
  }, [queryClient]);
}

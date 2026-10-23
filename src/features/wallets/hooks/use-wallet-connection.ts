import { useCallback, useEffect, useRef, useState } from "react";

import { connectWallet, disconnectWallet } from "../api/connect-wallet";
import { apiErrorMessage } from "@/lib/api-error";

export type ConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "refused"
  | "disconnected";

export function useWalletConnection(walletId: string | null) {
  const [status, setStatus] = useState<ConnectionStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const activeId = useRef<string | null>(null);

  useEffect(() => {
    if (activeId.current !== walletId) {
      activeId.current = walletId;
      setStatus("idle");
      setMessage(null);
    }
  }, [walletId]);

  const connect = useCallback(async () => {
    if (!walletId) return;

    setStatus("connecting");
    setMessage(null);

    try {
      await connectWallet(walletId);

      if (activeId.current !== walletId) return;

      setStatus("connected");
      setMessage("Carteira conectada.");
    } catch (error) {
      if (activeId.current !== walletId) return;

      setStatus("refused");
      setMessage(
        apiErrorMessage(error, "Não foi possível conectar a carteira."),
      );
    }
  }, [walletId]);

  const disconnect = useCallback(async () => {
    if (!walletId) return;

    try {
      await disconnectWallet(walletId);
    } catch {
      setMessage("Conexão encerrada localmente.");
    }

    if (activeId.current !== walletId) return;

    setStatus("disconnected");
    setMessage("Carteira desconectada.");
  }, [walletId]);

  return {
    status,
    message,
    connected: status === "connected",
    connect,
    disconnect,
  };
}

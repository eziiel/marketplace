import { Link } from "@tanstack/react-router";
import { Loader2, Plug, PlugZap, TriangleAlert } from "lucide-react";

import { cn } from "@/lib/utils";
import type { CheckoutNetwork } from "@/features/checkout/types/quote";
import type { CollectorWallet } from "../types/wallet";
import { shortAddress, walletKindLabel } from "../lib/wallet-display";
import type { ConnectionStatus } from "../hooks/use-wallet-connection";

export interface WalletSelectorProps {
  wallets: CollectorWallet[];
  networks: CheckoutNetwork[];
  networkId: string;
  selectedId: string | null;
  connectionStatus: ConnectionStatus;
  connectionMessage: string | null;
  connecting: boolean;
  onSelect: (wallet: CollectorWallet) => void;
  onConnect: () => void;
  onDisconnect: () => void;
  className?: string;
}

export function WalletSelector({
  wallets,
  networks,
  networkId,
  selectedId,
  connectionStatus,
  connectionMessage,
  connecting,
  onSelect,
  onConnect,
  onDisconnect,
  className,
}: WalletSelectorProps) {
  const selected = wallets.find((wallet) => wallet.id === selectedId) ?? null;
  const networkLabel = (id: string) =>
    networks.find((network) => network.id === id)?.label ?? id;
  const incompatible = selected !== null && selected.networkId !== networkId;

  if (wallets.length === 0) {
    return (
      <div
        className={cn(
          "rounded-[4px] border border-dashed border-border px-4 py-5",
          className,
        )}
      >
        <p className="text-sm text-foreground">
          Você ainda não cadastrou uma carteira para receber os NFTs.
        </p>
        <Link
          to="/profile/wallets"
          search={{ from: "checkout" }}
          className="mt-2 inline-block text-sm font-bold text-highlight underline underline-offset-4 hover:text-foreground"
        >
          Cadastrar carteira
        </Link>
      </div>
    );
  }

  return (
    <fieldset className={cn("min-w-0 border-0 p-0", className)}>
      <legend className="text-sm text-muted-foreground">
        Carteira de recebimento
      </legend>

      <div className="mt-3 flex flex-col gap-2">
        {wallets.map((wallet) => {
          const active = wallet.id === selectedId;
          const mismatch = wallet.networkId !== networkId;

          return (
            <label
              key={wallet.id}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-[4px] border px-3 py-2 text-sm transition-colors",
                active
                  ? "border-highlight text-foreground"
                  : "border-border text-muted-foreground hover:border-highlight/70",
              )}
            >
              <input
                type="radio"
                name="collectorWallet"
                value={wallet.id}
                checked={active}
                onChange={() => onSelect(wallet)}
                className="size-4 shrink-0 appearance-none rounded-full border border-primary bg-transparent transition-colors checked:bg-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight"
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate">
                  {walletKindLabel(wallet.kind)}
                  {wallet.walletNickname ? ` · ${wallet.walletNickname}` : ""}
                </span>
                <span className="block text-xs text-muted-foreground tabular-nums">
                  {shortAddress(wallet.address)} ·{" "}
                  {networkLabel(wallet.networkId)}
                </span>
              </span>
              {mismatch && (
                <span className="shrink-0 text-xs text-destructive">
                  Outra rede
                </span>
              )}
            </label>
          );
        })}
      </div>

      {incompatible && (
        <p
          role="alert"
          className="mt-3 flex items-center gap-2 rounded-[4px] border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive"
        >
          <TriangleAlert className="size-4 shrink-0" aria-hidden />
          Esta carteira é da rede {networkLabel(selected.networkId)}. Escolha
          essa rede ou selecione outra carteira.
        </p>
      )}

      {selected && !incompatible && (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {connectionStatus === "connected" ? (
            <button
              type="button"
              onClick={onDisconnect}
              className="inline-flex items-center gap-2 rounded-[4px] border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-highlight hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight"
            >
              <Plug className="size-3.5" aria-hidden />
              Desconectar carteira
            </button>
          ) : (
            <button
              type="button"
              onClick={onConnect}
              disabled={connecting}
              className="inline-flex items-center gap-2 rounded-[4px] border border-primary px-3 py-1.5 text-xs font-bold text-primary transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight disabled:opacity-60"
            >
              {connecting ? (
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
              ) : (
                <PlugZap className="size-3.5" aria-hidden />
              )}
              {connecting ? "Conectando..." : "Conectar carteira"}
            </button>
          )}

          <p
            aria-live="polite"
            role={connectionStatus === "refused" ? "alert" : "status"}
            className={cn(
              "text-xs",
              connectionStatus === "refused"
                ? "text-destructive"
                : connectionStatus === "connected"
                  ? "text-highlight"
                  : "text-muted-foreground",
            )}
          >
            {connectionMessage}
          </p>
        </div>
      )}
    </fieldset>
  );
}

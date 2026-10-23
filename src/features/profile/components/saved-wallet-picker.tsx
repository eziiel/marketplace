import { Link } from "@tanstack/react-router";

import { cn } from "@/lib/utils";
import type { CollectorWallet } from "../types/wallet";

const KIND_LABEL: Record<CollectorWallet["kind"], string> = {
  primary: "Principal",
  secondary: "Secundária",
};

function shortAddress(address: string): string {
  return address.length > 12
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : address;
}

export function SavedWalletPicker({
  wallets,
  selectedId,
  onSelect,
  className,
}: {
  wallets: CollectorWallet[];
  selectedId: string | null;
  onSelect: (wallet: CollectorWallet) => void;
  className?: string;
}) {
  if (wallets.length === 0) {
    return (
      <p className={cn("text-sm text-muted-foreground", className)}>
        Nenhuma carteira cadastrada.{" "}
        <Link
          to="/profile/wallets"
          className="text-highlight underline underline-offset-4 hover:text-foreground"
        >
          Cadastrar carteira
        </Link>
      </p>
    );
  }

  return (
    <fieldset className={cn("min-w-0 border-0 p-0", className)}>
      <legend className="text-sm text-muted-foreground">
        Usar carteira cadastrada
      </legend>

      <div className="mt-3 flex flex-wrap gap-3">
        {wallets.map((wallet) => {
          const selected = wallet.id === selectedId;

          return (
            <label
              key={wallet.id}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-[4px] border px-3 py-2 text-sm transition-colors",
                selected
                  ? "border-highlight text-foreground"
                  : "border-border text-muted-foreground hover:border-highlight/70",
              )}
            >
              <input
                type="radio"
                name="savedWallet"
                value={wallet.id}
                checked={selected}
                onChange={() => onSelect(wallet)}
                className="size-4 appearance-none rounded-full border border-primary bg-transparent transition-colors checked:bg-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight"
              />
              <span>
                {KIND_LABEL[wallet.kind]}
                {wallet.walletNickname ? ` · ${wallet.walletNickname}` : ""}
                <span className="ml-2 text-xs text-muted-foreground tabular-nums">
                  {shortAddress(wallet.address)}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

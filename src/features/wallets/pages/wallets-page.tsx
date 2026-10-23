import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { ArrowLeft, Star, TriangleAlert } from "lucide-react";

import { FieldLabel } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useNetworks } from "@/features/checkout/hooks/use-networks";
import { ProfileShell } from "@/features/profile/components/profile-shell";
import { useProfile } from "@/features/profile/hooks/use-profile";
import type { CollectorProfile } from "@/features/profile/types/profile";
import { apiErrorMessage, isUnauthorized } from "@/lib/api-error";
import { cn } from "@/lib/utils";

import { WalletSection } from "../components/wallet-section";
import { useWallets } from "../hooks/use-wallets";
import { emptyWalletForm } from "../lib/wallet-form";
import { shortAddress, walletKindLabel } from "../lib/wallet-display";
import type { CollectorWallet, WalletInput, WalletKind } from "../types/wallet";

function WalletsSkeleton() {
  return (
    <div
      aria-label="Carregando carteiras"
      className="grid gap-x-7 gap-y-6 md:grid-cols-2"
    >
      {Array.from({ length: 10 }).map((_, index) => (
        <div key={index} className="space-y-3">
          <div className="h-4 w-32 animate-pulse rounded bg-card" />
          <div className="h-10 w-full animate-pulse rounded-[4px] bg-card" />
        </div>
      ))}
    </div>
  );
}

function defaultsFor(
  kind: WalletKind,
  profile: CollectorProfile | undefined,
  primary: CollectorWallet | null,
  sameAsPrimary: boolean,
): WalletInput {
  const base = emptyWalletForm(kind);

  if (kind === "secondary" && sameAsPrimary && primary) {
    return {
      ...base,
      displayName: primary.displayName,
      walletNickname: primary.walletNickname,
      networkId: primary.networkId,
      profileName: primary.profileName,
      walletType: primary.walletType,
      referralCode: primary.referralCode,
      email: primary.email,
      ensName: primary.ensName,
      ensDomain: primary.ensDomain,
    };
  }

  if (!profile) return base;

  return {
    ...base,
    displayName: profile.displayName,
    walletNickname: profile.walletNickname,
    profileName: profile.username,
    email: profile.email,
    ensName: profile.ensName,
    ensDomain: profile.ensDomain,
  };
}

export function WalletsPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/profile/wallets" });
  const walletsQuery = useWallets();
  const profileQuery = useProfile();
  const networksQuery = useNetworks();

  const [secondaryOpen, setSecondaryOpen] = useState(false);
  const [sameAsPrimary, setSameAsPrimary] = useState(false);
  const primaryRef = useRef<HTMLDivElement>(null);

  const wallets = walletsQuery.data?.wallets ?? [];
  const primary = wallets.find((wallet) => wallet.kind === "primary") ?? null;
  const secondary =
    wallets.find((wallet) => wallet.kind === "secondary") ?? null;

  const sessionExpired =
    isUnauthorized(walletsQuery.error) || isUnauthorized(profileQuery.error);

  useEffect(() => {
    if (sessionExpired) {
      void navigate({ to: "/", search: { page: 1, auth: "login" } });
    }
  }, [sessionExpired, navigate]);

  const loading = walletsQuery.isPending || networksQuery.isPending;
  const networks = networksQuery.data ?? [];
  const profile = profileQuery.data?.profile;
  const networkLabel = (id: string) =>
    networks.find((network) => network.id === id)?.label ?? id;

  function focusPrimary() {
    primaryRef.current?.querySelector<HTMLElement>("input")?.focus();
  }

  return (
    <ProfileShell active="wallets" current="Carteiras">
      {search.from === "checkout" && (
        <Link
          to="/checkout"
          className="mb-5 inline-flex items-center gap-2 text-sm text-highlight transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Voltar ao pagamento
        </Link>
      )}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="m-0 text-lg font-normal tracking-normal text-foreground">
            Carteira principal
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Estas carteiras ficam disponíveis no pagamento e para receber NFTs
            comprados.
          </p>
        </div>

        <button
          type="button"
          onClick={focusPrimary}
          className="text-sm text-highlight transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Adicionar
        </button>
      </div>

      {loading && (
        <div className="mt-6">
          <WalletsSkeleton />
        </div>
      )}

      {walletsQuery.isError && !sessionExpired && (
        <div className="mt-6 space-y-3">
          <p
            role="alert"
            className="flex items-center gap-2 rounded-[4px] border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            <TriangleAlert className="size-4 shrink-0" aria-hidden />
            {apiErrorMessage(
              walletsQuery.error,
              "Não foi possível carregar as carteiras.",
            )}
          </p>
          <button
            type="button"
            onClick={() => void walletsQuery.refetch()}
            className="text-sm font-bold text-highlight underline underline-offset-4 hover:text-foreground"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {!loading && !walletsQuery.isError && (
        <>
          {wallets.length === 0 ? (
            <p className="mt-5 rounded-[4px] border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
              Você ainda não cadastrou carteiras. Preencha o formulário abaixo
              para cadastrar a primeira, que será a principal.
            </p>
          ) : (
            <ul
              aria-label="Carteiras cadastradas"
              className="mt-5 flex flex-col gap-2"
            >
              {wallets.map((wallet) => (
                <li
                  key={wallet.id}
                  className={cn(
                    "flex flex-wrap items-center gap-x-3 gap-y-1 rounded-[4px] border px-3 py-2 text-sm",
                    wallet.kind === "primary"
                      ? "border-highlight/60 text-foreground"
                      : "border-border text-muted-foreground",
                  )}
                >
                  {wallet.kind === "primary" && (
                    <Star
                      className="size-4 shrink-0 text-highlight"
                      aria-hidden
                    />
                  )}
                  <span className="font-bold">
                    {walletKindLabel(wallet.kind)}
                  </span>
                  <span className="truncate">{wallet.walletNickname}</span>
                  <span className="text-xs tabular-nums">
                    {shortAddress(wallet.address)}
                  </span>
                  <span className="text-xs">
                    {networkLabel(wallet.networkId)}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <div ref={primaryRef} className="mt-6">
            <WalletSection
              kind="primary"
              wallet={primary}
              initialValues={defaultsFor("primary", profile, null, false)}
              networks={networks}
              onRemoved={() => {
                setSecondaryOpen(false);
                setSameAsPrimary(false);
              }}
            />
          </div>

          <section aria-labelledby="secondary-wallet-title" className="mt-10">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h2
                id="secondary-wallet-title"
                className="m-0 text-lg font-normal text-foreground"
              >
                Carteira secundária
              </h2>

              {!secondary && !secondaryOpen && (
                <div className="flex flex-wrap items-center gap-4">
                  <RadioGroup
                    name="secondaryPreset"
                    value={sameAsPrimary ? "same" : ""}
                    disabled={!primary}
                    onValueChange={() => setSameAsPrimary(true)}
                    className="w-auto"
                  >
                    <FieldLabel
                      htmlFor="secondary-same-as-primary"
                      className="flex items-center gap-2 text-sm font-normal text-muted-foreground"
                    >
                      <RadioGroupItem
                        id="secondary-same-as-primary"
                        value="same"
                        aria-label="Igual à carteira principal"
                        className="border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight"
                      />
                      Igual à carteira principal
                    </FieldLabel>
                  </RadioGroup>

                  <button
                    type="button"
                    onClick={() => setSecondaryOpen(true)}
                    disabled={!primary}
                    className="text-sm text-highlight transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50"
                  >
                    Adicionar
                  </button>
                </div>
              )}
            </div>

            {!secondary && !secondaryOpen && (
              <p className="mt-1 text-sm text-muted-foreground">
                {primary
                  ? "Você ainda não adicionou uma carteira secundária."
                  : "Cadastre a carteira principal antes de adicionar uma secundária."}
              </p>
            )}

            {(secondary || secondaryOpen) && (
              <div className="mt-6">
                <WalletSection
                  kind="secondary"
                  wallet={secondary}
                  initialValues={defaultsFor(
                    "secondary",
                    profile,
                    primary,
                    sameAsPrimary,
                  )}
                  networks={networks}
                  canPromote={Boolean(secondary && primary)}
                  onRemoved={() => {
                    setSecondaryOpen(false);
                    setSameAsPrimary(false);
                  }}
                />
              </div>
            )}
          </section>
        </>
      )}
    </ProfileShell>
  );
}

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { TriangleAlert } from "lucide-react";

import { useNetworks } from "@/features/checkout/hooks/use-networks";

import { ProfileShell } from "../components/profile-shell";
import { WalletSection } from "../components/wallet-section";
import { useWallets } from "../hooks/use-wallets";
import { useProfile } from "../hooks/use-profile";
import { emptyWalletForm } from "../lib/wallet-form";
import { apiErrorMessage, isUnauthorized } from "../types/api-error";
import type { CollectorWallet, WalletInput, WalletKind } from "../types/wallet";
import type { CollectorProfile } from "../types/profile";

function WalletsSkeleton() {
  return (
    <div aria-label="Carregando carteiras" className="grid gap-x-7 gap-y-6 md:grid-cols-2">
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

  function focusPrimary() {
    const input = primaryRef.current?.querySelector<HTMLElement>("input");

    input?.focus();
  }

  return (
    <ProfileShell active="wallets" current="Carteiras">
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
          <div ref={primaryRef} className="mt-6">
            <WalletSection
              kind="primary"
              wallet={primary}
              initialValues={defaultsFor("primary", profile, null, false)}
              networks={networks}
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
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <input
                      type="radio"
                      name="secondaryPreset"
                      checked={sameAsPrimary}
                      disabled={!primary}
                      onChange={() => setSameAsPrimary(true)}
                      className="size-4 appearance-none rounded-full border border-primary bg-transparent transition-colors checked:bg-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight disabled:opacity-50"
                    />
                    Igual à carteira principal
                  </label>

                  <button
                    type="button"
                    onClick={() => setSecondaryOpen(true)}
                    className="text-sm text-highlight transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    Adicionar
                  </button>
                </div>
              )}
            </div>

            {!secondary && !secondaryOpen && (
              <p className="mt-1 text-sm text-muted-foreground">
                Você ainda não adicionou uma carteira secundária.
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

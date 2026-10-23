import { useEffect, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import axios from "axios";
import { Loader2, TriangleAlert } from "lucide-react";

import { Container } from "@/components/layout/container";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { crumbs } from "@/components/layout/crumbs";
import { nftImage } from "@/features/catalog/lib/nft-image";
import { getStoredCoupon, storeCoupon } from "@/features/cart/lib/coupon-storage";
import { cn } from "@/lib/utils";

import { getAuthToken } from "@/features/auth/lib/auth-token";
import { useAuthMe } from "@/features/auth/hooks/use-auth-me";
import { useProfile } from "@/features/profile/hooks/use-profile";
import { useWallets } from "@/features/wallets/hooks/use-wallets";
import { WalletSelector } from "@/features/wallets/components/wallet-selector";
import { useWalletConnection } from "@/features/wallets/hooks/use-wallet-connection";
import { shortAddress, walletKindLabel } from "@/features/wallets/lib/wallet-display";
import { TestFillButton } from "@/components/ui/test-fill-button";
import { devFillEnabled, keepFilled, sampleCollector } from "@/lib/dev-fill";
import type { CollectorWallet } from "@/features/wallets/types/wallet";
import { useLogout } from "@/features/auth/hooks/use-logout";

import { useNetworks } from "../hooks/use-networks";
import { useQuote } from "../hooks/use-quote";
import { useCreateOrder } from "../hooks/use-create-order";
import { CouponForm } from "../components/coupon-form";
import { CollectorForm } from "../components/collector-form";
import {
  emptyCollectorForm,
  fieldOrder,
  validateCollectorForm,
  type CollectorFormErrors,
  type CollectorFormValues,
} from "../lib/collector-form";
import type { Quote } from "../types/quote";
import { FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { WALLET_BADGES, WALLET_PROVIDERS } from "@/features/wallets/types/wallet";

const FORM_ID = "checkout-form";

function messageFromError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;

    return data?.message ?? error.message;
  }

  return error instanceof Error ? error.message : "Erro inesperado";
}

function CheckoutShell({ children }: { children: ReactNode }) {
  const isAuthenticated = Boolean(getAuthToken());
  const authMe = useAuthMe();
  const logoutMutation = useLogout();

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader
        activeNav="Mercado"
        isAuthenticated={isAuthenticated}
        userName={authMe.data?.user.name}
        onLogout={() => logoutMutation.mutate()}
      />
      <main className="flex-1 pb-6 md:pb-0">
        <Container className="py-6 md:py-8">
          <Breadcrumb
            items={[crumbs.home, crumbs.market]}
            current="Pagamento"
            className="mb-5"
          />
          {children}
        </Container>
      </main>
      <SiteFooter />
      <MobileNav />
    </div>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-[15px] text-foreground tabular-nums">{value}</dd>
    </div>
  );
}

function QuoteItems({ quote }: { quote: Quote }) {
  return (
    <ul aria-label="Itens do pedido" className="mt-4 space-y-4">
      {quote.items.map((item) => (
        <li
          key={`${item.nftId}-${item.edition}`}
          className="grid min-h-[65px] grid-cols-[70px_minmax(0,1fr)_auto] items-center gap-x-3 rounded-[4px] bg-card pr-3"
        >
          <img
            src={item.image || nftImage(item.nftId)}
            alt=""
            width={70}
            height={65}
            className="h-full min-h-[65px] w-[70px] self-stretch rounded-l-[4px] object-cover"
          />
          <div className="min-w-0 py-2">
            <p className="truncate text-[15px] font-bold text-foreground">
              {item.name}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              ID do token: {item.tokenId}
            </p>
            {!item.availabilityOk && (
              <p role="alert" className="mt-0.5 text-xs font-medium text-destructive">
                Estoque insuficiente ({item.available} disponíveis)
              </p>
            )}
          </div>
          <p className="flex items-baseline gap-2 whitespace-nowrap">
            <span className="text-sm text-muted-foreground">
              (x {item.quantity})
            </span>
            <span className="text-[15px] font-bold text-highlight tabular-nums">
              {item.lineTotal} {quote.currency}
            </span>
          </p>
        </li>
      ))}
    </ul>
  );
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const profileQuery = useProfile();
  const walletsQuery = useWallets();
  const networksQuery = useNetworks();

  const [selectedNetworkId, setSelectedNetworkId] = useState<string | null>(
    null,
  );
  const [walletType, setWalletType] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(() =>
    getStoredCoupon(),
  );
  const [couponOpen, setCouponOpen] = useState(() => getStoredCoupon() !== null);
  const [form, setForm] = useState<CollectorFormValues>(emptyCollectorForm);
  const [errors, setErrors] = useState<CollectorFormErrors>({});
  const [prefilledFor, setPrefilledFor] = useState<string | null>(null);
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(
    null,
  );

  const profile = profileQuery.data?.profile;

  if (profile && prefilledFor !== profile.userId) {
    setPrefilledFor(profile.userId);
    setForm((current) => ({
      ...current,
      displayName: current.displayName || profile.displayName,
      username: current.username || profile.username,
      email: current.email || profile.email,
      ensName: current.ensName || profile.ensName,
    }));
  }

  const savedWallets = walletsQuery.data?.wallets ?? [];

  function fillSampleCollector() {
    setForm((current) =>
      keepFilled(current, {
        displayName: sampleCollector.displayName,
        username: sampleCollector.username,
        profileName: sampleCollector.profileName,
        walletAddress: sampleCollector.address,
        secondaryWallet: sampleCollector.secondaryAddress,
        referralCode: sampleCollector.referralCode,
        email: sampleCollector.email,
        ensName: sampleCollector.ensName,
      }),
    );

    if (!walletType) setWalletType(sampleCollector.walletType);

    setErrors({});
  }

  function applySavedWallet(wallet: CollectorWallet) {
    setSelectedWalletId(wallet.id);
    setSelectedNetworkId(wallet.networkId);
    setWalletType(wallet.walletType);
    setForm((current) => ({
      ...current,
      displayName: wallet.displayName || current.displayName,
      profileName: wallet.profileName || current.profileName,
      walletAddress: wallet.address,
      secondaryWallet: wallet.secondaryAddress,
      referralCode: wallet.referralCode || current.referralCode,
      email: wallet.email || current.email,
      ensName: wallet.ensName || current.ensName,
    }));
    setErrors({});
  }

  const networkId = selectedNetworkId ?? networksQuery.data?.[0]?.id ?? "";

  const selectedWallet =
    savedWallets.find((wallet) => wallet.id === selectedWalletId) ?? null;
  const walletConnection = useWalletConnection(selectedWalletId);
  const activeNetwork = networksQuery.data?.find(
    (network) => network.id === networkId,
  );
  const walletMismatch =
    selectedWallet !== null && selectedWallet.networkId !== networkId;
  const walletReady =
    selectedWallet !== null && !walletMismatch && walletConnection.connected;

  const quoteQuery = useQuote(
    { networkId, couponCode: appliedCoupon },
    { enabled: Boolean(networkId) },
  );
  const quote = quoteQuery.data;

  const createOrder = useCreateOrder();
  const idempotencyKeyRef = useRef(crypto.randomUUID());

  useEffect(() => {
    if (quote?.id) {
      idempotencyKeyRef.current = crypto.randomUUID();
    }
  }, [quote?.id]);

  function applyCoupon(code: string) {
    const next = code.length > 0 ? code : null;
    setAppliedCoupon(next);
    storeCoupon(next);
  }

  function handleSubmit() {
    const nextErrors = validateCollectorForm(
      form,
      networkId,
      walletType,
      activeNetwork?.addressFormat,
    );
    setErrors(nextErrors);

    const firstInvalid = fieldOrder.find((key) => nextErrors[key]);

    if (firstInvalid) {
      const formElement = document.getElementById(FORM_ID);
      const control =
        formElement instanceof HTMLFormElement
          ? formElement.elements.namedItem(firstInvalid)
          : null;

      if (control instanceof HTMLElement) {
        control.focus();
      }

      return;
    }

    if (!quote || quote.hasAvailabilityIssue || quoteQuery.isFetching) {
      return;
    }

    if (!selectedWallet || walletMismatch || !walletConnection.connected) {
      return;
    }

    createOrder.mutate(
      {
        quoteId: quote.id,
        walletId: selectedWallet.id,
        idempotencyKey: idempotencyKeyRef.current,
      },
      {
        onSuccess: (order) => {
          storeCoupon(null);
          void navigate({
            to: "/orders/$orderId",
            params: { orderId: order.id },
          });
        },
      },
    );
  }

  if (networksQuery.isPending) {
    return (
      <CheckoutShell>
        <div className="flex items-center justify-center gap-2 rounded-[4px] bg-card px-6 py-20 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Carregando pagamento...
        </div>
      </CheckoutShell>
    );
  }

  if (networksQuery.isError) {
    return (
      <CheckoutShell>
        <div
          role="alert"
          className="flex flex-col items-center gap-3 rounded-[4px] border border-destructive/30 bg-destructive/10 px-6 py-16 text-center"
        >
          <TriangleAlert className="size-6 text-destructive" aria-hidden />
          <p className="text-sm text-destructive">
            Erro ao carregar redes: {messageFromError(networksQuery.error)}
          </p>
        </div>
      </CheckoutShell>
    );
  }

  const showQuoteLoading = !quote && !quoteQuery.isError;
  const confirmDisabled =
    createOrder.isPending ||
    !quote ||
    quote.hasAvailabilityIssue ||
    quoteQuery.isFetching ||
    !walletReady;

  return (
    <CheckoutShell>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_405px] lg:gap-8">
        <section aria-labelledby="collector-title">
          <h1
            id="collector-title"
            className="m-0 mb-5 text-lg font-normal tracking-normal text-foreground"
          >
            Perfil do colecionador
          </h1>
          {devFillEnabled && (
            <TestFillButton onFill={fillSampleCollector} className="mb-5" />
          )}

          <WalletSelector
            wallets={savedWallets}
            networks={networksQuery.data ?? []}
            networkId={networkId}
            selectedId={selectedWalletId}
            connectionStatus={walletConnection.status}
            connectionMessage={walletConnection.message}
            connecting={walletConnection.status === "connecting"}
            onSelect={applySavedWallet}
            onConnect={() => void walletConnection.connect()}
            onDisconnect={() => void walletConnection.disconnect()}
            className="mb-6"
          />

          <CollectorForm
            id={FORM_ID}
            values={form}
            errors={errors}
            networks={networksQuery.data}
            networkId={networkId}
            walletType={walletType}
            onChange={setForm}
            onNetworkChange={setSelectedNetworkId}
            onWalletTypeChange={setWalletType}
            onSubmit={handleSubmit}
          />
        </section>

        <aside aria-labelledby="order-title" className="lg:sticky lg:top-24">
          <h2
            id="order-title"
            className="m-0 text-lg font-normal text-foreground"
          >
            Seus NFTs
          </h2>
          <div
            aria-hidden
            className="mt-3 flex items-center justify-between border-b border-border pb-2 text-sm text-muted-foreground"
          >
            <span>NFTs</span>
            <span>Subtotal</span>
          </div>

          {showQuoteLoading && (
            <div aria-label="Calculando cotação" className="mt-4 space-y-4">
              {Array.from({ length: 2 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[65px] animate-pulse rounded-[4px] bg-card"
                />
              ))}
              <div className="h-5 w-2/3 animate-pulse rounded bg-card" />
              <div className="h-5 w-1/2 animate-pulse rounded bg-card" />
            </div>
          )}

          {quoteQuery.isError && (
            <div className="mt-4 space-y-3">
              <p
                role="alert"
                className="flex items-center gap-2 rounded-[4px] border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                <TriangleAlert className="size-4 shrink-0" aria-hidden />
                {messageFromError(quoteQuery.error)}
              </p>
              <button
                type="button"
                onClick={() => void quoteQuery.refetch()}
                className="text-sm font-bold text-highlight underline underline-offset-4 hover:text-foreground"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {quote && (
            <>
              <QuoteItems quote={quote} />

              {couponOpen ? (
                <CouponForm
                  appliedCoupon={appliedCoupon}
                  status={quote.couponStatus}
                  onApply={applyCoupon}
                  onRemove={() => applyCoupon("")}
                  className="mt-5"
                />
              ) : (
                <p className="mt-5 text-center text-xs text-muted-foreground">
                  Tem um código promocional?{" "}
                  <button
                    type="button"
                    onClick={() => setCouponOpen(true)}
                    className="underline underline-offset-2 hover:text-foreground focus-visible:outline-2 focus-visible:outline-highlight"
                  >
                    Aplique aqui
                  </button>
                </p>
              )}

              <dl
                aria-busy={quoteQuery.isFetching}
                className={cn(
                  "mt-4 space-y-3",
                  quoteQuery.isFetching && "opacity-60",
                )}
              >
                <SummaryLine
                  label="Subtotal"
                  value={`${quote.subtotal} ${quote.currency}`}
                />
                <SummaryLine
                  label="Desconto do lançamento"
                  value={`(-) ${quote.discount} ${quote.currency}`}
                />
                <SummaryLine
                  label="Taxa de rede"
                  value={`${quote.networkFee} ${quote.currency}`}
                />
                <p className="text-center text-xs text-highlight">
                  Taxa estimada
                </p>
                <div className="flex items-center justify-between gap-3 border-t border-border pt-4 pl-10">
                  <dt className="text-base text-muted-foreground">Total</dt>
                  <dd className="text-xl font-bold text-highlight tabular-nums">
                    {quote.total} {quote.currency}
                  </dd>
                </div>
              </dl>

              <FieldSet className="mt-4 min-w-0 gap-0 border-0 p-0">
                <FieldLegend className="mb-0 w-full text-center text-base font-normal text-foreground">
                  Carteira e rede
                </FieldLegend>
                <RadioGroup
                  name="wallet"
                  value={walletType ?? ""}
                  onValueChange={(value) => setWalletType(value)}
                  className="mt-4 space-y-4"
                >
                  {WALLET_PROVIDERS.map((wallet) => {
                    const selected = wallet.id === walletType;
                    const itemId = `wallet-provider-${wallet.id}`;

                    return (
                      <FieldLabel
                        key={wallet.id}
                        htmlFor={itemId}
                        className={cn(
                          "flex h-11 w-full cursor-pointer items-center gap-4 rounded-[4px] border px-3 font-normal transition-colors",
                          selected
                            ? "border-highlight"
                            : "border-foreground/70 hover:border-highlight/70",
                        )}
                      >
                        <RadioGroupItem
                          id={itemId}
                          value={wallet.id}
                          aria-label={wallet.label}
                          aria-describedby={
                            errors.walletType ? "wallet-error" : undefined
                          }
                          className="shrink-0 border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight"
                        />
                        {wallet.badge ? (
                          <span className="rounded-[3px] bg-black/60 px-3 py-1.5 text-[10px] font-bold tracking-wider text-primary uppercase">
                            {WALLET_BADGES.join(" · ")}
                          </span>
                        ) : (
                          <span
                            className={cn(
                              "text-sm",
                              selected ? "text-foreground" : "text-muted-foreground",
                            )}
                          >
                            {wallet.label}
                          </span>
                        )}
                      </FieldLabel>
                    );
                  })}
                </RadioGroup>
                <p id="wallet-error" className="mt-2 min-h-4 text-xs text-destructive">
                  {errors.walletType}
                </p>
              </FieldSet>

              <div className="mt-4 rounded-[4px] border border-border px-3 py-3 text-xs">
                <p className="font-bold text-foreground">Resumo do pagamento</p>
                {selectedWallet ? (
                  <ul className="mt-2 space-y-1 text-muted-foreground">
                    <li>
                      Carteira: {walletKindLabel(selectedWallet.kind)}
                      {selectedWallet.walletNickname
                        ? ` · ${selectedWallet.walletNickname}`
                        : ""}
                    </li>
                    <li className="tabular-nums">
                      Endereço: {shortAddress(selectedWallet.address)}
                    </li>
                    <li>Rede: {activeNetwork?.label ?? networkId}</li>
                    <li>
                      Conexão:{" "}
                      {walletConnection.connected
                        ? "conectada"
                        : "não conectada"}
                    </li>
                    {quote && (
                      <li className="text-foreground">
                        Total: {quote.total} {quote.currency}
                      </li>
                    )}
                  </ul>
                ) : (
                  <p className="mt-2 text-muted-foreground">
                    Selecione uma carteira cadastrada para concluir a compra.
                  </p>
                )}
              </div>

              <button
                type="submit"
                form={FORM_ID}
                disabled={confirmDisabled}
                className="mt-2 flex h-[46px] w-full items-center justify-center rounded-[4px] bg-primary text-[15px] font-bold text-primary-foreground transition-colors hover:bg-primary/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight disabled:pointer-events-none disabled:opacity-50"
              >
                {createOrder.isPending ? "Processando..." : "Confirmar compra"}
              </button>

              <p className="mt-3 text-center text-xs text-muted-foreground">
                Pagamento simulado para fins de demonstração.
              </p>

              {createOrder.isError && (
                <div className="mt-3 space-y-2">
                  <p
                    role="alert"
                    className="flex items-center gap-2 rounded-[4px] border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                  >
                    <TriangleAlert className="size-4 shrink-0" aria-hidden />
                    {messageFromError(createOrder.error)}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      createOrder.reset();
                      void quoteQuery.refetch();
                    }}
                    className="flex h-10 w-full items-center justify-center rounded-[4px] border border-primary text-sm font-bold text-highlight transition-colors hover:bg-primary/10"
                  >
                    Refazer cotação
                  </button>
                </div>
              )}
            </>
          )}
        </aside>
      </div>
    </CheckoutShell>
  );
}

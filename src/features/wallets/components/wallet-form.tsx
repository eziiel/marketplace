import type { FormEvent, ReactNode } from "react";
import { CheckCircle2, TriangleAlert } from "lucide-react";

import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";
import { FormField } from "@/components/ui/form-field";
import { fieldControl } from "@/components/ui/field-control";
import { Button } from "@/components/ui/button";
import { WALLET_PROVIDERS } from "../types/wallet";
import type { CheckoutNetwork } from "@/features/checkout/types/quote";

import type { WalletInput } from "@/features/wallets/types/wallet";
import type { WalletFormErrors } from "@/features/wallets/lib/wallet-form";
import { EnsField } from "@/components/ui/ens-field";
import { TestFillButton } from "@/components/ui/test-fill-button";
import { devFillEnabled } from "@/lib/dev-fill";
import { addressPlaceholder, type AddressFormat } from "../lib/address";

export interface WalletFormProps {
  id: string;
  prefix: string;
  values: WalletInput;
  errors: WalletFormErrors;
  networks: CheckoutNetwork[];
  addressFormat?: AddressFormat;
  status: string | null;
  failure: string | null;
  saving: boolean;
  submitLabel: string;
  onChange: (values: WalletInput) => void;
  onSubmit: () => void;
  onFill?: () => void;
  onRemove?: () => void;
  removing?: boolean;
  extraActions?: ReactNode;
}

export function WalletForm({
  id,
  prefix,
  values,
  errors,
  networks,
  addressFormat,
  status,
  failure,
  saving,
  submitLabel,
  onChange,
  onSubmit,
  onFill,
  onRemove,
  removing = false,
  extraActions,
}: WalletFormProps) {
  function set<K extends keyof WalletInput>(key: K, value: WalletInput[K]) {
    onChange({ ...values, [key]: value });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  const fieldId = (name: string) => `${prefix}-${name}`;

  return (
    <form id={id} noValidate onSubmit={handleSubmit}>
      {devFillEnabled && onFill && (
        <TestFillButton onFill={onFill} className="mb-5" />
      )}

      <div className="grid gap-x-7 gap-y-2 md:grid-cols-2">
        <FormField
          id={fieldId("displayName")}
          label="Nome de exibição"
          required
          error={errors.displayName}
        >
          <Input
            {...fieldControl(fieldId("displayName"), errors.displayName)}
            name="displayName"
            autoComplete="name"
            value={values.displayName}
            onChange={(event) => set("displayName", event.target.value)}
          />
        </FormField>

        <FormField
          id={fieldId("walletNickname")}
          label="Apelido da carteira"
          required
          error={errors.walletNickname}
        >
          <Input
            {...fieldControl(fieldId("walletNickname"), errors.walletNickname)}
            name="walletNickname"
            autoComplete="off"
            value={values.walletNickname}
            onChange={(event) => set("walletNickname", event.target.value)}
          />
        </FormField>

        <FormField
          id={fieldId("networkId")}
          label="Rede"
          required
          error={errors.networkId}
        >
          <SelectField
            id={fieldId("networkId")}
            name="networkId"
            value={values.networkId}
            error={errors.networkId}
            placeholder="Selecione uma rede"
            options={networks.map((network) => ({
              value: network.id,
              label: network.label,
            }))}
            onValueChange={(value) => set("networkId", value)}
          />
        </FormField>

        <FormField
          id={fieldId("profileName")}
          label="Nome do perfil"
          required
          error={errors.profileName}
        >
          <Input
            {...fieldControl(fieldId("profileName"), errors.profileName)}
            name="profileName"
            autoComplete="nickname"
            value={values.profileName}
            onChange={(event) => set("profileName", event.target.value)}
          />
        </FormField>

        <FormField
          id={fieldId("address")}
          label="Endereço da carteira"
          required
          error={errors.address}
        >
          <Input
            {...fieldControl(fieldId("address"), errors.address)}
            name="address"
            autoComplete="off"
            spellCheck={false}
            placeholder={addressPlaceholder(addressFormat)}
            value={values.address}
            onChange={(event) => set("address", event.target.value)}
          />
        </FormField>

        <FormField id={fieldId("secondaryAddress")} error={errors.secondaryAddress}>
          <Input
            {...fieldControl(
              fieldId("secondaryAddress"),
              errors.secondaryAddress,
            )}
            name="secondaryAddress"
            aria-label="ENS ou carteira secundária (opcional)"
            autoComplete="off"
            spellCheck={false}
            placeholder="ENS ou carteira secundária (opcional)"
            value={values.secondaryAddress}
            onChange={(event) => set("secondaryAddress", event.target.value)}
          />
        </FormField>

        <FormField
          id={fieldId("walletType")}
          label="Tipo de carteira"
          required
          error={errors.walletType}
        >
          <SelectField
            id={fieldId("walletType")}
            name="walletType"
            value={values.walletType}
            error={errors.walletType}
            placeholder="Selecione uma carteira"
            options={WALLET_PROVIDERS.map((wallet) => ({
              value: wallet.id,
              label: wallet.label,
            }))}
            onValueChange={(value) => set("walletType", value)}
          />
        </FormField>

        <FormField
          id={fieldId("referralCode")}
          label="Código de indicação"
          required
          error={errors.referralCode}
        >
          <Input
            {...fieldControl(fieldId("referralCode"), errors.referralCode)}
            name="referralCode"
            autoComplete="off"
            value={values.referralCode}
            onChange={(event) => set("referralCode", event.target.value)}
          />
        </FormField>

        <FormField
          id={fieldId("email")}
          label="E-mail"
          required
          error={errors.email}
        >
          <Input
            {...fieldControl(fieldId("email"), errors.email)}
            type="email"
            name="email"
            autoComplete="email"
            value={values.email}
            onChange={(event) => set("email", event.target.value)}
          />
        </FormField>

        <FormField
          id={fieldId("ensName")}
          label="Nome ENS"
          required
          error={errors.ensName}
        >
          <EnsField
            id={fieldId("ensName")}
            name="ensName"
            value={values.ensName}
            domain={values.ensDomain}
            error={errors.ensName}
            onValueChange={(value) => set("ensName", value)}
            onDomainChange={(domain) => set("ensDomain", domain)}
          />
        </FormField>
      </div>

      <div aria-live="polite" className="space-y-3">
        {status && (
          <p
            role="status"
            className="flex items-center gap-2 text-sm text-highlight"
          >
            <CheckCircle2 className="size-4 shrink-0" aria-hidden />
            {status}
          </p>
        )}

        {failure && (
          <p
            role="alert"
            className="flex items-center gap-2 rounded-[4px] border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            <TriangleAlert className="size-4 shrink-0" aria-hidden />
            {failure}
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <Button
          type="submit"
          size="lg"
          disabled={saving}
          className="h-10 rounded-[4px] px-6 text-sm font-bold"
        >
          {saving ? "Salvando..." : submitLabel}
        </Button>

        {extraActions}

        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            disabled={removing}
            className="text-sm text-muted-foreground transition-colors hover:text-destructive focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50"
          >
            {removing ? "Removendo..." : "Remover carteira"}
          </button>
        )}
      </div>
    </form>
  );
}

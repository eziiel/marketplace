import type { FormEvent } from "react";
import { CheckCircle2, TriangleAlert } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Field } from "@/components/ui/field";
import { fieldControl } from "@/components/ui/field-control";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { WALLET_PROVIDERS } from "@/features/checkout/types/wallet";
import type { CheckoutNetwork } from "@/features/checkout/types/quote";

import type { WalletInput } from "../types/wallet";
import type { WalletFormErrors } from "../lib/wallet-form";
import { EnsField } from "./ens-field";

export interface WalletFormProps {
  id: string;
  prefix: string;
  values: WalletInput;
  errors: WalletFormErrors;
  networks: CheckoutNetwork[];
  status: string | null;
  failure: string | null;
  saving: boolean;
  submitLabel: string;
  onChange: (values: WalletInput) => void;
  onSubmit: () => void;
  onRemove?: () => void;
  removing?: boolean;
}

export function WalletForm({
  id,
  prefix,
  values,
  errors,
  networks,
  status,
  failure,
  saving,
  submitLabel,
  onChange,
  onSubmit,
  onRemove,
  removing = false,
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
      <div className="grid gap-x-7 gap-y-2 md:grid-cols-2">
        <Field
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
        </Field>

        <Field
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
        </Field>

        <Field
          id={fieldId("networkId")}
          label="Rede"
          required
          error={errors.networkId}
        >
          <Select
            {...fieldControl(fieldId("networkId"), errors.networkId)}
            name="networkId"
            value={values.networkId}
            onChange={(event) => set("networkId", event.target.value)}
          >
            <option value="">Selecione uma rede</option>
            {networks.map((network) => (
              <option key={network.id} value={network.id}>
                {network.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field
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
        </Field>

        <Field
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
            placeholder="Endereço 0x da carteira"
            value={values.address}
            onChange={(event) => set("address", event.target.value)}
          />
        </Field>

        <Field id={fieldId("secondaryAddress")} error={errors.secondaryAddress}>
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
        </Field>

        <Field
          id={fieldId("walletType")}
          label="Tipo de carteira"
          required
          error={errors.walletType}
        >
          <Select
            {...fieldControl(fieldId("walletType"), errors.walletType)}
            name="walletType"
            value={values.walletType}
            onChange={(event) => set("walletType", event.target.value)}
          >
            <option value="">Selecione uma carteira</option>
            {WALLET_PROVIDERS.map((wallet) => (
              <option key={wallet.id} value={wallet.id}>
                {wallet.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field
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
        </Field>

        <Field
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
        </Field>

        <Field
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
        </Field>
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
        <button
          type="submit"
          disabled={saving}
          className={cn(
            buttonVariants({ size: "lg" }),
            "h-10 rounded-[4px] px-6 text-sm font-bold",
          )}
        >
          {saving ? "Salvando..." : submitLabel}
        </button>

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

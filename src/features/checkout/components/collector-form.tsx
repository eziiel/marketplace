import { useId, type ReactNode } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Field as FieldRoot, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SelectField } from "@/components/ui/select-field";
import { cn } from "@/lib/utils";
import type { CheckoutNetwork } from "../types/quote";
import { WALLET_PROVIDERS } from "@/features/wallets/types/wallet";
import type {
  CollectorFormErrors,
  CollectorFormValues,
} from "../lib/collector-form";

const controlClass =
  "border-foreground/70 px-3 placeholder:text-muted-foreground focus-visible:border-highlight";

function Field({
  id,
  label,
  required = false,
  error,
  children,
}: {
  id: string;
  label?: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <FieldRoot data-invalid={error ? true : undefined} className="gap-0">
      {label ? (
        <FieldLabel
          htmlFor={id}
          className="block text-sm font-normal text-muted-foreground"
        >
          {label}
          {required && (
            <span className="text-highlight" aria-hidden>
              {" "}
              *
            </span>
          )}
        </FieldLabel>
      ) : (
        <span aria-hidden className="block h-5" />
      )}
      <div className="mt-1.5">{children}</div>
      <div className="mt-1 min-h-4">
        <FieldError id={`${id}-error`} className="text-xs">
          {error}
        </FieldError>
      </div>
    </FieldRoot>
  );
}

export interface CollectorFormProps {
  id: string;
  values: CollectorFormValues;
  errors: CollectorFormErrors;
  networks: CheckoutNetwork[];
  networkId: string;
  walletType: string | null;
  onChange: (values: CollectorFormValues) => void;
  onNetworkChange: (networkId: string) => void;
  onWalletTypeChange: (walletType: string) => void;
  onSubmit: () => void;
}

export function CollectorForm({
  id,
  values,
  errors,
  networks,
  networkId,
  walletType,
  onChange,
  onNetworkChange,
  onWalletTypeChange,
  onSubmit,
}: CollectorFormProps) {
  const prefix = useId();

  function set<K extends keyof CollectorFormValues>(
    key: K,
    value: CollectorFormValues[K],
  ) {
    onChange({ ...values, [key]: value });
  }

  function inputProps(key: keyof CollectorFormErrors) {
    return {
      id: `${prefix}-${key}`,
      "aria-invalid": errors[key] ? true : undefined,
      "aria-describedby": errors[key] ? `${prefix}-${key}-error` : undefined,
      "aria-required": true,
    };
  }

  return (
    <form
      id={id}
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="grid gap-x-6 gap-y-3 md:grid-cols-2"
    >
      <Field
        id={`${prefix}-displayName`}
        label="Nome de exibição"
        required
        error={errors.displayName}
      >
        <Input
          {...inputProps("displayName")}
          name="displayName"
          autoComplete="name"
          value={values.displayName}
          onChange={(event) => set("displayName", event.target.value)}
          className={controlClass}
        />
      </Field>

      <Field
        id={`${prefix}-username`}
        label="Nome de usuário"
        required
        error={errors.username}
      >
        <Input
          {...inputProps("username")}
          name="username"
          autoComplete="username"
          value={values.username}
          onChange={(event) => set("username", event.target.value)}
          className={controlClass}
        />
      </Field>

      <Field id={`${prefix}-networkId`} label="Rede" required error={errors.networkId}>
        <SelectField
          id={`${prefix}-networkId`}
          name="networkId"
          value={networkId}
          error={errors.networkId}
          placeholder="Selecione uma rede"
          options={networks.map((network) => ({
            value: network.id,
            label: network.label,
          }))}
          onValueChange={onNetworkChange}
          className={controlClass}
        />
      </Field>

      <Field
        id={`${prefix}-profileName`}
        label="Nome do perfil"
        required
        error={errors.profileName}
      >
        <Input
          {...inputProps("profileName")}
          name="profileName"
          autoComplete="nickname"
          value={values.profileName}
          onChange={(event) => set("profileName", event.target.value)}
          className={controlClass}
        />
      </Field>

      <Field
        id={`${prefix}-walletAddress`}
        label="Endereço da carteira"
        required
        error={errors.walletAddress}
      >
        <Input
          {...inputProps("walletAddress")}
          name="walletAddress"
          autoComplete="off"
          spellCheck={false}
          placeholder="Endereço 0x da carteira"
          value={values.walletAddress}
          onChange={(event) => set("walletAddress", event.target.value)}
          className={controlClass}
        />
      </Field>

      <Field id={`${prefix}-secondaryWallet`} error={errors.secondaryWallet}>
        <Input
          id={`${prefix}-secondaryWallet`}
          name="secondaryWallet"
          aria-label="ENS ou carteira secundária (opcional)"
          autoComplete="off"
          spellCheck={false}
          placeholder="ENS ou carteira secundária (opcional)"
          value={values.secondaryWallet}
          onChange={(event) => set("secondaryWallet", event.target.value)}
          className={controlClass}
        />
      </Field>

      <Field
        id={`${prefix}-walletType`}
        label="Tipo de carteira"
        required
        error={errors.walletType}
      >
        <SelectField
          id={`${prefix}-walletType`}
          name="walletType"
          value={walletType ?? ""}
          error={errors.walletType}
          placeholder="Selecione uma carteira"
          options={WALLET_PROVIDERS.map((wallet) => ({
            value: wallet.id,
            label: wallet.label,
          }))}
          onValueChange={onWalletTypeChange}
          className={controlClass}
        />
      </Field>

      <Field
        id={`${prefix}-referralCode`}
        label="Código de indicação"
        error={errors.referralCode}
      >
        <Input
          id={`${prefix}-referralCode`}
          name="referralCode"
          autoComplete="off"
          value={values.referralCode}
          onChange={(event) => set("referralCode", event.target.value)}
          className={controlClass}
        />
      </Field>

      <Field id={`${prefix}-email`} label="E-mail" required error={errors.email}>
        <Input
          {...inputProps("email")}
          type="email"
          name="email"
          autoComplete="email"
          value={values.email}
          onChange={(event) => set("email", event.target.value)}
          className={controlClass}
        />
      </Field>

      <Field id={`${prefix}-ensName`} label="Nome ENS" error={errors.ensName}>
        <div className="flex">
          <Input
            id={`${prefix}-ensName`}
            name="ensName"
            autoComplete="off"
            spellCheck={false}
            placeholder="seu-nome"
            value={values.ensName}
            onChange={(event) => set("ensName", event.target.value)}
            className={cn(controlClass, "rounded-r-none")}
          />
          <span
            aria-hidden
            className="inline-flex h-10 shrink-0 items-center rounded-r-[4px] border border-l-0 border-foreground/70 px-3 text-sm text-muted-foreground"
          >
            .eth
          </span>
        </div>
      </Field>

      <FieldLabel
        htmlFor={`${prefix}-useOtherWallet`}
        className="mt-1 flex items-center gap-2 text-sm font-normal text-muted-foreground md:col-span-2"
      >
        <Checkbox
          id={`${prefix}-useOtherWallet`}
          name="useOtherWallet"
          aria-label="Usar outra carteira?"
          checked={values.useOtherWallet}
          onCheckedChange={(checked) => set("useOtherWallet", checked)}
          className="rounded-full border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight"
        />
        Usar outra carteira?
      </FieldLabel>

      <div className="mt-2 md:col-span-2">
        <label
          htmlFor={`${prefix}-note`}
          className="block text-sm text-muted-foreground"
        >
          Observação do colecionador (opcional)
        </label>
        <Textarea
          id={`${prefix}-note`}
          name="note"
          rows={6}
          value={values.note}
          onChange={(event) => set("note", event.target.value)}
          className={cn(
            controlClass,
            "mt-1.5 max-w-[350px] resize-y rounded-[4px] py-2 text-sm leading-6",
          )}
        />
      </div>
    </form>
  );
}

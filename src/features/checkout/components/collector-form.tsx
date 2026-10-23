import { useId, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CheckoutNetwork } from "../types/quote";
import { WALLET_PROVIDERS } from "../types/wallet";
import type {
  CollectorFormErrors,
  CollectorFormValues,
} from "../lib/collector-form";

const controlClass =
  "h-10 w-full rounded-[4px] border border-foreground/70 bg-transparent px-3 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus-visible:border-highlight focus-visible:outline-none aria-invalid:border-destructive";

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
    <div>
      {label ? (
        <label htmlFor={id} className="block text-sm text-muted-foreground">
          {label}
          {required && (
            <span className="text-highlight" aria-hidden>
              {" "}
              *
            </span>
          )}
        </label>
      ) : (
        <span aria-hidden className="block h-5" />
      )}
      <div className="mt-1.5">{children}</div>
      <p id={`${id}-error`} className="mt-1 min-h-4 text-xs text-destructive">
        {error}
      </p>
    </div>
  );
}

function SelectWrap({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      {children}
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
      />
    </div>
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
        <input
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
        <input
          {...inputProps("username")}
          name="username"
          autoComplete="username"
          value={values.username}
          onChange={(event) => set("username", event.target.value)}
          className={controlClass}
        />
      </Field>

      <Field id={`${prefix}-networkId`} label="Rede" required error={errors.networkId}>
        <SelectWrap>
          <select
            {...inputProps("networkId")}
            name="networkId"
            value={networkId}
            onChange={(event) => onNetworkChange(event.target.value)}
            className={cn(controlClass, "appearance-none pr-10")}
          >
            <option value="" disabled>
              Selecione uma rede
            </option>
            {networks.map((network) => (
              <option key={network.id} value={network.id}>
                {network.label}
              </option>
            ))}
          </select>
        </SelectWrap>
      </Field>

      <Field
        id={`${prefix}-profileName`}
        label="Nome do perfil"
        required
        error={errors.profileName}
      >
        <input
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
        <input
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
        <input
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
        <SelectWrap>
          <select
            {...inputProps("walletType")}
            name="walletType"
            value={walletType ?? ""}
            onChange={(event) => onWalletTypeChange(event.target.value)}
            className={cn(controlClass, "appearance-none pr-10")}
          >
            <option value="" disabled>
              Selecione uma carteira
            </option>
            {WALLET_PROVIDERS.map((wallet) => (
              <option key={wallet.id} value={wallet.id}>
                {wallet.label}
              </option>
            ))}
          </select>
        </SelectWrap>
      </Field>

      <Field
        id={`${prefix}-referralCode`}
        label="Código de indicação"
        error={errors.referralCode}
      >
        <input
          id={`${prefix}-referralCode`}
          name="referralCode"
          autoComplete="off"
          value={values.referralCode}
          onChange={(event) => set("referralCode", event.target.value)}
          className={controlClass}
        />
      </Field>

      <Field id={`${prefix}-email`} label="E-mail" required error={errors.email}>
        <input
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
          <input
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

      <label className="mt-1 flex items-center gap-2 text-sm text-muted-foreground md:col-span-2">
        <input
          type="checkbox"
          name="useOtherWallet"
          checked={values.useOtherWallet}
          onChange={(event) => set("useOtherWallet", event.target.checked)}
          className="size-4 appearance-none rounded-full border border-primary bg-transparent transition-colors checked:bg-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight"
        />
        Usar outra carteira?
      </label>

      <div className="mt-2 md:col-span-2">
        <label
          htmlFor={`${prefix}-note`}
          className="block text-sm text-muted-foreground"
        >
          Observação do colecionador (opcional)
        </label>
        <textarea
          id={`${prefix}-note`}
          name="note"
          rows={6}
          value={values.note}
          onChange={(event) => set("note", event.target.value)}
          className={cn(
            controlClass,
            "mt-1.5 h-auto max-w-[350px] resize-y py-2 leading-6",
          )}
        />
      </div>
    </form>
  );
}

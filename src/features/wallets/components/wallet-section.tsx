import { useState } from "react";
import { Star } from "lucide-react";

import type { CheckoutNetwork } from "@/features/checkout/types/quote";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

import { WalletForm } from "./wallet-form";
import { useSaveWallet } from "../hooks/use-save-wallet";
import { useDeleteWallet } from "../hooks/use-delete-wallet";
import { usePromoteWallet } from "../hooks/use-promote-wallet";
import {
  validateWalletForm,
  walletFieldOrder,
  walletToForm,
  type WalletFormErrors,
} from "../lib/wallet-form";
import { firstInvalid, focusField } from "@/lib/form-validation";
import { apiErrorBody, apiErrorMessage } from "@/lib/api-error";
import type { CollectorWallet, WalletInput, WalletKind } from "../types/wallet";
import { keepFilled, sampleCollector } from "@/lib/dev-fill";

export function WalletSection({
  kind,
  wallet,
  initialValues,
  networks,
  canPromote = false,
  onRemoved,
}: {
  kind: WalletKind;
  wallet: CollectorWallet | null;
  initialValues: WalletInput;
  networks: CheckoutNetwork[];
  canPromote?: boolean;
  onRemoved?: () => void;
}) {
  const formId = `wallet-${kind}-form`;
  const saveWallet = useSaveWallet();
  const deleteWallet = useDeleteWallet();
  const promoteWallet = usePromoteWallet();

  const [values, setValues] = useState<WalletInput>(
    wallet ? walletToForm(wallet) : initialValues,
  );
  const [errors, setErrors] = useState<WalletFormErrors>({});
  const [status, setStatus] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [loadedId, setLoadedId] = useState<string | null>(wallet?.id ?? null);
  const [confirmingRemoval, setConfirmingRemoval] = useState(false);

  if (wallet && loadedId !== wallet.id) {
    setLoadedId(wallet.id);
    setValues(walletToForm(wallet));
  }

  const addressFormat = networks.find(
    (network) => network.id === values.networkId,
  )?.addressFormat;

  function fillSample() {
    setValues((current) =>
      keepFilled(current, {
        displayName: sampleCollector.displayName,
        walletNickname: sampleCollector.walletNickname,
        networkId: sampleCollector.networkId,
        profileName: sampleCollector.profileName,
        address: sampleCollector.address,
        secondaryAddress: sampleCollector.secondaryAddress,
        walletType: sampleCollector.walletType,
        referralCode: sampleCollector.referralCode,
        email: sampleCollector.email,
        ensName: sampleCollector.ensName,
      }),
    );

    setErrors({});
  }

  function handleSubmit() {
    const nextErrors = validateWalletForm(values, addressFormat);

    setErrors(nextErrors);
    setStatus(null);
    setFailure(null);

    const firstKey = firstInvalid(walletFieldOrder, nextErrors);

    if (firstKey) {
      focusField(formId, firstKey);
      return;
    }

    saveWallet.mutate(
      { id: wallet?.id ?? null, values },
      {
        onSuccess: () => {
          setStatus(wallet ? "Carteira atualizada." : "Carteira cadastrada.");
        },

        onError: (error) => {
          const body = apiErrorBody(error);

          if (body?.errors) {
            setErrors(body.errors as WalletFormErrors);

            const serverKey = firstInvalid(
              walletFieldOrder,
              body.errors as WalletFormErrors,
            );

            if (serverKey) focusField(formId, serverKey);
          }

          setFailure(
            apiErrorMessage(error, "Não foi possível salvar a carteira."),
          );
        },
      },
    );
  }

  function handleRemove() {
    if (!wallet) return;

    setStatus(null);
    setFailure(null);

    deleteWallet.mutate(wallet.id, {
      onSuccess: () => {
        setConfirmingRemoval(false);
        onRemoved?.();
      },

      onError: (error) => {
        setConfirmingRemoval(false);
        setFailure(
          apiErrorMessage(error, "Não foi possível remover a carteira."),
        );
      },
    });
  }

  function handlePromote() {
    if (!wallet) return;

    setStatus(null);
    setFailure(null);

    promoteWallet.mutate(wallet.id, {
      onSuccess: () => setStatus("Carteira definida como principal."),
      onError: (error) =>
        setFailure(
          apiErrorMessage(error, "Não foi possível definir como principal."),
        ),
    });
  }

  return (
    <>
      <WalletForm
        id={formId}
        prefix={`wallet-${kind}`}
        values={values}
        errors={errors}
        networks={networks}
        addressFormat={addressFormat}
        status={status}
        failure={failure}
        saving={saveWallet.isPending}
        submitLabel={wallet ? "Salvar carteira" : "Adicionar carteira"}
        onChange={setValues}
        onSubmit={handleSubmit}
        onFill={fillSample}
        onRemove={wallet ? () => setConfirmingRemoval(true) : undefined}
        removing={deleteWallet.isPending}
        extraActions={
          canPromote && wallet ? (
            <button
              type="button"
              onClick={handlePromote}
              disabled={promoteWallet.isPending}
              className="inline-flex items-center gap-2 text-sm text-highlight transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60"
            >
              <Star className="size-4" aria-hidden />
              {promoteWallet.isPending
                ? "Definindo..."
                : "Tornar carteira principal"}
            </button>
          ) : null
        }
      />

      {confirmingRemoval && wallet && (
        <ConfirmDialog
          title="Remover carteira?"
          description={
            wallet.kind === "primary"
              ? "A carteira principal será removida. Se houver uma carteira secundária, ela passa a ser a principal. Pedidos já criados mantêm os dados da carteira usada na compra."
              : "A carteira secundária será removida. Pedidos já criados mantêm os dados da carteira usada na compra."
          }
          confirmLabel="Confirmar remoção"
          busyLabel="Removendo..."
          busy={deleteWallet.isPending}
          onConfirm={handleRemove}
          onCancel={() => setConfirmingRemoval(false)}
        />
      )}
    </>
  );
}

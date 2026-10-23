import { useState } from "react";

import type { CheckoutNetwork } from "@/features/checkout/types/quote";

import { WalletForm } from "./wallet-form";
import { useSaveWallet } from "../hooks/use-save-wallet";
import { useDeleteWallet } from "../hooks/use-delete-wallet";
import {
  validateWalletForm,
  walletFieldOrder,
  walletToForm,
  type WalletFormErrors,
} from "../lib/wallet-form";
import { firstInvalid, focusField } from "../lib/validation";
import { apiErrorBody, apiErrorMessage } from "../types/api-error";
import type { CollectorWallet, WalletInput, WalletKind } from "../types/wallet";

export function WalletSection({
  kind,
  wallet,
  initialValues,
  networks,
  onRemoved,
}: {
  kind: WalletKind;
  wallet: CollectorWallet | null;
  initialValues: WalletInput;
  networks: CheckoutNetwork[];
  onRemoved?: () => void;
}) {
  const formId = `wallet-${kind}-form`;
  const saveWallet = useSaveWallet();
  const deleteWallet = useDeleteWallet();

  const [values, setValues] = useState<WalletInput>(
    wallet ? walletToForm(wallet) : initialValues,
  );
  const [errors, setErrors] = useState<WalletFormErrors>({});
  const [status, setStatus] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [loadedId, setLoadedId] = useState<string | null>(wallet?.id ?? null);

  if (wallet && loadedId !== wallet.id) {
    setLoadedId(wallet.id);
    setValues(walletToForm(wallet));
  }

  function handleSubmit() {
    const nextErrors = validateWalletForm(values);

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
          setStatus(
            wallet ? "Carteira atualizada." : "Carteira cadastrada.",
          );
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
        onRemoved?.();
      },

      onError: (error) => {
        setFailure(
          apiErrorMessage(error, "Não foi possível remover a carteira."),
        );
      },
    });
  }

  return (
    <WalletForm
      id={formId}
      prefix={`wallet-${kind}`}
      values={values}
      errors={errors}
      networks={networks}
      status={status}
      failure={failure}
      saving={saveWallet.isPending}
      submitLabel={wallet ? "Salvar carteira" : "Adicionar carteira"}
      onChange={setValues}
      onSubmit={handleSubmit}
      onRemove={kind === "secondary" && wallet ? handleRemove : undefined}
      removing={deleteWallet.isPending}
    />
  );
}

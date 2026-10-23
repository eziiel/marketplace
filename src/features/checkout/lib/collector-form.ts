import {
  addressHint,
  isValidAddress,
  type AddressFormat,
} from "@/features/wallets/lib/address";

export interface CollectorFormValues {
  displayName: string;
  username: string;
  profileName: string;
  walletAddress: string;
  secondaryWallet: string;
  referralCode: string;
  email: string;
  ensName: string;
  useOtherWallet: boolean;
  note: string;
}

export type CollectorFormErrors = Partial<
  Record<keyof CollectorFormValues | "networkId" | "walletType", string>
>;

export const emptyCollectorForm: CollectorFormValues = {
  displayName: "",
  username: "",
  profileName: "",
  walletAddress: "",
  secondaryWallet: "",
  referralCode: "",
  email: "",
  ensName: "",
  useOtherWallet: false,
  note: "",
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateCollectorForm(
  values: CollectorFormValues,
  networkId: string,
  walletType: string | null,
  addressFormat?: AddressFormat,
): CollectorFormErrors {
  const errors: CollectorFormErrors = {};

  if (values.displayName.trim().length === 0) {
    errors.displayName = "Informe o nome de exibição.";
  }

  if (values.username.trim().length < 3) {
    errors.username = "Informe um nome de usuário com ao menos 3 caracteres.";
  }

  if (!networkId) {
    errors.networkId = "Selecione uma rede.";
  }

  if (values.profileName.trim().length === 0) {
    errors.profileName = "Informe o nome do perfil.";
  }

  if (!isValidAddress(values.walletAddress, addressFormat)) {
    errors.walletAddress = addressHint(addressFormat);
  }

  if (!walletType) {
    errors.walletType = "Selecione uma carteira.";
  }

  if (!EMAIL.test(values.email.trim())) {
    errors.email = "Informe um e-mail válido.";
  }

  return errors;
}

export const fieldOrder: (keyof CollectorFormErrors)[] = [
  "displayName",
  "username",
  "networkId",
  "profileName",
  "walletAddress",
  "walletType",
  "email",
];

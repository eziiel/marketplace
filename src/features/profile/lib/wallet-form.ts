import type { CollectorWallet, WalletInput, WalletKind } from "../types/wallet";
import { EMAIL, ENS_LABEL, WALLET_ADDRESS } from "./validation";

export type WalletFormErrors = Partial<Record<keyof WalletInput, string>>;

export const walletFieldOrder = [
  "displayName",
  "walletNickname",
  "networkId",
  "profileName",
  "address",
  "secondaryAddress",
  "walletType",
  "referralCode",
  "email",
  "ensName",
] as const;

export function emptyWalletForm(kind: WalletKind): WalletInput {
  return {
    kind,
    displayName: "",
    walletNickname: "",
    networkId: "",
    profileName: "",
    address: "",
    secondaryAddress: "",
    walletType: "",
    referralCode: "",
    email: "",
    ensName: "",
    ensDomain: ".eth",
  };
}

export function walletToForm(wallet: CollectorWallet): WalletInput {
  return {
    kind: wallet.kind,
    displayName: wallet.displayName,
    walletNickname: wallet.walletNickname,
    networkId: wallet.networkId,
    profileName: wallet.profileName,
    address: wallet.address,
    secondaryAddress: wallet.secondaryAddress,
    walletType: wallet.walletType,
    referralCode: wallet.referralCode,
    email: wallet.email,
    ensName: wallet.ensName,
    ensDomain: wallet.ensDomain,
  };
}

export function validateWalletForm(values: WalletInput): WalletFormErrors {
  const errors: WalletFormErrors = {};

  if (values.displayName.trim().length < 2) {
    errors.displayName = "Informe um nome de exibição com ao menos 2 caracteres.";
  }

  if (values.walletNickname.trim().length < 2) {
    errors.walletNickname = "Informe um apelido com ao menos 2 caracteres.";
  }

  if (!values.networkId) {
    errors.networkId = "Selecione uma rede.";
  }

  if (values.profileName.trim().length < 2) {
    errors.profileName = "Informe o nome do perfil.";
  }

  if (!WALLET_ADDRESS.test(values.address.trim())) {
    errors.address = "Informe um endereço 0x válido com 40 caracteres.";
  }

  const secondary = values.secondaryAddress.trim();

  if (
    secondary.length > 0 &&
    !WALLET_ADDRESS.test(secondary) &&
    !/^[a-z0-9-]{3,63}\.(eth|xyz|nft)$/.test(secondary.toLowerCase())
  ) {
    errors.secondaryAddress =
      "Informe um endereço 0x válido ou um nome ENS como colecionador.eth.";
  }

  if (!values.walletType) {
    errors.walletType = "Selecione um tipo de carteira.";
  }

  if (values.referralCode.trim().length === 0) {
    errors.referralCode = "Informe o código de indicação.";
  }

  if (!EMAIL.test(values.email.trim())) {
    errors.email = "Informe um e-mail válido.";
  }

  if (!ENS_LABEL.test(values.ensName.trim().toLowerCase())) {
    errors.ensName =
      "Use de 3 a 63 caracteres minúsculos, números ou hífen, sem hífen nas pontas.";
  }

  return errors;
}

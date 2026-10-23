import type { CollectorProfile, UpdateProfileInput } from "../types/profile";
import { EMAIL, ENS_LABEL, USERNAME } from "./validation";

export type ProfileFormErrors = Partial<
  Record<keyof UpdateProfileInput, string>
>;

export const profileFieldOrder = [
  "displayName",
  "username",
  "email",
  "ensName",
  "walletNickname",
] as const;

export const emptyProfileForm: UpdateProfileInput = {
  displayName: "",
  username: "",
  email: "",
  ensName: "",
  ensDomain: ".eth",
  walletNickname: "",
  avatar: null,
};

export function profileToForm(profile: CollectorProfile): UpdateProfileInput {
  return {
    displayName: profile.displayName,
    username: profile.username,
    email: profile.email,
    ensName: profile.ensName,
    ensDomain: profile.ensDomain,
    walletNickname: profile.walletNickname,
    avatar: profile.avatar,
  };
}

export function validateProfileForm(
  values: UpdateProfileInput,
): ProfileFormErrors {
  const errors: ProfileFormErrors = {};

  if (values.displayName.trim().length < 2) {
    errors.displayName = "Informe um nome de exibição com ao menos 2 caracteres.";
  }

  if (!USERNAME.test(values.username.trim())) {
    errors.username =
      "Use de 3 a 30 caracteres, apenas letras, números, ponto, hífen ou sublinhado.";
  }

  if (!EMAIL.test(values.email.trim())) {
    errors.email = "Informe um e-mail válido.";
  }

  if (!ENS_LABEL.test(values.ensName.trim().toLowerCase())) {
    errors.ensName =
      "Use de 3 a 63 caracteres minúsculos, números ou hífen, sem hífen nas pontas.";
  }

  if (values.walletNickname.trim().length < 2) {
    errors.walletNickname =
      "Informe um apelido com ao menos 2 caracteres.";
  }

  return errors;
}

import type { ChangePasswordInput } from "../types/profile";
import { MIN_PASSWORD_LENGTH } from "./validation";

export type PasswordFormErrors = Partial<
  Record<keyof ChangePasswordInput, string>
>;

export const passwordFieldOrder = [
  "currentPassword",
  "newPassword",
  "confirmPassword",
] as const;

export const emptyPasswordForm: ChangePasswordInput = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export function validatePasswordForm(
  values: ChangePasswordInput,
): PasswordFormErrors {
  const errors: PasswordFormErrors = {};

  if (values.currentPassword.length === 0) {
    errors.currentPassword = "Informe a senha atual.";
  }

  if (values.newPassword.length < MIN_PASSWORD_LENGTH) {
    errors.newPassword = `A nova senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  } else if (values.newPassword === values.currentPassword) {
    errors.newPassword = "A nova senha deve ser diferente da atual.";
  }

  if (values.confirmPassword !== values.newPassword) {
    errors.confirmPassword = "As senhas não coincidem.";
  }

  return errors;
}

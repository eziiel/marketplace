import { FormField } from "@/components/ui/form-field";
import { fieldControl } from "@/components/ui/field-control";
import { PasswordInput } from "@/features/auth/components/password-input";
import type { ChangePasswordInput } from "../types/profile";
import type { PasswordFormErrors } from "../lib/password-form";

export function PasswordFields({
  values,
  errors,
  onChange,
}: {
  values: ChangePasswordInput;
  errors: PasswordFormErrors;
  onChange: (values: ChangePasswordInput) => void;
}) {
  function set<K extends keyof ChangePasswordInput>(
    key: K,
    value: ChangePasswordInput[K],
  ) {
    onChange({ ...values, [key]: value });
  }

  return (
    <div className="max-w-[417px]">
      <h2 className="m-0 mb-5 text-base font-bold text-foreground">
        Alterar senha
      </h2>

      <p className="mb-5 text-sm text-muted-foreground">
        Preencha os três campos para trocar a senha. Deixe em branco para
        manter a senha atual.
      </p>

      <FormField
        id="profile-currentPassword"
        label="Senha atual"
        error={errors.currentPassword}
      >
        <PasswordInput
          {...fieldControl("profile-currentPassword", errors.currentPassword)}
          name="currentPassword"
          autoComplete="current-password"
          value={values.currentPassword}
          onChange={(event) => set("currentPassword", event.target.value)}
        />
      </FormField>

      <FormField
        id="profile-newPassword"
        label="Nova senha"
        error={errors.newPassword}
      >
        <PasswordInput
          {...fieldControl("profile-newPassword", errors.newPassword)}
          name="newPassword"
          autoComplete="new-password"
          value={values.newPassword}
          onChange={(event) => set("newPassword", event.target.value)}
        />
      </FormField>

      <FormField
        id="profile-confirmPassword"
        label="Confirmar nova senha"
        error={errors.confirmPassword}
      >
        <PasswordInput
          {...fieldControl("profile-confirmPassword", errors.confirmPassword)}
          name="confirmPassword"
          autoComplete="new-password"
          value={values.confirmPassword}
          onChange={(event) => set("confirmPassword", event.target.value)}
        />
      </FormField>
    </div>
  );
}

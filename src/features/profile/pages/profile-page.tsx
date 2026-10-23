import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { CheckCircle2, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

import { ProfileShell } from "../components/profile-shell";
import { ProfileFields } from "../components/profile-fields";
import { TestFillButton } from "@/components/ui/test-fill-button";
import { devFillEnabled, keepFilled, sampleCollector } from "@/lib/dev-fill";
import { PasswordFields } from "../components/password-fields";
import { useProfile } from "../hooks/use-profile";
import { useUpdateProfile } from "../hooks/use-update-profile";
import { useChangePassword } from "../hooks/use-change-password";
import {
  emptyProfileForm,
  profileFieldOrder,
  profileToForm,
  validateProfileForm,
  type ProfileFormErrors,
} from "../lib/profile-form";
import {
  emptyPasswordForm,
  passwordFieldOrder,
  validatePasswordForm,
  type PasswordFormErrors,
} from "../lib/password-form";
import { firstInvalid, focusField } from "@/lib/form-validation";
import {
  apiErrorBody,
  apiErrorMessage,
  isUnauthorized,
} from "@/lib/api-error";
import type { ChangePasswordInput, UpdateProfileInput } from "../types/profile";

const FORM_ID = "profile-form";

function ProfileSkeleton() {
  return (
    <div aria-label="Carregando perfil" className="grid gap-x-7 gap-y-6 md:grid-cols-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="space-y-3">
          <div className="h-4 w-32 animate-pulse rounded bg-card" />
          <div className="h-10 w-full animate-pulse rounded-[4px] bg-card" />
        </div>
      ))}
    </div>
  );
}

export function ProfilePage() {
  const navigate = useNavigate();
  const profileQuery = useProfile();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const [form, setForm] = useState<UpdateProfileInput>(emptyProfileForm);
  const [password, setPassword] =
    useState<ChangePasswordInput>(emptyPasswordForm);
  const [errors, setErrors] = useState<ProfileFormErrors>({});
  const [passwordErrors, setPasswordErrors] = useState<PasswordFormErrors>({});
  const [status, setStatus] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);

  const profile = profileQuery.data?.profile;
  const sessionExpired = isUnauthorized(profileQuery.error);

  useEffect(() => {
    if (sessionExpired) {
      void navigate({ to: "/", search: { page: 1, auth: "login" } });
    }
  }, [sessionExpired, navigate]);

  if (profile && loadedFor !== profile.userId) {
    setLoadedFor(profile.userId);
    setForm(profileToForm(profile));
  }

  const wantsPasswordChange =
    password.currentPassword.length > 0 ||
    password.newPassword.length > 0 ||
    password.confirmPassword.length > 0;

  function applyServerErrors(error: unknown): boolean {
    const body = apiErrorBody(error);

    if (!body?.errors) return false;

    const nextProfile: ProfileFormErrors = {};
    const nextPassword: PasswordFormErrors = {};

    for (const [key, message] of Object.entries(body.errors)) {
      if ((passwordFieldOrder as readonly string[]).includes(key)) {
        nextPassword[key as keyof PasswordFormErrors] = message;
      } else {
        nextProfile[key as keyof ProfileFormErrors] = message;
      }
    }

    if (Object.keys(nextProfile).length > 0) setErrors(nextProfile);
    if (Object.keys(nextPassword).length > 0) setPasswordErrors(nextPassword);

    const firstProfileKey = firstInvalid(profileFieldOrder, nextProfile);

    if (firstProfileKey) {
      focusField(FORM_ID, firstProfileKey);
      return true;
    }

    const firstPasswordKey = firstInvalid(passwordFieldOrder, nextPassword);

    if (firstPasswordKey) {
      focusField(FORM_ID, firstPasswordKey);
    }

    return true;
  }

  function fillSample() {
    setForm((current) =>
      keepFilled(current, {
        displayName: sampleCollector.displayName,
        username: sampleCollector.username,
        email: sampleCollector.email,
        ensName: sampleCollector.ensName,
        walletNickname: sampleCollector.walletNickname,
      }),
    );

    setErrors({});
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const profileErrors = validateProfileForm(form);
    const nextPasswordErrors = wantsPasswordChange
      ? validatePasswordForm(password)
      : {};

    setErrors(profileErrors);
    setPasswordErrors(nextPasswordErrors);
    setStatus(null);
    setFailure(null);

    const firstProfileKey = firstInvalid(profileFieldOrder, profileErrors);

    if (firstProfileKey) {
      focusField(FORM_ID, firstProfileKey);
      return;
    }

    const firstPasswordKey = firstInvalid(
      passwordFieldOrder,
      nextPasswordErrors,
    );

    if (firstPasswordKey) {
      focusField(FORM_ID, firstPasswordKey);
      return;
    }

    try {
      await updateProfile.mutateAsync(form);
    } catch (error) {
      if (!applyServerErrors(error)) {
        setFailure(
          apiErrorMessage(error, "Não foi possível salvar o perfil."),
        );
      }

      return;
    }

    if (!wantsPasswordChange) {
      setStatus("Perfil atualizado.");
      return;
    }

    try {
      await changePassword.mutateAsync(password);
      setPassword(emptyPasswordForm);
      setStatus("Perfil e senha atualizados.");
    } catch (error) {
      applyServerErrors(error);
      setFailure(
        `Perfil atualizado, mas a senha não foi alterada. ${apiErrorMessage(
          error,
          "Tente novamente.",
        )}`,
      );
    }
  }

  const saving = updateProfile.isPending || changePassword.isPending;

  return (
    <ProfileShell active="profile" current="Perfil do colecionador">
      <h1 className="m-0 mb-6 text-lg font-normal tracking-normal text-foreground">
        Perfil do colecionador
      </h1>

      {profileQuery.isPending && <ProfileSkeleton />}

      {profileQuery.isError && !sessionExpired && (
        <div className="space-y-3">
          <p
            role="alert"
            className="flex items-center gap-2 rounded-[4px] border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            <TriangleAlert className="size-4 shrink-0" aria-hidden />
            {apiErrorMessage(
              profileQuery.error,
              "Não foi possível carregar o perfil.",
            )}
          </p>
          <button
            type="button"
            onClick={() => void profileQuery.refetch()}
            className="text-sm font-bold text-highlight underline underline-offset-4 hover:text-foreground"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {profile && (
        <form id={FORM_ID} noValidate onSubmit={(event) => void handleSubmit(event)}>
          {devFillEnabled && (
            <TestFillButton onFill={fillSample} className="mb-5" />
          )}

          <ProfileFields values={form} errors={errors} onChange={setForm} />

          <div className="mt-6">
            <PasswordFields
              values={password}
              errors={passwordErrors}
              onChange={setPassword}
            />
          </div>

          <div aria-live="polite" className="mt-2 space-y-3">
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

          <Button
            type="submit"
            size="lg"
            disabled={saving}
            className="mt-4 h-10 rounded-[4px] px-10 text-sm font-bold"
          >
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </form>
      )}
    </ProfileShell>
  );
}

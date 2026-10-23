import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { fieldControl } from "@/components/ui/field-control";
import type { UpdateProfileInput } from "../types/profile";
import type { ProfileFormErrors } from "../lib/profile-form";
import { AvatarField } from "./avatar-field";
import { EnsField } from "./ens-field";

export function ProfileFields({
  values,
  errors,
  onChange,
}: {
  values: UpdateProfileInput;
  errors: ProfileFormErrors;
  onChange: (values: UpdateProfileInput) => void;
}) {
  function set<K extends keyof UpdateProfileInput>(
    key: K,
    value: UpdateProfileInput[K],
  ) {
    onChange({ ...values, [key]: value });
  }

  return (
    <div className="grid gap-x-7 gap-y-2 md:grid-cols-2">
      <Field
        id="profile-displayName"
        label="Nome de exibição"
        required
        error={errors.displayName}
      >
        <Input
          {...fieldControl("profile-displayName", errors.displayName)}
          name="displayName"
          autoComplete="name"
          value={values.displayName}
          onChange={(event) => set("displayName", event.target.value)}
        />
      </Field>

      <Field
        id="profile-username"
        label="Nome de usuário"
        required
        error={errors.username}
      >
        <Input
          {...fieldControl("profile-username", errors.username)}
          name="username"
          autoComplete="username"
          value={values.username}
          onChange={(event) => set("username", event.target.value)}
        />
      </Field>

      <Field id="profile-email" label="E-mail" required error={errors.email}>
        <Input
          {...fieldControl("profile-email", errors.email)}
          type="email"
          name="email"
          autoComplete="email"
          value={values.email}
          onChange={(event) => set("email", event.target.value)}
        />
      </Field>

      <Field
        id="profile-ensName"
        label="Nome ENS"
        required
        error={errors.ensName}
      >
        <EnsField
          id="profile-ensName"
          name="ensName"
          value={values.ensName}
          domain={values.ensDomain}
          error={errors.ensName}
          onValueChange={(value) => set("ensName", value)}
          onDomainChange={(domain) => set("ensDomain", domain)}
        />
      </Field>

      <Field
        id="profile-walletNickname"
        label="Apelido da carteira"
        required
        error={errors.walletNickname}
      >
        <Input
          {...fieldControl("profile-walletNickname", errors.walletNickname)}
          name="walletNickname"
          autoComplete="off"
          value={values.walletNickname}
          onChange={(event) => set("walletNickname", event.target.value)}
        />
      </Field>

      <AvatarField
        value={values.avatar}
        error={errors.avatar}
        onChange={(avatar) => set("avatar", avatar)}
      />
    </div>
  );
}

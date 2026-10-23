import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";
import { fieldControl } from "@/components/ui/field-control";
import { ENS_DOMAINS } from "@/lib/ens";

const DOMAIN_OPTIONS = ENS_DOMAINS.map((domain) => ({
  value: domain,
  label: domain,
}));

export function EnsField({
  id,
  name,
  value,
  domain,
  error,
  onValueChange,
  onDomainChange,
}: {
  id: string;
  name: string;
  value: string;
  domain: string;
  error?: string;
  onValueChange: (value: string) => void;
  onDomainChange: (domain: string) => void;
}) {
  return (
    <div className="flex gap-3">
      <SelectField
        id={`${id}-domain`}
        name={`${name}Domain`}
        label="Domínio ENS"
        value={domain}
        options={DOMAIN_OPTIONS}
        onValueChange={onDomainChange}
        className="w-[94px] shrink-0 px-3"
      />

      <Input
        {...fieldControl(id, error)}
        name={name}
        autoComplete="off"
        spellCheck={false}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
      />
    </div>
  );
}

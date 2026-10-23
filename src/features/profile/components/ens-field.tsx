import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { fieldControl } from "@/components/ui/field-control";
import { ENS_DOMAINS } from "../types/profile";

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
      <Select
        name={`${name}Domain`}
        aria-label="Domínio ENS"
        value={domain}
        onChange={(event) => onDomainChange(event.target.value)}
        className="w-[94px] shrink-0 px-3 pr-8"
      >
        {ENS_DOMAINS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </Select>

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
